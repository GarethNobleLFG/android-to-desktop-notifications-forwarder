const Messages = require('../models/message');

const create = async (data) => {
    return await new Messages(data).save();
};

const findUnread = async (dateString) => {
    // Get bounds for the requested date since the return timestamp is a Unix Epoch Timestamp.
    const targetDate = new Date(dateString);

    targetDate.setHours(0, 0, 0, 0);
    const startTimestamp = targetDate.getTime();

    targetDate.setHours(23, 59, 59, 999);
    const endTimestamp = targetDate.getTime();

    return await Messages.find({
        timestamp: { $gte: startTimestamp, $lte: endTimestamp },
        read: false
    }).select('_id app_package title message image_base64 icon_base64 large_icon_base64 read timestamp');
};

const markAsRead = async (ids) => {
    return await Messages.updateMany(
        { _id: { $in: ids } },
        { $set: { read: true } }
    );
};

const deleteAll = async () => {
    return await Messages.deleteMany({});
};

module.exports = { create, findUnread, markAsRead, deleteAll };