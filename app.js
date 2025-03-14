// Fetch and display the CSV file content
document.addEventListener("DOMContentLoaded", () => {
    const csvFilePath = 'Tribute.csv'; // Path to your CSV file
    const table = document.getElementById("tribute-table");

    fetch(csvFilePath)
        .then(response => response.text())
        .then(data => {
            const rows = parseCSV(data);
            const groupedData = groupEntries(rows);
            const sortedData = sortByLastName(groupedData, 1); // Sort by Column 2 (index 1)
            renderTable(sortedData, table);
            setupAlphabetNavigation(sortedData, table);
        })
        .catch(error => console.error("Error fetching the CSV file:", error));
});

// Parse CSV data into an array of rows
function parseCSV(data) {
    const lines = data.trim().split("\n"); 
    return lines.map(line => line.split(",").map(cell => cell.trim()));
}

// Group multiple entries for specific columns into comma-separated strings
function groupEntries(rows) {
    const header = rows[0]; // Extract header row
    const groupedRows = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        const donorName = row[0] ? row[0].split(";").join(", ") : ""; 
        const tributeName = row[2] ? row[2].split(";").join(", ") : ""; 
        const inHonorMemoryOf = row[1] || ""; 
        const imageURLs = row[3] ? row[3].split(";") : []; // Allow multiple images, separated by ";"

        groupedRows.push([donorName, inHonorMemoryOf, tributeName, imageURLs]);
    }

    return [header, ...groupedRows];
}

// Sort rows by the last name in a specific column
function sortByLastName(rows, columnIndex) {
    const header = rows[0];
    const body = rows.slice(1);

    const sortedBody = body.sort((a, b) => {
        const lastNameA = getLastWord(a[columnIndex]);
        const lastNameB = getLastWord(b[columnIndex]);
        return lastNameA.localeCompare(lastNameB);
    });

    return [header, ...sortedBody];
}

// Helper function to extract the last word (last name) from a string
function getLastWord(string) {
    if (!string) return "";
    const words = string.split(", "); 
    const lastName = words[words.length - 1].trim().split(" ").pop();
    return lastName;
}

// Render the table on the page
function renderTable(rows, table) {
    table.innerHTML = "";

    const headerRow = document.createElement("tr");
    rows[0].slice(0, 3).forEach(headerText => {  // Only include first 3 columns (skip "Image URL" header)
        const headerCell = document.createElement("th");
        headerCell.textContent = headerText === "Image URL" ? "" : headerText; // Remove "Image URL" from header
        headerRow.appendChild(headerCell);
    });

    // Add a blank header for the image column
    const imageHeaderCell = document.createElement("th");
    imageHeaderCell.textContent = ""; // Empty header for images
    headerRow.appendChild(imageHeaderCell);

    table.appendChild(headerRow);

    const alphabetHeaders = {};

    rows.slice(1).forEach(row => {
        const lastName = getLastWord(row[1]);
        const firstLetter = lastName[0]?.toUpperCase() || "#";

        if (!alphabetHeaders[firstLetter]) {
            const alphabetRow = document.createElement("tr");
            const alphabetCell = document.createElement("th");
            alphabetCell.colSpan = 4; // Span across all 4 columns (including images)
            alphabetCell.style.textAlign = "center";
            alphabetCell.style.fontWeight = "bold";
            alphabetCell.style.backgroundColor = "#003366";
            alphabetCell.style.color = "#fff";
            alphabetCell.style.fontSize = "1.2em";
            alphabetCell.style.padding = "10px";
            alphabetCell.innerHTML = `<a id="letter-${firstLetter}" href="#letter-${firstLetter}" style="color: white; text-decoration: none;">${firstLetter}</a>`;
            alphabetRow.appendChild(alphabetCell);
            table.appendChild(alphabetRow);

            alphabetHeaders[firstLetter] = true;
        }

        const tableRow = document.createElement("tr");

        // Add donor name, honor/memory, and tribute name
        row.slice(0, 3).forEach(cellText => {
            const tableCell = document.createElement("td");
            tableCell.textContent = cellText;
            tableRow.appendChild(tableCell);
        });

        // Add the images in the same row
        const imageCell = document.createElement("td");
        row[3].forEach(url => {
            if (url) {
                const img = document.createElement("img");
                img.src = url;
                img.className = "honoree-image";
                img.alt = "Honoree Image";
                img.style.maxWidth = "100px"; // Adjust image size
                img.style.margin = "5px";
                img.onerror = function () { this.style.display = "none"; }; // Hide broken images
                imageCell.appendChild(img);
            }
        });

        tableRow.appendChild(imageCell); // Add image cell to row
        table.appendChild(tableRow);
    });
}

// Setup alphabetical navigation
function setupAlphabetNavigation(rows, table) {
    const navLinks = document.querySelectorAll("#alphabet-nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            const letter = link.dataset.letter;
            const target = document.getElementById(`letter-${letter}`);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}
