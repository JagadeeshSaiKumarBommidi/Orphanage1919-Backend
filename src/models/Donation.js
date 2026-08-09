const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  donor_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  donor_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  donor_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  donor_pan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  donor_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  donation_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'online',
  },
  meal_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  donation_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  payment_mode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reference_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  receipt_no: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
  }
}, {
  tableName: 'donations',
});

module.exports = Donation;
