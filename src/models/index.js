const sequelize = require('../config/database');
const AdminUser = require('./AdminUser');
const SiteSetting = require('./SiteSetting');
const NewsItem = require('./NewsItem');
const Testimonial = require('./Testimonial');
const Achievement = require('./Achievement');
const CommitteeMember = require('./CommitteeMember');
const Alumni = require('./Alumni');
const GalleryItem = require('./GalleryItem');
const Subscriber = require('./Subscriber');
const BlogPost = require('./BlogPost');
const Donation = require('./Donation');
const Banner = require('./Banner');
const AboutImage = require('./AboutImage');
const Counter = require('./Counter');

const models = {
  AdminUser,
  SiteSetting,
  NewsItem,
  Testimonial,
  Achievement,
  CommitteeMember,
  Alumni,
  GalleryItem,
  Subscriber,
  BlogPost,
  Donation,
  Banner,
  AboutImage,
  Counter,
};

module.exports = {
  sequelize,
  ...models,
};
