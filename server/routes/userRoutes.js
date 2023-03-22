const express = require('express');
const { authenticate } = require('./../auth/auth.js');
const userController = require('./../controller/userController');
const router = express.Router();

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/home', authenticate, userController.getUser);

router.delete('/logout', authenticate, userController.logoutUser);

module.exports = router;