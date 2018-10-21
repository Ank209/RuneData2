let clanName = "ironsoulz"; // Use underscore instead of space
let currentPage = 1;
let innerContainer = document.getElementById("clanMembersTable").innerHTML;
let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let ranks = ["Recruit", "Corporal", "Sergeant", "Lieutenant", "Captain", "General", "Admin", "Organiser", "Coordinator", "Overseer", "Deputy Owner", "Owner"];
let promotions = {
    corporal: [],
    sergeant: [],
    lieutenant: [],
    captain: [],
    general: [],
    admin: [],
}

// Load the first page of clanmates
getClan(currentPage);

// Load one page of clan members from RuneClan
function getClan(page) {
    $.ajax({
        type: 'GET',
        url: "http://allorigins.me/get?url=http://www.runeclan.com/clan/" + clanName + "/members/" + page + "%3Fsort_by%3Dclan_xp%26order%3Ddesc",
        dataType: "text", success: function (data) { HandleAllOrigins(data) }, error: function (data) { HandleError(data) }
    });
}

// If it errors retry it
function HandleError(data) {
    console.log("RuneClan Error");
    getClan(currentPage);
}

function HandleAllOrigins(rawData) {
    data = JSON.parse(rawData);
    if (data.status.http_code == 200) {
        HandlePlayers(data.contents);
    } else {
        HandleError(data);
    }
}

// When the data gets back, organise it into an array of player objects
function HandlePlayers(data) {
    // Get the clanmates table from the raw data
    let players = $(data).find(".clan_right")[0].children[3].children[0].children;
    
    // Check if last player has been checked
    if (players.length == 1) {
        updateTable();
        document.getElementById("pagesloaded").innerText = "Loading Complete";
    } else {
        let tempPlayerArray = [];
        // Loop through each row in the table
        for (let i = 1; i < players.length; i++) {
            // Split info since it contains tha playername and join date
            let info = players[i].children[0].innerText.split('\n')
            // Add the data to an object
            let tempPlayer = {
                name: info[0],
                joined: new Date(info[1].replace('Joined ', '').substr(4).replace('th', '').replace('st', '').replace('nd', '').replace('rd', '')),
                rank: ranks.indexOf(players[i].children[1].innerText.trim()),
                clanXp: parseInt(players[i].children[3].innerText.replace(new RegExp(',', 'g'), ''))
            }
            // Add the new player to the array
            tempPlayerArray.push(tempPlayer);
        }
        checkPromotions(tempPlayerArray);
    }
}

// Check if a player needs a promotion
function checkPromotions(playerArray) {
    // Loop through all players in the array
    for (let i = 0; i < playerArray.length; i++) {
        // Compare their xp to see if they need promoting
        if (playerArray[i].clanXp < 1000000) {
            // Recruit
        } else if (playerArray[i].clanXp < 5000000) {
            // Corporal
            if (playerArray[i].rank < 1) {
                promotions.corporal.push(playerArray[i]);
            }
        } else if (playerArray[i].clanXp < 12000000) {
            // Sergeant
            if (playerArray[i].rank < 2) {
                promotions.sergeant.push(playerArray[i]);
            }
        } else if (playerArray[i].clanXp < 25000000) {
            // Lieutenant
            if (playerArray[i].rank < 3) {
                promotions.lieutenant.push(playerArray[i]);
            }
        } else if (playerArray[i].clanXp < 50000000) {
            // Captain
            if (playerArray[i].rank < 4) {
                promotions.captain.push(playerArray[i]);
            }
        } else if (playerArray[i].clanXp < 100000000) {
            // General
            if (playerArray[i].rank < 5) {
                promotions.general.push(playerArray[i]);
            }
        } else if (playerArray[i].clanXp >= 100000000) {
            // Admin
            if (playerArray[i].rank < 6) {
                promotions.admin.push(playerArray[i]);
            }
        }
    }
    // Update the number of loaded pages
    document.getElementById("pagesloaded").innerText = "Pages Loaded: " + currentPage;
    updateTable();
    // Get the next page
    currentPage = currentPage + 1;
    getClan(currentPage);
}

// Update the table on the page with the new data
function updateTable() {
    let container = document.getElementById("clanMembersTable");
    container.innerHTML = innerContainer;
    // Loop through promotions and add each to table
    addToTable(promotions.admin, "Admin", "100m", 6);
    addToTable(promotions.general, "General", "50m", 2);
    addToTable(promotions.captain, "Captain", "25m", 1);
    addToTable(promotions.lieutenant, "Lieutenant", "12m");
    addToTable(promotions.sergeant, "Sergeant", "5m");
    addToTable(promotions.corporal, "Corporal", "1m");
    //console.log(promotions);
}

// Add all players who need a promotion to a rank to the table
function addToTable(rankData, title, xp, monthReq = 0) {
    // Get the required join date for this rank
    let reqDate = new Date();
    reqDate.setMonth(reqDate.getMonth() - monthReq);

    let container = document.getElementById("clanMembersTable");
    let tempTitle = document.createElement("td");
    // Set the title at the top of the table
    tempTitle.innerHTML = '<h1><img src="http://www.runeclan.com/images/ranks/' + (12 - ranks.indexOf(title)) + '.png" height=23>' + title + '</h1><p>' + xp + ' xp</p>';
    let now = new Date();
    if (reqDate.getMonth() != now.getMonth()) {
        tempTitle.innerHTML = tempTitle.innerHTML + "<p>(" + reqDate.getDate() + "-" + monthNames[reqDate.getMonth()] + "-" + reqDate.getFullYear() + ")</p>";
    }
    tempTitle.classList.add("noBorder");
    tempTitle.colSpan = 4;
    container.appendChild(tempTitle);

    // If there is no data, set the only row to <None>
    if (rankData.length == 0) {
        let tempRow = document.createElement("tr");
        let tempNameCell = document.createElement("td");
        tempNameCell.innerText = "<None>";
        tempNameCell.colSpan = 3;
        tempRow.appendChild(tempNameCell);
        container.appendChild(tempRow);
    } else { // If there is data, add a header row as the first row
        // Create the elements
        let tempRow = document.createElement("tr");
        let tempNameCell = document.createElement("th");
        let tempXpCell = document.createElement("th");
        let tempRankCell = document.createElement("th");
        let tempJoinCell = document.createElement("th");
        // Set the values of the elements
        tempNameCell.innerText = "Player";
        tempXpCell.innerText = "Current Clan Xp";
        tempRankCell.innerText = "Current Rank";
        tempJoinCell.innerText = "Join Date";
        // Give the elements parents
        tempRow.appendChild(tempNameCell);
        tempRow.appendChild(tempXpCell);
        tempRow.appendChild(tempRankCell);
        tempRow.appendChild(tempJoinCell);
        container.appendChild(tempRow);
    }
    // Loop through players who need a promotion and add them to the table
    for (let i = 0; i < rankData.length; i++) {
        // Create the elements
        let tempRow = document.createElement("tr");
        let tempNameCell = document.createElement("td");
        let tempXpCell = document.createElement("td");
        let tempRankCell = document.createElement("td");
        let tempJoinCell = document.createElement("th");
        // Set the values of the elements
        tempNameCell.innerText = rankData[i].name;
        tempXpCell.innerText = numberWithCommas(rankData[i].clanXp);
        tempRankCell.innerText = ranks[rankData[i].rank];
        tempJoinCell.innerText = rankData[i].joined.getDate() + "-" + monthNames[rankData[i].joined.getMonth()] + "-" + rankData[i].joined.getFullYear();
        if (rankData[i].joined > reqDate) {
            tempRow.style = "background-color: red;";;
        }
        // Give the elements parents
        tempRow.appendChild(tempNameCell);
        tempRow.appendChild(tempXpCell);
        tempRow.appendChild(tempRankCell);
        tempRow.appendChild(tempJoinCell);
        container.appendChild(tempRow);
    }
}

// Add commas to numbers larger than 999
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}