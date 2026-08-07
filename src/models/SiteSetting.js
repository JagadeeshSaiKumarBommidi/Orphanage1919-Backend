const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteSetting = sequelize.define('SiteSetting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'site_settings',
  timestamps: true,
});

module.exports = SiteSetting;
