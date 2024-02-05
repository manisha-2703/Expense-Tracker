const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');
// const Expense = require('./expense');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ispremiumuser: DataTypes.BOOLEAN,
  totalExpenses: {
    type: DataTypes.FLOAT, 
    defaultValue: 0, 
  },
});

// User.hasMany(Expense);
// Expense.belongsTo(User); 
module.exports = User;
