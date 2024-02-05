const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

//id, name , password, phone number, role

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    paymentid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    orderid: {
        type: DataTypes.STRING,
      },
    status: {
        type: DataTypes.STRING,
      },
})

module.exports = Order;

