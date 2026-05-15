import axios from 'axios';

const API_BASE = process.env.VITE_API_URL;

// Fetch the latest unread notifications
export async function fetchLatestNotifications() {
    try {
        const response = await axios.get(`${API_BASE}/latest`);
        return response.data.messages || [];
    } 
    catch (error) {
        console.error('Error fetching latest notifications:', error.message);
        return [];
    }
}

// Mark an array of notification IDs as read
export async function markNotificationsAsRead(idsArray) {
    try {
        if (!Array.isArray(idsArray) || idsArray.length === 0) return;
        const response = await axios.post(`${API_BASE}/read`, { ids: idsArray });
        return response.data;
    } 
    catch (error) {
        console.error('Failed to mark read:', error.message);
        throw error;
    }
}

// Wipe the entire databse structure
export async function wipeDatabaseApi() {
    try {
        const response = await axios.get(`${API_BASE}/delete-db`);
        return response.data;
    } 
    catch (error) {
        console.error('Error wiping database:', error.message);
        throw error;
    }
}