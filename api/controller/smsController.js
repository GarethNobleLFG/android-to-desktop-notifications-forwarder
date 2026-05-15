const notiService = require('../services/notiServices');
const notiRepos = require('../repositories/messageRepository');

// Create new Notification message
const saveMessage = async (req, res) => {
    try {
        const { app_package, title, message } = req.body;

        if (!app_package) {
            return res.status(400).json({
                error: 'Missing required fields: app_package'
            });
        }

        const savedMessage = await notiService.saveNotification(req.body);

        console.log(`New push notification saved from ${app_package} (${title}): ${String(message).substring(0, 50)}...`);

        res.status(201).json({
            status: 'success',
            message: 'Notification saved successfully',
            id: savedMessage._id
        });
    }
    catch (error) {
        console.error('Error saving Notification:', error);
        res.status(500).json({
            error: 'Failed to save Notification',
            details: error.message
        });
    }
};

// Get latest messages for desktop overlay
const getLatestMessages = async (req, res) => {
    try {
        // Grab an optional date parameter from the URL (e.g., /latest?date=2026-05-14)
        const targetDate = req.query.date; 
        
        const formattedMessages = await notiService.fetchLatest(targetDate);

        res.json({
            messages: formattedMessages
        });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            error: 'Failed to fetch messages'
        });
    }
};

// Mark specific messages as read
const markAsRead = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of message IDs.' });
        }

        const modifiedCount = await notiService.markNotificationsAsRead(ids);

        res.status(200).json({
            status: 'success',
            message: `Successfully marked ${modifiedCount} messages as read.`
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            error: 'Failed to mark messages as read',
            details: error.message
        });
    }
};

const deleteDb = async (req, res) => {
    try {
        const deletedCount = await notiRepos.deleteAll();

        res.status(200).json({
            status: 'success',
            message: 'Successfully deleted DB!',
            deletedCount: deletedCount
        });
    }
    catch (error) {
        console.error('Error deleting messages:', error);
        res.status(500).json({
            error: 'Failed to delete messages',
            details: error.message
        });
    }
};

module.exports = {
    saveMessage,
    getLatestMessages,
    markAsRead,
    deleteDb
};