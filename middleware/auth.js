const jwt = require('jsonwebtoken');
const User = require('../Model/user');

const SECRET_KEY = 'e7!dMxT#c?UvJ7!PAn*FKNtXAQsfmz!6';

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log('Token:', token);

        if (!token) {
            console.error('Token not provided');
            return res.status(401).json({ success: false, message: 'Unauthorized: Token not provided' });
        }

        const user = jwt.verify(token, SECRET_KEY);
        console.log('Decoded user ID:', user.userId);

        const foundUser = await User.findByPk(user.userId);
        if (!foundUser) {
            console.error('User not found');
            return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        }

        req.user = foundUser;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

module.exports = {
    authenticate,
};
