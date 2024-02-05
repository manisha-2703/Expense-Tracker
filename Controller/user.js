const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Model/user');

const TOKEN_SECRET = process.env.TOKEN_SECRET;

// Function to generate access token
function generateAccessToken(id) {
    return jwt.sign({ userId: id }, TOKEN_SECRET);
}

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists. Please log in.' });
        }

        // Generate a salt and hash the password
        const saltRounds = 10; // You can adjust the number of salt rounds as needed
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user with the hashed password
        const newUser = await User.create({ name, email, password: hashedPassword });

        // Generate token and send it in the response
        //const token = generateAccessToken(newUser.id);
        //res.json({ token, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email exists in the database
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // User not found
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Passwords match, generate a token
            const token = generateAccessToken(user.id);

            // Send the token in the response
            res.json({ token, user });
        } else {
            // Passwords don't match
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.profile = async(req,res)=>{
    try {
        // Fetch user details with premium status
        const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'email', 'ispremiumuser'] });
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        res.json(user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}