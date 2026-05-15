const express = require('express');
const router = express.Router();
const smsController = require('../controller/smsController');

// POST - Save new Notification message
router.post('/save', smsController.saveMessage);

// GET - Get latest messages
router.get('/latest', smsController.getLatestMessages);

// POST - Mark specific messages as read
router.post('/read', smsController.markAsRead);

// GET - Wipe database of all data
router.get('/delete-db', smsController.deleteDb);

module.exports = router;