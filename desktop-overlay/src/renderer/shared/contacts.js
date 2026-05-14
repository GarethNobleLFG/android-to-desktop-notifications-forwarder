const fs = require('fs');
const path = require('path');

class ContactManager {
    constructor() {
        this.contacts = {};
        this.loadContacts();
    }

    // Load contacts from JSON file
    loadContacts() {
        try {
            const contactsPath = path.join(__dirname, '../contacts.json');
            const contactsData = fs.readFileSync(contactsPath, 'utf8');
            this.contacts = JSON.parse(contactsData).contacts;
            console.log(`Loaded ${Object.keys(this.contacts).length} contacts`);
        } 
        catch (error) {
            console.log('No contacts file found or error loading contacts:', error.message);
        }
    }



    // Function to get contact name from phone number
    getContactName(phoneNumber) {
        if (!phoneNumber) return 'Unknown Sender';
        
        // Clean the phone number (remove spaces, dashes, etc.)
        const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        // Try exact match first
        if (this.contacts[cleanNumber]) {
            return this.contacts[cleanNumber];
        }
        
        // Try with +1 prefix
        if (this.contacts['+1' + cleanNumber]) {
            return this.contacts['+1' + cleanNumber];
        }
        
        // Try without +1 prefix
        const withoutPrefix = cleanNumber.replace(/^\+1/, '');
        if (this.contacts[withoutPrefix]) {
            return this.contacts[withoutPrefix];
        }
        
        // Return original number if no match found
        return phoneNumber;
    }


    
    // Reload contacts (useful for updating without restarting)
    reloadContacts() {
        this.loadContacts();
    }
}

module.exports = ContactManager;