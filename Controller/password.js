const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const User = require('../Model/user');
const Forgotpassword = require('../Model/password');
const path = require('path');
const { Op } = require('sequelize'); // Import Op from Sequelize
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mandlipallimanisha123@gmail.com',
    pass: process.env.APP_PASSWORD,
  },
});

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const id = uuidv4();
      await user.createForgotpassword({ id, active: true });

      const mailOptions = {
        from: 'mandlipallimanisha123@gmail.com',
        to: email,
        subject: 'Reset Password',
        html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          throw new Error(error);
        } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).json({
            message: 'Link to reset password sent to your mail',
            success: true,
          });
        }
      });
    } else {
      throw new Error("User doesn't exist");
    }
  } catch (err) {
    console.error(err);
    return res.json({ message: err.message, success: false });
  }
};

const resetpassword = (req, res) => {
  const id = req.params.id;

  // Check if id is provided
  if (!id) {
    return res.status(400).json({ error: 'Invalid reset password request', success: false });
  }

  console.log('Reset Password Request ID:', id);

  Forgotpassword.findOne({ where: { id, active: true } })
    .then((forgotpasswordrequest) => {
      console.log('Forgot Password Request:', forgotpasswordrequest);

      if (forgotpasswordrequest) {
        // Render the form
        res.status(200).send(`<html>
          <script>
            function formsubmitted(e){
              e.preventDefault();
              console.log('called')
            }
          </script>
          <form action="/password/updatepassword/${id}" method="get">
            <label for="newpassword">Enter New password</label>
            <input name="newpassword" type="password" required></input>
            <button>reset password</button>
          </form>
        </html>`);

        res.end();
      } else {
        return res.status(400).json({ error: 'Invalid reset password request', success: false });
      }
    })
    .catch((error) => {
      console.error('Error finding Forgotpassword record:', error);
      res.status(500).json({ error: 'Internal Server Error', success: false });
    });
};

const updatepassword = (req, res) => {
  try {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;

    // Check if newpassword is provided
    if (!newpassword) {
      return res.status(400).json({ error: 'New password is required', success: false });
    }

    Forgotpassword.findOne({
      where: { id: resetpasswordid, active: true },
    }).then((resetpasswordrequest) => {
      console.log('Reset Password Request:', resetpasswordrequest);

      if (!resetpasswordrequest) {
        console.log('Invalid reset password request:', resetpasswordrequest);
        return res.status(400).json({ error: 'Invalid reset password request', success: false });
      }

      User.findOne({
        where: { id: resetpasswordrequest.UserId },
      }).then((user) => {
        console.log('User:', user);

        if (user) {
          // encrypt the new password
          const saltRounds = 10;
          bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
              console.log(err);
              throw new Error(err);
            }
            bcrypt.hash(newpassword, salt, function (err, hash) {
              if (err) {
                console.log(err);
                throw new Error(err);
              }

              // Update user's password
              user.update({ password: hash }).then(() => {
                // Invalidate the reset password request
                resetpasswordrequest.update({ active: false }).then(() => {
                  console.log('Password updated successfully.');
                  res.status(201).json({
                    message: 'Successfully updated the new password',
                    success: true,
                  });
                });
              });
            });
          });
        } else {
          console.log('No user exists with the given ID.');
          return res.status(404).json({ error: 'No user exists', success: false });
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error', success: false });
  }
};

module.exports = {
  forgotpassword,
  updatepassword,
  resetpassword,
};
