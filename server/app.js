const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// Create an Express app
const app = express();
const PORT = 3000;

// Set up middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from the public directory

// Path to the clubs.json file
const clubsFilePath = path.join(__dirname, '../public/data/clubs.json');

// Ensure clubs.json file exists, if not create it
if (!fs.existsSync(clubsFilePath)) {
    fs.writeFileSync(clubsFilePath, JSON.stringify([])); // Create an empty array in the file if it doesn't exist
}

// Read clubs data from the JSON file
function readClubsData() {
    return JSON.parse(fs.readFileSync(clubsFilePath, 'utf8'));
}

// Write clubs data to the JSON file
function writeClubsData(clubs) {
    fs.writeFileSync(clubsFilePath, JSON.stringify(clubs, null, 2)); // Pretty-print the JSON data with 2-space indentation
}

// Get the list of clubs
app.get('/clubs', (req, res) => {
    const clubs = readClubsData();
    res.json(clubs);
});

// Add a new club
app.post('/add-club', (req, res) => {
    const { clubName, description, advisor, location, membershipRequirements, meetingStatus } = req.body;
    
    // Read existing clubs
    const clubs = readClubsData();

    // Create a new club object
    const newClub = {
        name: clubName,
        description,
        advisor,
        location,
        membershipRequirements,
        meetingStatus
    };

    // Add the new club to the clubs array
    clubs.push(newClub);

    // Save the updated clubs array to the file
    writeClubsData(clubs);

    res.json({ success: true, message: 'Club added successfully!' });
});

// Change meeting status of a club
app.post('/change-meeting-status', (req, res) => {
    const { selectedClubName, newMeetingStatus } = req.body;

    // Read existing clubs
    const clubs = readClubsData();

    // Find the club to update
    const club = clubs.find(c => c.name === selectedClubName);

    if (!club) {
        return res.status(404).json({ success: false, message: 'Club not found!' });
    }

    // Update the meeting status
    club.meetingStatus = newMeetingStatus;

    // Save the updated clubs array to the file
    writeClubsData(clubs);

    res.json({ success: true, message: 'Meeting status updated successfully!' });
});

// Remove a club
app.delete('/remove-club/:clubName', (req, res) => {
    const { clubName } = req.params;

    // Read existing clubs
    const clubs = readClubsData();

    // Filter out the club to be removed
    const updatedClubs = clubs.filter(club => club.name !== clubName);

    // If no club was found to delete, return an error
    if (clubs.length === updatedClubs.length) {
        return res.status(404).json({ success: false, message: 'Club not found!' });
    }

    // Save the updated clubs array to the file
    writeClubsData(updatedClubs);

    res.json({ success: true, message: `${clubName} removed successfully!` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
