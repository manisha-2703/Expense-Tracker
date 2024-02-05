const { Op, Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');
const uploadToS3 = require('../services/s3services');
const Expense = require('../Model/expense');
const User = require('../Model/user');
const DownloadHistory = require('../Model/report');

exports.getAllExpenses = async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const parsedPageSize = parseInt(pageSize, 10) || 10;

    try {
        const expenses = await Expense.findAll({
            where: { UserId: req.user.id },
            limit: parsedPageSize,
            offset: (page - 1) * parsedPageSize,
        });

        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.addExpense = async (req, res) => {
    const { expense, description, category } = req.body;
    console.log('Received expense data:', { expense, description, category });

    let t;

    try {
        t = await sequelize.transaction();

        const newExpense = await Expense.create(
            { expense, description, category, UserId: req.user.id },
            { transaction: t }
        );
        console.log('New expense created:', newExpense);

        const userId = req.user.id;
        const totalExpenses = await Expense.sum('expense', { where: { UserId: userId }, transaction: t });

        await User.update({ totalExpenses }, { where: { id: userId }, transaction: t });

        await t.commit();

        res.status(201).json(newExpense);
    } catch (err) {
        console.error(err);
        if (t) await t.rollback();
        res.status(500).json(err);
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    let t;

    try {
        t = await sequelize.transaction();

        const deletedExpense = await Expense.findByPk(id, { transaction: t });

        await Expense.destroy({ where: { id }, transaction: t });

        const userId = req.user.id;
        const totalExpenses = await Expense.sum('expense', { where: { UserId: userId }, transaction: t });

        await User.update({ totalExpenses }, { where: { id: userId }, transaction: t });

        await t.commit();
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        if (t) await t.rollback();
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { expense, description, category } = req.body;

    try {
        const updatedExpense = await Expense.update(
            { expense, description, category },
            { where: { id } }
        );

        res.json(updatedExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.downloadExpense = async (req, res) => {
  try {
      const userId = req.user.id;

      const expenses = await Expense.findAll({
          where: {
              UserId: userId,
              date: {
                  [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
              },
          },
      });

      const csvData = convertToCSV(expenses);
      const filename = `Expense${userId}/${new Date().toISOString()}.csv`;
      const fileURL = await uploadToS3(csvData, filename);

      await DownloadHistory.create({
        UserId: userId,
          fileUrl: fileURL,
          downloadDate: new Date(),
      });

      res.status(200).json({ fileURL, success: true });
  } catch (err) {
      console.log(err);
      res.status(500).json({ fileURL: '', success: false, err: err.message || err });
  }
};


exports.getDownloadHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const downloadHistory = await DownloadHistory.findAll({
            where: { UserId: userId },
            attributes: ['fileUrl', 'downloadDate'],
        });

        res.status(200).json({ downloadHistory, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ downloadHistory: [], success: false, err: err.message || err });
    }
};

function convertToCSV(expenses) {
    let csvContent = 'Expense,Description,Category\n';
    expenses.forEach((expense) => {
        csvContent += `${expense.expense},${expense.description},${expense.category}\n`;
    });
    return csvContent;
}
