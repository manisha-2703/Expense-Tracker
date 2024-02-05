const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const DownloadHistory = sequelize.define('DownloadHistory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    downloadDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});

module.exports = DownloadHistory;
