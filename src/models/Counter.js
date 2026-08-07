const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Internal counters (e.g. the next official receipt number). Not exposed for
// public insert/update — only readable via the generic API, writes require admin auth.
const Counter = sequelize.define('Counter', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
}, {
  tableName: 'counters',
  timestamps: true,
});

module.exports = Counter;
