const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NewsItem = sequelize.define('NewsItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'news_items',
});

module.exports = NewsItem;
