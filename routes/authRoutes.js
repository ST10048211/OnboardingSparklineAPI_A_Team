const express = require('express');
const router = express.Router();
const { onboardEmployee, login, changePassword, subsequentLogin, getNextEmployeeId } = require('../controllers/authController');

// Route for onboarding employee (sending OTP)
router.post('/onboard', onboardEmployee);

// Route for OTP login (first-time login with OTP)
router.post('/loginotp', login);

// Route for changing password after OTP login
router.post('/change-password', changePassword);

// Route for subsequent login with the new password
router.post('/login', subsequentLogin);

// Route for subsequent login with the new password
router.get('/nextempid', getNextEmployeeId);

module.exports = router;
