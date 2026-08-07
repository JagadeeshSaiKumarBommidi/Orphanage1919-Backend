const { sequelize, AdminUser, SiteSetting, Testimonial, NewsItem, Achievement, CommitteeMember, Alumni, GalleryItem, Counter } = require('../models');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const defaultSettings = [
  { key: 'org_name', value: 'Anaadha Vidyarthi Griha' },
  { key: 'org_tagline', value: 'CARE. SUPPORT. HOPE.' },
  { key: 'hero_title', value: 'Every Child Deserves a Better Tomorrow' },
  { key: 'hero_subtitle', value: 'Together, we can build a world where every child is loved, cared for, and given the opportunity to dream, learn and grow.' },
  { key: 'org_established', value: '1919' },
  { key: 'org_registered', value: '1952' },
  { key: 'org_present_students', value: '100' },
  { key: 'org_successful_alumni', value: '1300' },
  { key: 'org_subscribers', value: '3000' },
  { key: 'org_address', value: 'L.B. Nagar, Hyderabad, Telangana, 500074' },
  { key: 'org_telephone', value: '040-24031919' },
  { key: 'org_mobile', value: '+91 98480 22338' },
  { key: 'org_email', value: 'info@avgorphanage.org' },
  { key: 'org_website', value: 'www.avgorphanage.org' },
  { key: 'vision_text', value: 'Facilitating the deserving orphan and poor students in all aspects to pursue their higher studies thereby realise their aspirations & goals and stand on their own in the society as successful citizens in all parameters' },
  { key: 'mission_text', value: "Getting construction of 'AVG Golden Jubliee Home' to embrace more number of deserving orphan and poor students." },
  { key: 'appeal_text', value: 'Earnestly appeal all to participate in fulfillment of ‘AVG Mission’ by donating generously With such help and blessings of many philanthropists only, the ‘AVG Vision’ could last long.' },
  { key: 'about_brief', value: 'Self-administration is the life line of AVG. AVGians are Administrators, Wardens, Caretakers and Cooks. The entire daily activities are carried out by the inmates themselves.' },
  { key: 'history_intro', value: 'AVG was established in the year 1919 by great social reformers.' },
  { key: 'history_brief', value: 'We have traversed a long path, supporting thousands of kids who have now become successful software engineers, doctors, and officers.' },
  { key: 'history_struggle', value: 'From 1919 to 1952, the organization was run under severe financial constraints before getting registered.' },
  { key: 'funds_intro', value: 'Every rupee Supportd goes directly to child welfare. We accept contributions in various funds.' },
  { key: 'admissions_intro', value: 'Our Screening Committee scrutinizes applications to select the most deserving merit-based orphan/poor kids.' },
  { key: 'admissions_criteria', value: '[{"icon":"UserCheck","title":"Orphan","desc":"With no financial and relatives support."},{"icon":"Heart","title":"Semi Orphan","desc":"Either mother or father alive and who have merit."},{"icon":"Users","title":"Poor","desc":"No financial support from family members, high merit, dedication and determination."},{"icon":"BookOpen","title":"Education Gap","desc":"If there is any gap in education, revival of education will be provided."},{"icon":"GraduationCap","title":"No Discrimination","desc":"No caste, creed, community, religion or region difference."}]' },
  { key: 'admissions_process', value: '["A systematic, scientific and pragmatic way is designed to invite all the poor students staying all over Telangana & Andhra Pradesh by giving press release and putting it in all the colleges.","The stupendous job of scrutinising the applications is made by a SCREENING COMMITTEE, unanimously appointed by our Managing Committee every year well before the new academic year starts.","Mostly these Screening Committee members are academicians with doctorates, philanthropists, well-wishers, donors, and others committed to the cause of helping the needy.","After the selections made by the esteemed Screening Committee Members, the selected students are short-listed and the process of admission begins.","Since the last ten years, the Board of Management is able to accommodate around 100 students as of today."]' },
  { key: 'admissions_education', value: '[{"icon":"BookOpen","title":"Colleges","desc":"Multiple esteemed colleges provide free admission to AVG inmates."},{"icon":"ClipboardCheck","title":"Coaching Centers","desc":"Coaching centers support our students for competitive exams."},{"icon":"GraduationCap","title":"Other Institutions","desc":"Various institutions offer free education across courses."}]' },
  { key: 'contact_intro', value: 'Reach out to us to visit, volunteer, or support in any way you can.' },
  { key: 'donation_intro', value: 'Help us by donating online or sponsoring meals for the inmates.' },
  { key: 'task_ahead_intro', value: 'Our upcoming project is to construct a modern hostel facility to support more kids.' },
];

async function ensureDbExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'orphanage'}\`;`);
  await connection.end();
}

async function seed() {
  try {
    await ensureDbExists();
    await sequelize.sync({ force: true });
    console.log('Database tables cleared and synchronized.');

    // Seed default admin
    const hashedPassword = await bcrypt.hash('123123', 10);
    await AdminUser.create({
      email: 'avg@admin.com',
      password: hashedPassword,
    });
    console.log('Default admin user created: avg@admin.com / 123123');

    // Seed settings
    for (const setting of defaultSettings) {
      await SiteSetting.create(setting);
    }
    console.log('Default site settings seeded.');

    // Seed a couple of testimonials
    await Testimonial.bulkCreate([
      { quote: 'AVG gave me a new lease of life. Today I am a software engineer because of the support I received here.', author: 'Ramesh K., Batch of 2012', display_order: 1 },
      { quote: 'A unique institution run by the students themselves. It teaches responsibility and community living.', author: 'Dr. Srinivas Rao, Philanthropist', display_order: 2 }
    ]);
    console.log('Sample testimonials seeded.');

    // Seed a couple of achievements
    await Achievement.bulkCreate([
      { title: '100% Pass Percentage in Intermediate Board Exams', description: 'All our second-year intermediate students passed with flying colors.', date: '2026-05-10', image_url: 'https://images.pexels.com/photos/8617715/pexels-photo-8617715.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { title: 'Sports Meet Winners', description: 'AVGians won the district-level volleyball tournament.', date: '2026-06-15', image_url: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=600' }
    ]);
    console.log('Sample achievements seeded.');

    // Seed a couple of news items
    await NewsItem.bulkCreate([
      { title: 'Admissions Open for Academic Year 2026-27', content: 'Applications are invited from eligible orphan and poor students for admission.', date: '2026-07-01', image_url: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { title: 'Annual Day Celebrations', content: 'AVG celebrated its annual day with cultural programs by the children.', date: '2026-07-15', image_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600' }
    ]);
    console.log('Sample news items seeded.');

    // Seed a couple of committee members
    await CommitteeMember.bulkCreate([
      { name: 'G. Rama Chandra Reddy', designation: 'President', category: 'Office Bearers', display_order: 1 },
      { name: 'K. Mallikarjuna Rao', designation: 'Secretary', category: 'Office Bearers', display_order: 2 },
      { name: 'Dr. P. Venkateswarlu', designation: 'Managing Committee Member', category: 'Managing Committee', display_order: 3 },
      { name: 'Justice B. Chandra Kumar', designation: 'Adviser', category: 'Advisory Board', display_order: 4 }
    ]);
    console.log('Sample committee members seeded.');

    // Seed alumni
    await Alumni.bulkCreate([
      { name: 'Suresh Kumar', batch: '2008-2010', occupation: 'Software Engineer at TCS', display_order: 1 },
      { name: 'Mahesh Babu', batch: '2011-2013', occupation: 'Bank PO, SBI', display_order: 2 }
    ]);
    console.log('Sample alumni seeded.');

    // Seed gallery
    await GalleryItem.bulkCreate([
      { title: 'Study Hours', image_url: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Education', display_order: 1 },
      { title: 'Dining Hall', image_url: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Facilities', display_order: 2 }
    ]);
    console.log('Sample gallery items seeded.');

    // Starting point for official receipt numbering — adjust in Admin -> Admin
    // Settings if this needs to continue from an existing physical receipt book.
    await Counter.create({ name: 'receipt_no', value: 10000 });
    console.log('Receipt number counter initialized at 10000.');

    console.log('All seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
