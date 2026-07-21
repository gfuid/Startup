// backend/utils/pushNotification.js
const axios = require('axios');

/**
 * Sends a push notification using Expo's push service.
 * @param {string} expoPushToken - Destination Expo Push Token
 * @param {string} title - Title of the notification
 * @param {string} body - Content body of the notification
 * @param {object} data - Custom payloads
 */
const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
    if (!expoPushToken) return;

    // Validate that it looks like an Expo Push Token
    if (!expoPushToken.startsWith('ExponentPushToken') && !expoPushToken.startsWith('token')) {
        console.log(`⚠️ Invalid Expo push token format: ${expoPushToken}`);
        return;
    }

    try {
        const response = await axios.post('https://exp.host/--/api/v2/push/send', {
            to: expoPushToken,
            sound: 'default',
            title,
            body,
            data
        }, {
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Expo Push Notification dispatched successfully to: ${expoPushToken}`);
        return response.data;
    } catch (error) {
        console.error('❌ Expo Push Notification dispatch failed:', error.message);
    }
};

module.exports = { sendPushNotification };
