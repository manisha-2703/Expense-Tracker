const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet=require('helmet');
const compression=require('compression');
const morgan=require('morgan');
const fs=require('fs');
const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./util/database');
const expenseRoutes = require('./Routes/expense');
const userRoutes = require('./Routes/user');
const purchaseRoutes = require('./Routes/purchase');
const premiumRoutes=require('./Routes/premiumFeature');
const passwordRoutes=require('./Routes/password');
const app = express();


app.use(express.json());

const Expense = require('./Model/expense');
const User = require('./Model/user');
const Order=require('./Model/orders');
const Forgotpassword=require('./Model/password');
const DownloadedFile=require('./Model/report');
const { sync } = require('touch');

const accessLogStream=fs.createWriteStream(
    path.join(__dirname,'access.log'),
    { flags:'a'}
    
    );

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined',{stream:accessLogStream}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/expenses', expenseRoutes);
app.use('/users', userRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium',premiumRoutes);
app.use('/password',passwordRoutes);


User.hasMany(Expense);
Expense.belongsTo(User); 

User.hasMany(Order);
Order.belongsTo(User);

Forgotpassword.belongsTo(User);
User.hasMany(Forgotpassword);

User.hasMany(DownloadedFile);
DownloadedFile.belongsTo(User)


sequelize.sync()
    .then(() => {
        return User.findByPk(1);
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });

    const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});