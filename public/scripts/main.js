document.addEventListener("DOMContentLoaded", () => {
    const clubList = document.getElementById("club-list");
    const searchInput = document.getElementById("search-club");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const filterPopup = document.getElementById("filterPopup");
    const filterButton = document.getElementById("filterButton");
    const closePopupButton = document.getElementById("closePopupButton");
    let clubsData = [];

    // Fetch clubs from the server
    async function fetchClubs() {
        try {
            const response = await fetch("/data/clubs.json");
            clubsData = await response.json();
            displayClubs(clubsData);
            populateFilters();
        } catch (error) {
            console.error("Error fetching clubs:", error);
        }
    }

    // Display clubs on the page
    function displayClubs(clubs) {
        clubList.innerHTML = ""; // Clear previous content

        clubs.forEach(club => {
            const clubElement = document.createElement("div");
            clubElement.classList.add("club-item");

            // Determine status color and label
            let statusColor = "gray";
            let statusText = "TBD";

            if (club.meetingStatus === "Meeting") {
                statusColor = "green";
                statusText = "Meeting";
            } else if (club.meetingStatus === "Not Meeting") {
                statusColor = "red";
                statusText = "Not Meeting";
            } else if (club.meetingStatus === "TBD") {
                statusColor = "yellow";
                statusText = "TBD";
            }

            clubElement.innerHTML = `
                <div class="club-header">
                    <h3>${club.name}</h3>
                    <span class="status-indicator ${statusColor}">${statusText}</span>
                </div>
                <p><strong>Description:</strong> ${club.description}</p>
                <p><strong>Advisor:</strong> ${club.advisor}</p>
                <p><strong>Location:</strong> ${club.location}</p>
                <p><strong>Membership:</strong> ${club.membership_requirements || "None"}</p>
                <p><strong>Period:</strong> ${club.period}</p>
            `;
            clubList.appendChild(clubElement);
        });
    }

// Search functionality
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredClubs = clubsData.filter(club => 
        club.name.toLowerCase().includes(query) // Only search in the club name
    );
    displayClubs(filteredClubs);
});
        
    // Dark Mode Toggle
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    });

    // Persist Dark Mode
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    // Filter Button - Show Popup
    filterButton.addEventListener("click", () => {
        filterPopup.style.display = "block";
    });

    // Close Filter Popup
    closePopupButton.addEventListener("click", () => {
        filterPopup.style.display = "none";
    });

    // Apply Filters
    function applyFilters() {
        const genre = document.getElementById("genreFilter").value;
        const period = document.getElementById("periodFilter").value;
        const status = document.getElementById("statusFilter").value;
        const membership = document.getElementById("membershipFilter").value;
        const advisor = document.getElementById("advisorFilter").value;

        const filteredClubs = clubsData.filter(club => 
            (genre === "All" || club.genre === genre) &&
            (period === "All" || club.period === period) &&
            (status === "All" || club.meetingStatus === status) &&
            (membership === "All" || club.membership_requirements === membership) &&
            (advisor === "All" || club.advisor === advisor)
        );

        displayClubs(filteredClubs);
        filterPopup.style.display = "none";
    }

    // Populate filters dynamically
    function populateFilters() {
        const advisorFilter = document.getElementById("advisorFilter");
        const genreFilter = document.getElementById("genreFilter");
        const uniqueAdvisors = [...new Set(clubsData.map(club => club.advisor))];
        const uniqueGenres = [...new Set(clubsData.map(club => club.genre))];

        advisorFilter.innerHTML = '<option value="All">All</option>';
        uniqueAdvisors.forEach(advisor => {
            const option = document.createElement("option");
            option.value = advisor;
            option.textContent = advisor;
            advisorFilter.appendChild(option);
        });

        genreFilter.innerHTML = '<option value="All">All</option>';
        uniqueGenres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }

    // Attach applyFilters function to the global window object so it can be used in the filter popup
    window.applyFilters = applyFilters;

    // Initial fetch of clubs
    fetchClubs();
});
