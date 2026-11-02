
/* =========================================
   PASSWORD RECORD MANAGER - JAVASCRIPT
   ========================================= */

// Master key for login
const MASTER_KEY = "admin123";

// Local storage key
const STORAGE_KEY = "passwordRecords";

// Array to store password records
let records = [];

let isVaultUnlocked = false;


// =========================================
// GENERAL HELPER FUNCTIONS
// =========================================

function getElement(id) {
    return document.getElementById(id);
}

function getInputValue(id) {
    return getElement(id).value.trim();
}

// Prevent HTML injection when displaying user input
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// =========================================
// LOCAL STORAGE FUNCTIONS
// =========================================

function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadRecords() {
    try {
        const savedRecords = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        records = Array.isArray(savedRecords) ? savedRecords : [];

    } catch (error) {
        records = [];
    }
}


// =========================================
// NOTIFICATION FUNCTION
// =========================================

function showNotification(message) {

    const notification = getElement("notification");

    notification.textContent = message;

    notification.classList.add("show");

    clearTimeout(showNotification.timer);

    showNotification.timer = setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}


// =========================================
// LOGIN FUNCTION
// =========================================

function login() {

    const enteredKey = getElement("masterKey").value;

    const errorMessage = getElement("loginError");

    if (enteredKey === MASTER_KEY) {

        isVaultUnlocked = true;

        getElement("loginPage").classList.add("hidden");

        getElement("managerPage").classList.remove("hidden");

        errorMessage.textContent = "";

        getElement("masterKey").value = "";

        renderRecords();

        showNotification("Vault unlocked successfully.");

    } else {

        errorMessage.textContent =
            "Incorrect master key. Please try again.";

        getElement("masterKey").value = "";
    }
}


// =========================================
// LOGOUT FUNCTION
// =========================================

function logout() {

    isVaultUnlocked = false;

    closePanels();

    getElement("managerPage").classList.add("hidden");

    getElement("loginPage").classList.remove("hidden");

    getElement("masterKey").value = "";

    getElement("loginError").textContent = "";
}


// =========================================
// DISPLAY PASSWORD RECORDS
// =========================================

function renderRecords() {

    const tableBody = getElement("recordTable");

    const emptyMessage = getElement("emptyMessage");

    tableBody.innerHTML = "";

    if (records.length === 0) {

        emptyMessage.classList.remove("hidden");

        return;
    }

    emptyMessage.classList.add("hidden");

    records.forEach(record => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(record.website)}</td>

            <td>${escapeHTML(record.username)}</td>

            <td>••••••••</td>

            <td>
                ${record.url
                    ? `<a href="${escapeHTML(record.url)}"
                         target="_blank"
                         rel="noopener noreferrer">Open</a>`
                    : "—"}
            </td>
        `;

        tableBody.appendChild(row);

    });
}


// =========================================
// OPEN AND CLOSE POPUPS
// =========================================

function openPanel(panelId) {

    if (!isVaultUnlocked) return;

    closePanels();

    getElement(panelId).classList.remove("hidden");
}


function openAdd() {

    clearFields([
        "addWebsite",
        "addUsername",
        "addPassword",
        "addURL"
    ]);

    openPanel("addPanel");
}


function openSearch() {

    clearFields([
        "searchWebsite",
        "searchUsername"
    ]);

    getElement("searchResult").textContent = "";

    openPanel("searchPanel");
}


function openUpdate() {

    clearFields([
        "updateWebsite",
        "updateUsername",
        "updatePassword",
        "updateURL"
    ]);

    openPanel("updatePanel");
}


function openDelete() {

    clearFields([
        "deleteWebsite",
        "deleteUsername",
        "deleteConfirmation"
    ]);

    openPanel("deletePanel");
}


function openCheck() {

    clearFields(["checkPassword"]);

    getElement("passwordResult").textContent = "";

    openPanel("checkPanel");
}


function closePanels() {

    const panels = [
        "addPanel",
        "searchPanel",
        "updatePanel",
        "deletePanel",
        "checkPanel"
    ];

    panels.forEach(panelId => {

        const panel = getElement(panelId);

        if (panel) {
            panel.classList.add("hidden");
        }

    });
}


// Clear input fields

function clearFields(ids) {

    ids.forEach(id => {

        const field = getElement(id);

        if (field) {
            field.value = "";
        }

    });
}


// =========================================
// URL VALIDATION
// =========================================

function isValidURL(value) {

    try {

        const parsedURL = new URL(value);

        return (
            parsedURL.protocol === "http:" ||
            parsedURL.protocol === "https:"
        );

    } catch (error) {

        return false;
    }
}


// =========================================
// ADD PASSWORD RECORD
// =========================================

function addRecord() {

    const website = getInputValue("addWebsite");

    const username = getInputValue("addUsername");

    const password = getElement("addPassword").value;

    const url = getInputValue("addURL");


    // Validate input fields

    if (!website || !username || !password) {

        showNotification(
            "Please fill in website, username and password."
        );

        return;
    }


    if (url && !isValidURL(url)) {

        showNotification("Please enter a valid URL.");

        return;
    }


    // Create new record object

    const newRecord = {

        id: Date.now().toString(),

        website: website,

        username: username,

        password: password,

        url: url
    };


    // Add record to array

    records.push(newRecord);


    // Save and update table

    saveRecords();

    renderRecords();

    closePanels();

    showNotification("Record saved successfully.");
}


// =========================================
// SEARCH PASSWORD RECORD
// =========================================

function searchRecord() {

    const website = getInputValue("searchWebsite").toLowerCase();

    const username = getInputValue("searchUsername").toLowerCase();

    const resultBox = getElement("searchResult");


    if (!website && !username) {

        resultBox.textContent =
            "Enter a website or username to search.";

        return;
    }


    // Filter records using search criteria

    const matches = records.filter(record => {

        const websiteMatches = !website ||
            record.website.toLowerCase().includes(website);

        const usernameMatches = !username ||
            record.username.toLowerCase().includes(username);

        return websiteMatches && usernameMatches;

    });


    if (matches.length === 0) {

        resultBox.textContent = "No matching record found.";

        return;
    }


    // Display matching records

    resultBox.innerHTML = matches.map(record => `

        <div class="search-item">

            <strong>Website:</strong>
            ${escapeHTML(record.website)}
            <br>

            <strong>Username:</strong>
            ${escapeHTML(record.username)}
            <br>

            <strong>Password:</strong>
            ${escapeHTML(record.password)}
            <br>

            <strong>URL:</strong>
            ${record.url
                ? `<a href="${escapeHTML(record.url)}"
                     target="_blank"
                     rel="noopener noreferrer">
                     ${escapeHTML(record.url)}
                   </a>`
                : "Not provided"}

        </div>

    `).join("<hr>");

}


// =========================================
// UPDATE PASSWORD RECORD
// =========================================

function updateRecord() {

    const website = getInputValue("updateWebsite").toLowerCase();

    const username = getInputValue("updateUsername").toLowerCase();

    const newPassword = getElement("updatePassword").value;

    const newURL = getInputValue("updateURL");


    if (!website || !username) {

        showNotification(
            "Enter the website and current username."
        );

        return;
    }


    // Find matching record

    const record = records.find(item =>

        item.website.toLowerCase() === website &&

        item.username.toLowerCase() === username

    );


    if (!record) {

        showNotification("Matching record not found.");

        return;
    }


    if (!newPassword && !newURL) {

        showNotification(
            "Enter a new password or URL."
        );

        return;
    }


    if (newURL && !isValidURL(newURL)) {

        showNotification("Please enter a valid URL.");

        return;
    }


    // Update record

    if (newPassword) {

        record.password = newPassword;
    }

    if (newURL) {

        record.url = newURL;
    }


    saveRecords();

    renderRecords();

    closePanels();

    showNotification("Record updated successfully.");
}


// =========================================
// DELETE PASSWORD RECORD
// =========================================

function deleteRecord() {

    const website = getInputValue("deleteWebsite").toLowerCase();

    const username = getInputValue("deleteUsername").toLowerCase();

    const confirmation = getInputValue("deleteConfirmation");


    if (!website || !username) {

        showNotification(
            "Enter the website and username."
        );

        return;
    }


    // Check confirmation text

    if (confirmation !== "PERMANENTLY DELETE") {

        showNotification(
            'Type "PERMANENTLY DELETE" to confirm.'
        );

        return;
    }


    // Find record index

    const recordIndex = records.findIndex(item =>

        item.website.toLowerCase() === website &&

        item.username.toLowerCase() === username

    );


    if (recordIndex === -1) {

        showNotification("Matching record not found.");

        return;
    }


    // Remove record from array

    records.splice(recordIndex, 1);


    saveRecords();

    renderRecords();

    closePanels();

    showNotification("Record deleted successfully.");
}


// =========================================
// PASSWORD STRENGTH CHECKER
// =========================================

function checkPassword() {

    const password = getElement("checkPassword").value;

    const resultBox = getElement("passwordResult");


    if (!password) {

        resultBox.textContent =
            "Please enter a password.";

        return;
    }


    let score = 0;

    let suggestions = [];


    // Check password length

    if (password.length >= 8) {

        score++;

    } else {

        suggestions.push("Use at least 8 characters");
    }


    // Check uppercase letter

    if (/[A-Z]/.test(password)) {

        score++;

    } else {

        suggestions.push("Add an uppercase letter");
    }


    // Check lowercase letter

    if (/[a-z]/.test(password)) {

        score++;

    } else {

        suggestions.push("Add a lowercase letter");
    }


    // Check numbers

    if (/[0-9]/.test(password)) {

        score++;

    } else {

        suggestions.push("Add a number");
    }


    // Check special characters

    if (/[^A-Za-z0-9]/.test(password)) {

        score++;

    } else {

        suggestions.push("Add a special character");
    }


    // Determine password strength

    let strength;

    if (score <= 2) {

        strength = "Weak";

    } else if (score <= 4) {

        strength = "Medium";

    } else {

        strength = "Strong";
    }


    // Display result

    resultBox.innerHTML = `

        <strong>Password Strength: ${strength}</strong>

        <br>

        Score: ${score}/5

        ${suggestions.length

            ? `<br><br>
               <strong>Suggestions:</strong>
               <br>
               ${suggestions.map(escapeHTML).join("<br>")}`

            : `<br><br>
               Good job! Your password meets all the basic checks.`}

    `;

}


// =========================================
// INITIAL SETUP
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // Load saved records

    loadRecords();

    // Display records

    renderRecords();


    // Login when Enter key is pressed

    getElement("masterKey").addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                login();
            }

        }
    );


    // Close popup when clicking outside popup box

    document.querySelectorAll(".popup").forEach(panel => {

        panel.addEventListener("click", event => {

            if (event.target === panel) {

                closePanels();
            }

        });

    });

});
