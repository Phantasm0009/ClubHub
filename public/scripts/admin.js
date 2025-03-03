document.addEventListener("DOMContentLoaded", () => {
    const clubList = document.getElementById("club-list");
    const addClubForm = document.getElementById("add-club-form");
    const changeStatusForm = document.getElementById("change-status-form");
    const selectClub = document.getElementById("select-club");
    const saveChangesBtn = document.getElementById("save-changes");
    const messageContainer = document.getElementById("message-container");

    let clubsData = [];

    // Fetch clubs from the server
    async function loadClubs() {
        try {
            const response = await fetch("/clubs");
            if (!response.ok) {
                throw new Error('Failed to fetch clubs data');
            }
            clubsData = await response.json();
            console.log("Clubs Data Loaded:", clubsData);  // Debugging line

            if (clubsData.length === 0) {
                clubList.innerHTML = "<p>No clubs available.</p>";
            } else {
                displayClubs(clubsData);
            }
        } catch (error) {
            console.error("Error fetching clubs:", error);
            clubList.innerHTML = "<p>Failed to load clubs. Please try again later.</p>";
        }
    }

// Display clubs in the admin dashboard and populate select dropdown for changing status
function displayClubs(clubs) {
    clubList.innerHTML = ""; // Clear previous content
    selectClub.innerHTML = ""; // Clear previous select options

    if (clubs.length === 0) {
        clubList.innerHTML = "<p>No clubs available.</p>";
        selectClub.innerHTML = "<option>No clubs available</option>";
    } else {
        clubs.forEach(club => {
            // Display each club in the list
            const clubElement = document.createElement("div");
            clubElement.classList.add("club-item");
            clubElement.innerHTML = `
                <h3>${club.name}</h3>
                <p><strong>Description:</strong> ${club.description}</p>
                <p><strong>Advisor:</strong> ${club.advisor}</p>
                <p><strong>Location:</strong> ${club.location}</p>
                <p><strong>Membership:</strong> ${club.membershipRequirements || "None"}</p>
                <p><strong>Meeting Status:</strong> ${club.meetingStatus}</p>
                <button class="remove-club-btn" data-club-name="${club.name}">Remove Club</button>
            `;
            clubList.appendChild(clubElement);
        });

        // Populate select dropdown with club names for changing the meeting status
        clubs.forEach(club => {
            const option = document.createElement("option");
            option.value = club.name;
            option.textContent = club.name;
            selectClub.appendChild(option);
        });

        setupRemoveButtons();  // Re-add remove button listeners
    }
}

    // Add a new club
    addClubForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const clubName = document.getElementById("club-name").value;
        const description = document.getElementById("description").value;
        const advisor = document.getElementById("advisor").value;
        const location = document.getElementById("location").value;
        const membershipRequirements = document.getElementById("membership-requirements").value;
        const meetingStatus = document.getElementById("meeting-status").value;

        const newClub = {
            clubName,
            description,
            advisor,
            location,
            membershipRequirements,
            meetingStatus
        };

        try {
            const response = await fetch('/add-club', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClub)
            });

            const result = await response.json();

            if (result.success) {
                alert("Club added successfully!");
                loadClubs();  // Reload the clubs list
            } else {
                alert("Failed to add the club.");
            }
        } catch (error) {
            console.error('Error adding club:', error);
            alert('Failed to add club');
        }
    });

    // Change meeting status for a selected club
    saveChangesBtn.addEventListener("click", async () => {
        const selectedClubName = selectClub.value;
        const newMeetingStatus = document.getElementById("new-meeting-status").value;

        if (!selectedClubName || !newMeetingStatus) {
            alert("Please select a club and meeting status.");
            return;
        }

        try {
            const response = await fetch('/change-meeting-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedClubName,
                    newMeetingStatus
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("Meeting status updated successfully!");
                loadClubs();  // Reload the clubs list
            } else {
                alert("Failed to update the meeting status.");
            }
        } catch (error) {
            console.error('Error updating meeting status:', error);
            alert('Failed to update meeting status');
        }
    });

    // Remove club from the clubsData
    async function removeClub(clubName) {
        try {
            const response = await fetch(`/remove-club/${clubName}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                loadClubs();  // Reload the clubs list after removal
            } else {
                alert("Failed to remove the club.");
            }
        } catch (error) {
            console.error('Error removing club:', error);
            alert('Failed to remove the club');
        }
    }

    // Set up remove button listeners
    function setupRemoveButtons() {
        document.querySelectorAll(".remove-club-btn").forEach(button => {
            button.addEventListener("click", () => {
                const clubName = button.dataset.clubName;

                if (!confirm(`Are you sure you want to remove ${clubName}?`)) return;

                removeClub(clubName);  // Call removeClub function
            });
        });
    }

    // Call loadClubs when the page loads
    loadClubs();
});
