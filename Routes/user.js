const path = require('path');
const express = require('express');
const userController = require('../Controller/user');
const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile',authenticatemiddleware.authenticate,userController.profile);

module.exports = router;