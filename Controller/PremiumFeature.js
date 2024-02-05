const User = require('../Model/user');
const Expense = require('../Model/expense');
const sequelize = require('../util/database');

const getUserLeaderBoard = async (req, res) => {
    try {
        const leaderboardofusers = await User.findAll({
            attributes: ['id', 'name', 'totalExpenses'], // Updated to use totalExpenses
            order: [['totalExpenses', 'DESC']]
        });

        res.status(200).json(leaderboardofusers);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

module.exports = {
    getUserLeaderBoard
};
