const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Admin-marked holidays. On these dates, Lunch becomes sponsorable in addition
// to the standing Sunday / 2nd-Saturday rule (see dbController.isLunchAvailable).
const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'holidays',
});

module.exports = Holiday;
