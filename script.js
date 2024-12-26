const idInput = document.getElementById("idInput");
const accountInput = document.getElementById("accountInput");
const linkButton = document.getElementById("linkButton");
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const output = document.getElementById("output");

let linkedAccounts = JSON.parse(localStorage.getItem("linkedAccounts")) || {};

// Render linked accounts
function renderTiles() {
    output.innerHTML = "";
    for (const id in linkedAccounts) {
        const accounts = linkedAccounts[id];
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = id;
        tile.innerHTML = `
            <h2>${id}</h2>
            <p><strong>Tab:</strong> ${id}</p>
            <p><strong>Passwords:</strong><br>
                ${accounts
                    .map(
                        (account) =>
                            `${account} <span class="delete-icon" data-id="${id}" data-account="${account}">&times;</span>`
                    )
                    .join("<br>")}
            </p>
        `;
        output.appendChild(tile);
    }

    // Delete account event listeners
    document.querySelectorAll(".delete-icon").forEach((icon) =>
        icon.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            const account = e.target.dataset.account;
            linkedAccounts[id] = linkedAccounts[id].filter((acc) => acc !== account);
            if (!linkedAccounts[id].length) delete linkedAccounts[id];
            localStorage.setItem("linkedAccounts", JSON.stringify(linkedAccounts));
            renderTiles();
        })
    );
}

// Add account
linkButton.addEventListener("click", () => {
    const id = idInput.value.trim();
    const account = accountInput.value.trim();

    if (!id || !account) {
        alert("Both fields are required!");
        return;
    }

    // Check if the account is already linked to any ID
    for (const existingId in linkedAccounts) {
        if (linkedAccounts[existingId].includes(account)) {
            alert(`The account "${account}" is already linked to ID "${existingId}".`);
            return;
        }
    }

    if (!linkedAccounts[id]) {
        linkedAccounts[id] = [];
    }

    linkedAccounts[id].push(account);
    localStorage.setItem("linkedAccounts", JSON.stringify(linkedAccounts));
    renderTiles();
    idInput.value = "";
    accountInput.value = "";
});

// Search functionality with combined suggestions for account and tab (ID)
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    suggestions.innerHTML = ""; // Clear previous suggestions

    if (query) {
        const displayedIds = new Set();

        for (const id in linkedAccounts) {
            let matched = false;

            // Check if the ID matches the query
            if (id.toLowerCase().includes(query)) {
                matched = true;
                const suggestionTile = document.createElement("li");
                suggestionTile.classList.add("suggestion");
                suggestionTile.dataset.type = "id";
                suggestionTile.dataset.id = id;
                suggestionTile.textContent = `Tab: ${id}`;
                suggestionTile.addEventListener("click", () => handleSelection(id, "id"));
                if (!displayedIds.has(id)) {
                    suggestions.appendChild(suggestionTile);
                    displayedIds.add(id);
                }
            }

            // Check if any account matches the query
            linkedAccounts[id].forEach((account) => {
                if (account.toLowerCase().includes(query)) {
                    matched = true;
                    const suggestionTile = document.createElement("li");
                    suggestionTile.classList.add("suggestion");
                    suggestionTile.dataset.type = "account";
                    suggestionTile.dataset.id = id;
                    suggestionTile.dataset.account = account;
                    suggestionTile.textContent = `Account: ${account} (Tab: ${id})`;
                    suggestionTile.addEventListener("click", () => handleSelection(id, "account", account));
                    if (!displayedIds.has(id)) {
                        suggestions.appendChild(suggestionTile);
                        displayedIds.add(id);
                    }
                }
            });

            // Only show suggestion if matched
            if (!matched) {
                continue;
            }
        }
        suggestions.classList.add("show");
    } else {
        suggestions.classList.remove("show");
    }
});

// Handle selection of an ID or account (with highlight effect)
function handleSelection(id, type, account = null) {
    if (type === "id") {
        searchInput.value = id;
    } else if (type === "account" && account) {
        accountInput.value = account;
    }

    // Don't add new tile, just fill the input values
    // Clear the search and account input values
    searchInput.value = "";
    accountInput.value = "";
    suggestions.innerHTML = "";
    suggestions.classList.remove("show");

    // Scroll and highlight the tile for 1 second
    const tile = document.getElementById(id);
    if (tile) {
        tile.scrollIntoView({ behavior: "smooth", block: "center" });

        // Apply glowing effect to the selected tile
        tile.classList.add("glow");
        setTimeout(() => {
            tile.classList.remove("glow");
        }, 1000); // Glow effect lasts for 1 second
    }
}

// Listen for Enter key press to link account
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const selectedId = searchInput.value.trim();
        const selectedAccount = accountInput.value.trim();
        if (selectedId && selectedAccount) {
            if (!linkedAccounts[selectedId]) {
                linkedAccounts[selectedId] = [];
            }
            // Prevent linking the same account twice for the same ID
            if (!linkedAccounts[selectedId].includes(selectedAccount)) {
                linkedAccounts[selectedId].push(selectedAccount);
                localStorage.setItem("linkedAccounts", JSON.stringify(linkedAccounts));
                renderTiles();
            }
        }

        // Clear inputs and suggestions
        searchInput.value = "";
        accountInput.value = "";
        suggestions.innerHTML = "";
        suggestions.classList.remove("show");
    }
});

// Initial rendering
renderTiles();
