const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    app_package: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Number,
        required: true
    },
    device_id: {
        type: String,
        required: true
    },
    received_at: {
        type: Number,
        required: true
    },
    image_base64: {
        type: String,
        required: false
    },
    icon_base64: {
        type: String,
        required: false
    },
    large_icon_base64: {
        type: String,
        required: false
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Messages', messageSchema);