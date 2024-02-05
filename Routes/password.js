const express = require('express');
const passwordController = require('../Controller/password');

const router = express.Router();

router.get('/updatepassword/:resetpasswordid', passwordController.updatepassword)

router.get('/resetpassword/:id', passwordController.resetpassword)

router.use('/forgotpassword', passwordController.forgotpassword)

module.exports = router;
