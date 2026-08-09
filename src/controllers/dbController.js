const models = require('../models');
const { Op } = require('sequelize');

// Expected, user-facing rejections (bad input / business rule) — not server bugs.
// Kept distinct from real errors so the console doesn't log a scary stack trace
// every time a donor picks an invalid date/meal combo.
class ValidationError extends Error {}

// Lunch is offered on Sundays, the 2nd Saturday of each month, or any admin-marked
// holiday — mirrors the same rule enforced client-side in SupportMealPage.tsx.
async function isLunchAvailable(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0) return true;
  if (day === 6 && Math.ceil(d / 7) === 2) return true;

  const holiday = await models.Holiday.findOne({ where: { date: dateStr } });
  return !!holiday;
}

const VALID_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

function getModel(tableName) {
  switch (tableName) {
    case 'site_settings': return models.SiteSetting;
    case 'news_items': return models.NewsItem;
    case 'testimonials': return models.Testimonial;
    case 'achievements': return models.Achievement;
    case 'committee_members': return models.CommitteeMember;
    case 'alumni': return models.Alumni;
    case 'gallery_items': return models.GalleryItem;
    case 'subscribers': return models.Subscriber;
    case 'blog_posts': return models.BlogPost;
    case 'donations': return models.Donation;
    case 'admin_users': return models.AdminUser;
    case 'banners': return models.Banner;
    case 'about_images': return models.AboutImage;
    case 'counters': return models.Counter;
    case 'holidays': return models.Holiday;
    default: throw new Error(`Unknown table: ${tableName}`);
  }
}

exports.handleQuery = async (req, res) => {
  try {
    const {
      table,
      method,
      filterCol,
      filterVal,
      orderCol,
      orderAscending,
      limit,
      data
    } = req.body;

    const Model = getModel(table);
    const options = {};

    // Apply where filters
    if (req.body.orConditions && Array.isArray(req.body.orConditions) && req.body.orConditions.length > 0) {
      const clauses = req.body.orConditions
        .filter(c => c.field && c.value !== undefined && c.value !== null && String(c.value).trim() !== '')
        .map(c => ({ [c.field]: String(c.value).trim() }));
      if (clauses.length > 0) {
        options.where = { [Op.or]: clauses };
      }
    } else if (filterCol && filterVal !== undefined) {
      options.where = { [filterCol]: filterVal };
    } else if (req.body.filters) {
      options.where = req.body.filters;
    }

    // Apply ordering
    if (orderCol) {
      options.order = [[orderCol, orderAscending ? 'ASC' : 'DESC']];
    }

    // Apply limit
    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    let resultData = null;

    switch (method) {
      case 'select':
        resultData = await Model.findAll(options);
        break;

      case 'insert':
        if (table === 'donations') {
          const checkItem = async (item) => {
            if (item.donation_type === 'meal') {
              if (!VALID_MEAL_TYPES.includes(item.meal_type)) {
                throw new ValidationError('Please select a valid meal (Breakfast, Lunch, or Dinner).');
              }
              if (!item.donation_date) {
                throw new ValidationError('A meal date is required.');
              }
              if (item.meal_type === 'Lunch' && !(await isLunchAvailable(item.donation_date))) {
                throw new ValidationError('Lunch can only be sponsored on Sundays, the 2nd Saturday of the month, or an admin-marked holiday.');
              }

              const existing = await models.Donation.findOne({
                where: {
                  donation_type: 'meal',
                  meal_type: item.meal_type,
                  donation_date: item.donation_date
                }
              });
              if (existing) {
                throw new ValidationError(`The ${item.meal_type} has already been sponsored on ${item.donation_date}.`);
              }
            }
          };

          if (Array.isArray(data)) {
            for (const item of data) {
              await checkItem(item);
            }
            resultData = await Model.bulkCreate(data);
          } else {
            await checkItem(data);
            resultData = await Model.create(data);
          }
        } else {
          if (Array.isArray(data)) {
            resultData = await Model.bulkCreate(data);
          } else {
            resultData = await Model.create(data);
          }
        }
        break;

      case 'update':
        if (!filterCol || filterVal === undefined) {
          return res.status(400).json({ error: 'Update requires a filter condition (eq)' });
        }
        await Model.update(data, { where: { [filterCol]: filterVal } });
        // Retrieve and return the updated records
        resultData = await Model.findAll({ where: { [filterCol]: filterVal } });
        break;

      case 'delete':
        if (!filterCol || filterVal === undefined) {
          return res.status(400).json({ error: 'Delete requires a filter condition (eq)' });
        }
        const count = await Model.destroy({ where: { [filterCol]: filterVal } });
        resultData = count;
        break;

      case 'upsert':
        if (Array.isArray(data)) {
          const results = [];
          for (const item of data) {
            const [record] = await Model.upsert(item);
            results.push(record);
          }
          resultData = results;
        } else {
          const [record] = await Model.upsert(data);
          resultData = record;
        }
        break;

      default:
        return res.status(400).json({ error: `Unsupported method: ${method}` });
    }

    return res.json({ data: resultData, error: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      console.warn(`DB Controller rejected [${req.body.method} ${req.body.table}]: ${err.message}`);
      return res.status(400).json({ data: null, error: { message: err.message } });
    }
    console.error('DB Controller Error:', err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
};

// Assigns the next official receipt number to a donation, exactly once, the first
// time a receipt is issued for it (lazy — Pending/Failed donations never burn a
// number). Atomic via a row-locked transaction so concurrent admins can't collide.
exports.assignReceiptNo = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Donation id is required' });
  }

  try {
    const receiptNo = await models.sequelize.transaction(async (t) => {
      const donation = await models.Donation.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!donation) {
        throw new Error('Donation not found');
      }
      if (donation.receipt_no) {
        return donation.receipt_no;
      }

      const [counter] = await models.Counter.findOrCreate({
        where: { name: 'receipt_no' },
        defaults: { value: 10000 },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const next = counter.value + 1;
      await counter.update({ value: next }, { transaction: t });
      await donation.update({ receipt_no: next }, { transaction: t });
      return next;
    });

    return res.json({ data: { receipt_no: receiptNo }, error: null });
  } catch (err) {
    console.error('Assign Receipt No Error:', err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
};
