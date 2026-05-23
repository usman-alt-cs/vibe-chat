const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.put('/profile', userController.updateProfile);

module.exports = router;
