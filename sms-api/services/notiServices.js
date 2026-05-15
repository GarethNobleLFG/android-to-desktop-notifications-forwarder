const messageRepo = require('../repositories/messageRepository');

const saveNotification = async (notificationData) => {
    notificationData.read = false;
    return await messageRepo.create(notificationData);
};

const fetchLatest = async (dateString) => {
    // 1. Get the target date as a string (defaults to today if undefined)
    const targetDateStr = new Date(dateString || Date.now()).toDateString();

    // 2. Fetch all unread messages for that specific date straight from the DB
    const messages = await messageRepo.findUnread(targetDateStr);

    // 3. Format for desktop overlay
    return messages.map(msg => ({
        id: msg._id,
        app_package: msg.app_package,
        title: msg.title,
        message: msg.message,
        image_base64: msg.image_base64,
        icon_base64: msg.icon_base64,
        large_icon_base64: msg.large_icon_base64, 
        timestamp: msg.timestamp
    }));
};

const markNotificationsAsRead = async (idsArray) => {
    if (!idsArray || idsArray.length === 0) return 0;

    const result = await messageRepo.markAsRead(idsArray);
    console.log(`Updated read status of ${result.modifiedCount} notifications!`);
    return result.modifiedCount;
};

module.exports = {
    saveNotification,
    fetchLatest,
    markNotificationsAsRead,
};