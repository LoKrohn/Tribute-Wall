// Fetch and display the CSV file content
document.addEventListener("DOMContentLoaded", () => {
    const csvFilePath = 'Tribute.csv'; // Path to your CSV file
    const table = document.getElementById("tribute-table");

    fetch(csvFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const rows = parseCSV(data);
            const groupedData = groupEntries(rows);
            const sortedData = sortByLastName(groupedData, 2); // Sort by Category 3 (index 2)
            renderTable(sortedData, table);
            setupAlphabetNavigation(sortedData, table);
        })
        .catch(error => {
            console.error("Error fetching the CSV file:", error);
        });
});

// Parse CSV data into an array of rows
function parseCSV(data) {
    const lines = data.trim().split("\n"); // Split the CSV into rows
    return lines.map(line => line.split(",").map(cell => cell.trim())); // Split each row into columns and trim whitespace
}

// Group multiple entries for specific columns into comma-separated strings
function groupEntries(rows) {
    const header = rows[0]; // Extract header row
    const groupedRows = [];
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        const donorName = row[0] ? row[0].split(";").join(", ") : ""; // Split semicolon-separated names into commas
        const tributeName = row[2] ? row[2].split(";").join(", ") : ""; // Split semicolon-separated names into commas
        const inHonorMemoryOf = row[1] || ""; // Keep the "In Honor/Memory Of:" column as is

        groupedRows.push([donorName, inHonorMemoryOf, tributeName]);
    }

    return [header, ...groupedRows]; // Return new rows with the original header
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
    rows[0].forEach(headerText => {
        const headerCell = document.createElement("th");
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    rows.slice(1).forEach(row => {
        const tableRow = document.createElement("tr");

        row.forEach(cellText => {
            const tableCell = document.createElement("td");
            tableCell.textContent = cellText;
            tableRow.appendChild(tableCell);
        });

        table.appendChild(tableRow);
    });
}

// Setup alphabetical navigation
function setupAlphabetNavigation(rows, table) {
    const navLinks = document.querySelectorAll("#alphabet-nav a");
    const header = rows[0];
    const body = rows.slice(1);

    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            const letter = link.dataset.letter;

            const matchIndex = body.findIndex(row => {
                const lastName = getLastWord(row[2]);
                return lastName.startsWith(letter);
            });

            if (matchIndex !== -1) {
                const matchRow = table.rows[matchIndex + 1]; // Offset for header row
                matchRow.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    });
}
