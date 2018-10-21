let baseURL = "https://e2mdt68e0c.execute-api.ap-southeast-2.amazonaws.com/prod"

let skills = ['Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering', 'Divination', "Invention"];
let percentageColors = ['#FF0000', '#FF9B00', '#E7E400', '#6CBC00', '#00BC00'];
// Info about the player
let playerSkillsHC = [];
let playerSkillsIron = [];
let playerSkillsReg = [];
let playerClues = [];
let playerData = [];
// Variables to manage the program
let eliteXp = [];
let trainingMethods = [];
let highscoresReceived = [];
let playerName = "";
let wrongTiming = false;
let baseHTML = "";
let prevActiveSkill = 1;
let resetActiveSkill = false;
let skillOrder = [];
let skillDataActive = false;
let questPoints = 0;

let maxHighscore = "HC";
let currentHighscores = "HC";
let currentSortCol = "default";

const returnCall = {
    PlayerStats: 0,
    PlayerData: 1,
    QuestData: 2,
    ManageTitles: 3
}

genHTML();

// Generates the empty skill list HTML
function genHTML() {
    let mainContainer = document.getElementById("mainData");
    // One Row for each skill
    for (let i = 1; i <= 27; i++) {
        mainContainer.innerHTML = mainContainer.innerHTML + '<div class="skill-container" onclick="ShowSkillData(' + i + ')"><div id="skill' + i + '" class="skill-bar"> <div class="bar-text-icon"><img class="skill-image" src="assets/images/skills/' + skills[i - 1].toLowerCase() + '.png"></div><div class="bar-text-skill">' + skills[i - 1] + '</div></div></div>'
    }

    // Keep track of this state so it can be reverted to later
    baseHTML = document.getElementById("mainData").innerHTML;
    CheckPlayer();
}

// Check if a player has been searched for already
function CheckPlayer() {
    if (getQueryVariable("playerName")) { // If a player's name appears in the address bar
        // Remove special characters
        playerName = decodeURI(getQueryVariable("playerName"));

        // Set the text box at the top of the page to the player's name
        document.getElementById("rsn").value = playerName;
        searchPlayer();
    }
}

// Get a variable's value from the address bar
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    // Loop through each variable found in the address
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { // If the variable name matches the one requested
            return pair[1]; // return the value
        }
    }
    // If the requested variable was not found return false;
    return (false);
}

// Get all data needed by the site
function GetUserData(searchTerm) {
    // Local JSON files
    $.ajax({
        url: "assets/eliteskillxp.json", dataType: "json", success: function (data) { eliteXp = data; }
    });
    $.ajax({
        url: "assets/trainingmethods.json", dataType: "json", success: function (data) { trainingMethods = data; }
    });
    // Player Info via allorigins.me, Reload the page if important data cannot be found
    GetPlayerData(searchTerm);
    $.ajax({
        type: 'GET',
        url: "http://allorigins.me/get?url=http://services.runescape.com/m=hiscore_hardcore_ironman/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { AllOrigins([data, 2, "HC"], 'text', returnCall.PlayerStats) }, error: function (data) { HandleError(data, 2, "HC") }
    });
    $.ajax({
        url: "http://allorigins.me/get?url=http://services.runescape.com/m=hiscore_ironman/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { AllOrigins([data, 1, "Iron"], 'text', returnCall.PlayerStats) }, error: function (data) { HandleError(data, 1, "Iron") }
    });
    $.ajax({
        url: "http://allorigins.me/get?url=http://services.runescape.com/m=hiscore/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { AllOrigins([data, 0, "Reg"], 'text', returnCall.PlayerStats) }, error: function (data) { HandleError(data, 0, "Reg") }
    });
    $.ajax({
        url: 'http://services.runescape.com/m=website-data/playerDetails.ws?names=["' + searchTerm + '"]',
        dataType: "jsonp", success: HandlePlayerInfo, error: function (data) { location.reload(); }
    });
}

function GetPlayerData(searchTerm) {
    $.ajax({
        url: "http://allorigins.me/get?url=https://apps.runescape.com/runemetrics/profile/profile?user=" + searchTerm + "&activities=0",
        dataType: "json", success: function (data) { AllOrigins([data], 'json', returnCall.PlayerData) }, error: function (data) { GetPlayerData(searchTerm); }
    });
    $.ajax({
        url: "http://allorigins.me/get?url=https://apps.runescape.com/runemetrics/quests?user=" + searchTerm,
        dataType: "json", success: function (data) { AllOrigins([data], 'json', returnCall.QuestData) }, error: function (data) { GetPlayerData(searchTerm); }
    });
}

// Deal with All Origins
function AllOrigins(params, dataType, callId) {
    let data;
    let status = 0;
    if (dataType == 'json') {
        data = JSON.parse(params[0].contents);
        status = params[0].status.http_code;
    } else if (dataType == 'text') {
        data = JSON.parse(params[0]);
        status = data.status.http_code
    } else {
        console.log("Invalid dataType");
    }

    if (status == 200) {
        switch(callId) {
            case returnCall.PlayerStats:
                HandlePlayerStats(data.contents,params[1],params[2]);
                break;
            case returnCall.PlayerData:
                HandlePlayerData(data);
                break;
            case returnCall.QuestData:
                HandleQuestData(data);
                break;
            case returnCall.ManageTitles:
                manageTitles(data.contents, params[1]);
            break;
        }
    } else if (status == 404) {
        switch(callId) {
            case returnCall.PlayerStats:
                HandleError(status,params[1],params[2]);
                break;
            case returnCall.ManageTitles:
                HandlePlayerData(data);
                break;
        }
    } else {
        // Retry
    }
}

// Handle the player's runemetrics profile when the data gets back
function HandlePlayerData(data) {
    // Notify the user if the requested data is private
    if (data.error) {
        document.getElementById("private").innerText = "Private Runemetrics Profile, \n Some Of The Info Below Will Be Incorrect";
    } else {
        document.getElementById("private").innerText = "";
    }
    playerData = data;
    // If the data comes back back in the wrong order
    if (wrongTiming) {
        UpdateGoal();
    }
    if (playerData.name) {
        UpdatePlayerData();
    }
}

// Handle the player's quest data when it get's back
function HandleQuestData(data) {
    //findQpErrors(data.quests)
    let repeat = false;
    let dodQp = 0;
    // Loop through all the quests
    for (let i = 0; i < data.quests.length; i++) {
        if (data.quests[i].title.includes("Dimension of Disaster")) {
            // Special case for dimension of disaster since it's repeatable
            // If it's been started or completed, just add all 11 quest points
            if (data.quests[i].status == "COMPLETED") {
                dodQp = dodQp + data.quests[i].questPoints;
                questPoints = questPoints + data.quests[i].questPoints;
            }
            if (data.quests[i].title == "Dimension of Disaster" && data.quests[i].status == "STARTED") {
                repeat = true;
                console.log("Dimension of Disaster In Progress");
            }
        } else if (data.quests[i].title == "Pieces of Hate" && data.quests[i].status == "COMPLETED") {
            // PoH shows wrong qp value on website, this corrects it
            questPoints = questPoints + 2;
        } else if (data.quests[i].title == "The Elemental Workshop IV" && data.quests[i].status == "COMPLETED") {
            // EW4 shows wrong qp value on website, this corrects it
            questPoints = questPoints + 2;
        } else if (data.quests[i].status == "COMPLETED") { // If the player has completed the quest
            // Add the quest to their total quest points
            questPoints = questPoints + data.quests[i].questPoints;
        } else {
            
        }
    }
    if (repeat) {
        document.getElementById("qp").innerText = "Approx " + questPoints + " to " + (questPoints + (10 - dodQp));
    } else {
        document.getElementById("qp").innerText = questPoints;
    }
}

// Debug to find mismatched qp values between the rs site and the wiki
function findQpErrors(rsQuests) {
    $.ajax({
        url: 'http://allorigins.me/get?url=http://runescape.wikia.com/wiki/List_of_quests/Full', success: function (text) {
            let wikiQuests = $(JSON.parse(text).contents).find('#mw-content-text')[0].children[4].children[0].children;
            console.log("Quest Errors:");
            for (let i = 0; i < rsQuests.length; i++) {
                let found = false;
                if (rsQuests[i].questPoints == 1) {
                    for (let l = 0; l < wikiQuests.length; l++) {
                        if (wikiQuests[l].children[0].innerText.trim() == rsQuests[i].title) {
                            if (wikiQuests[l].children[4].innerText != rsQuests[i].questPoints) {
                                console.log("[" + rsQuests[i].status + "]" + rsQuests[i].title + " - Rs shows " + rsQuests[i].questPoints + " Qp and Wiki shows " + wikiQuests[l].children[4].innerText + " Qp");
                            }
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        console.log("[" + rsQuests[i].status + "]" + rsQuests[i].title + " not found on wiki. [" + rsQuests[i].questPoints + "]");
                    }
                }
            }
            let sum = 0;
            for (let l = 1; l < wikiQuests.length; l++) {
                sum = sum + parseInt(wikiQuests[l].children[4].innerText);
            }
            console.log(sum);
        }, dataType: 'text'
    });
}

// Handle the website data when it get's back
function HandlePlayerInfo(playerInfo) {
    // Get a list of titles from the wiki
    $.ajax({
        url: 'http://allorigins.me/get?url=http://runescape.wikia.com/wiki/Titles', 
        success: function (data) { AllOrigins([data, playerInfo], 'text', returnCall.ManageTitles) }, 
        error: function (data) { HandlePlayerInfo(playerInfo) }, dataType: 'text'
    }); // Loop if it fails to get data
}

function manageTitles(html, playerInfo) {
    let titles = $(html).find('#mw-content-text')[0].children[11].children[0].children;
    let element = "";
    let innerElement = "";
    // Loop through each title
    for (let i = 2; i < titles.length; i++) {
        let outerSpan = titles[i].children[0].children[0].children[0];
        // Deal with titles that are formatted differently
        if (outerSpan.childElementCount > 0) {
            element = outerSpan.children[0].outerHTML;
            innerElement = outerSpan.children[0].innerText;
        } else {
            element = outerSpan.outerHTML;
            innerElement = outerSpan.innerText;
        }
        let skip = false;
        // Find the title that the player is currently using
        if (playerInfo[0].title == "Ironman" 
         || playerInfo[0].title == "Ironwoman" 
         || playerInfo[0].title == "the Ironman" 
         || playerInfo[0].title == "the Ironwoman" 
         || playerInfo[0].title == "Professor" 
         || playerInfo[0].title == "Sir"
         || playerInfo[0].title == "Don"
         || playerInfo[0].title == "The") {
            // Skip over titles that are similar in name but not equal
            skip = true;
        }
        if (playerInfo[0].title != "" && findTitle(innerElement, playerInfo[0].title)) {
            if (!(skip && (findTitle(innerElement, "Hardcore") 
                       || findTitle(innerElement, "Mad") 
                       || findTitle(innerElement, "Scion") 
                       || findTitle(innerElement, "Shape")
                       || findTitle(innerElement, "Deacon")
                       || findTitle(innerElement, "Delusional")
                       || findTitle(innerElement, "of the")))) { // Edge case for certain titles
                element = element.replace("[Name]", "")
                // Update the title value in HTML
                if (playerInfo[0].isSuffix) {
                    document.getElementById("titleSuffix").innerHTML = element;
                } else {
                    document.getElementById("title").innerHTML = element;
                }
                // If it's a multi gender title, use the correct gender
                if (innerElement.indexOf("/") != -1 && playerInfo[0].isSuffix) {
                    document.getElementById("titleSuffix").children[0].innerText = playerInfo[0].title;
                } else if (innerElement.indexOf("/") != -1) {
                    document.getElementById("title").children[0].innerText = playerInfo[0].title;
                }
                console.log(playerInfo[0].title);
                return;
            }
        }
    }
}

// Checks if the element contains the title value anywhere inside it
function findTitle(element, title) {
    // Keep track of our position in the string.
    let index = 0;
    // Split title into an array of characters
    let titleChar = title.split('');
    // Loop through all of the characters in the title.
    for (let i = 0; i < titleChar.length; i++) {
        // Find the current character starting from the last character we stopped on.
        index = element.indexOf(titleChar[i], index);
        // If the method returned -1, the character was not found, so the result is false.
        if (index == -1)
            return false;
    }
    // If we reach this point, that means all characters were found, so the result is true.
    return true;
}

// Deal with errors retrieving the data
function HandleError(data, type, typeString) {
    if (data.status == 404) { // if the player is not on the highscores
        console.log("Player not found on " + typeString + " highscores");
        // Notify the user if the player can't be found on any of the highscore
        if (type == 0) {
            document.getElementById("loading").style.display = "none";
            document.getElementById("helpText").innerText = "Player not found, please check the spelling or try another";
            document.getElementById("searchHelp").style.display = "block";
        }
    } else { // Reload the page if any other error occurs
        console.log("Error getting " + typeString + " status: " + data.status);
        location.reload();
    }
    dataReceived(-1);
}

// Prevent some elements from being interacted with
$("#header").submit(function (e) {
    e.preventDefault();
});
$("skill0").mousedown(function (e) { e.preventDefault(); });

// Go to a new page and search for the requested player, called when the user presses enter on the search field
function LoadUserPage() {
    let newURL = "";
    // Add the player name to the URL
    if (window.location.href.includes("?playerName=")) {
        newURL = window.location.href.slice(0, window.location.href.indexOf("?playerName=")) + "?playerName=" + document.getElementById("rsn").value;
    } else {
        newURL = window.location.href + "?playerName=" + document.getElementById("rsn").value;
    }
    // Go to the new page
    window.location.href = newURL;
}

// Start a new search and reset all data
function searchPlayer() {
    //Hide old search and show loading animation
    document.getElementById("leftData").style.display = "none";
    document.getElementById("mainData").style.display = "none";
    document.getElementById("highscoreArrowContainer").style.display = "none";
    document.getElementById("profileImg").setAttribute("src", "");
    document.getElementById("searchHelp").style.display = "none";
    document.getElementById("loading").style.display = "block";
    playerSkillsHC = [];
    playerSkillsIron = [];
    playerSkillsReg = [];
    playerClues = [];
    playerData = []
    highscoresReceived = [];
    questPoints = 0;
    wrongTiming = false;
    maxHighscore = "HC";
    currentHighscores = "HC";
    currentSortCol = "default";
    //GetUserData(document.getElementById("rsn").value);
    GetUserData(playerName);
    document.getElementById("rsn").blur();
}

// Show the player's data
function PageLoaded() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("leftData").style.display = "block";
    document.getElementById("mainData").style.display = "block";
    document.getElementById("highscoreArrowContainer").style.display = "block";
}

// Open the highscore page at the player's rank for the requested skill
function OpenHighscores(rowNum) {
    let skill = skillOrder[rowNum - 1];
    if (currentHighscores == "HC") {
        window.open("http://services.runescape.com/m=hiscore_hardcore_ironman/ranking?table=" + skill + "&category_type=0&user=" + playerData.name);
    } else if (currentHighscores == "Iron") {
        window.open("http://services.runescape.com/m=hiscore_ironman/ranking?table=" + skill + "&category_type=0&user=" + playerData.name);
    } else if (currentHighscores == "Reg") {
        window.open("http://services.runescape.com/m=hiscore/ranking?table=" + skill + "&category_type=0&user=" + playerData.name);
    }
}

// Show info about how to train a skill when it's clicked on
function ShowSkillData(skill) {
    // Get the previous selected skill and remove it's info window
    let prevElement = document.getElementById("skill" + prevActiveSkill).parentElement.childNodes[3]
    document.getElementById("arrow" + (skillOrder.indexOf(prevActiveSkill) + 1)).style.marginBottom = '7px';
    if (prevElement) {
        prevElement.remove();
    }
    if (skill == prevActiveSkill && !resetActiveSkill) { // If the skill window is already open, hide it
        skillDataActive = false;
        resetActiveSkill = true;
    } else { // If the window isn't active, load it
        prevActiveSkill = skill;
        // Get the important elements from the HTML
        let container = document.getElementById("skill" + skill).parentElement;
        let tempDiv = document.createElement('div');
        tempDiv.setAttribute('class', 'skillData');
        let tempTable = document.createElement('table');
        tempTable.innerHTML = '<tr><th>Method</th><th>Xp Each</th><th>Amount to goal</th><th>Xp/Hr</th><th>Hours to goal</th></tr>'
        let playerSkills = getHighscore();
        if (trainingMethods[skill].methods.length != 0) { // If there are training methods for this skill
            for (let i = 0; i < trainingMethods[skill].methods.length; i++) { // Loop through each one
                // Add the training method to the table
                let xphr = + trainingMethods[skill].methods[i].xp * + trainingMethods[skill].methods[i].perhr;
                tempTable.innerHTML = tempTable.innerHTML +
                    '<tr><td>' + trainingMethods[skill].methods[i].name +
                    '</td><td>' + numberWithCommas(trainingMethods[skill].methods[i].xp) +
                    '</td><td>' + numberWithCommas(Math.round(xpToGoal(playerSkills[skill].xp) / trainingMethods[skill].methods[i].xp)) +
                    '</td><td>' + numberWithCommas(xphr) +
                    '</td><td>' + numberWithCommas(Math.round(xpToGoal(playerSkills[skill].xp) / xphr)) + '</td></tr>'
            }
        }
        tempDiv.appendChild(tempTable);
        container.appendChild(tempDiv);
        // Move the arrow for the below row down to match the row's new location
        document.getElementById("arrow" + (skillOrder.indexOf(skill) + 1)).style.marginBottom = (tempTable.scrollHeight + 7) + 'px';
        resetActiveSkill = false;
        skillDataActive = true;
    }
}

// Handle the player's skills when they're found on a highscore
function HandlePlayerStats(data, type, typeString) {
    console.log("Player found on " + typeString + " highscores.");
    let playerSkills = [];
    let skills = data.split('\n'); // Split each line into a new value in the array
    let i = 0;
    // Loop through each skill and add the data to the playerSkills array
    for (i; i < 28; i++) {
        let skill = skills[i].split(','); // Split the array into rank, level and xp
        let tempSkill = {
            id: i,
            rank: parseInt(skill[0]),
            level: parseInt(skill[1]),
            xp: parseInt(skill[2])
        }
        playerSkills.push(tempSkill);
        //console.log(skills[i]);
    }
    playerClues = [];
    i = 53;
    //Loop through the 5 clue tiers and add that data to the playerClues array
    for (i; i < 58; i++) {
        let clue = skills[i].split(','); // Split the array into rank and the value
        let tempClueValue = 0;
        if (parseInt(clue[1]) != -1) {
            tempClueValue = parseInt(clue[1]);
        }
        let tempClue = {
            rank: parseInt(clue[0]),
            value: tempClueValue
        }
        playerClues.push(tempClue);
    }
    // Choose which highscore array to update
    switch (type) {
        case 0:
            playerSkillsReg = playerSkills;
            break;
        case 1:
            playerSkillsIron = playerSkills;
            break;
        case 2:
            playerSkillsHC = playerSkills;
            break;
    }
    //console.log(data);
    //TestOutput();
    dataReceived(type);
}

// When the program has finished analysing a set of received data
function dataReceived(type) {
    // Add the received highscore to the array of all highscored received
    highscoresReceived.push(type);
    // If all 3 highscores have been recieved
    if (highscoresReceived.length == 3) {
        // Sort from high to low
        highscoresReceived.sort(function (a, b) { return b - a });
        // Find the most exclusive highscore and create the page
        switch (highscoresReceived[0]) {
            case 0:
                maxHighscore = "Reg";
                currentHighscores = maxHighscore;
                CreateSkillList(playerSkillsReg);
                break;
            case 1:
                maxHighscore = "Iron";
                currentHighscores = maxHighscore;
                CreateSkillList(playerSkillsIron);
                break;
            case 2:
                maxHighscore = "HC";
                currentHighscores = maxHighscore;
                CreateSkillList(playerSkillsHC);
                break;
        }
        updateHighscore(false);
    }
}

// Get the active highscore
function getHighscore() {
    switch (currentHighscores) {
        case "Reg":
            return playerSkillsReg;
            break;
        case "Iron":
            return playerSkillsIron;
            break;
        case "HC":
            return playerSkillsHC;
            break;
    }
}

// Update some of the data on the left of the page
function UpdatePlayerData() {
    document.getElementById("profileImg").setAttribute("src", "http://services.runescape.com/m=avatar-rs/" + playerData.name + "/chat.png");
    document.getElementById("rsn").value = "";
    document.getElementById("rsn").placeholder = playerData.name;
    document.getElementById("totalLevel").innerText = numberWithCommas(playerData.totalskill);
    document.getElementById("totalXp").innerText = numberWithCommas(playerData.totalxp);
    document.getElementById("combatLevel").innerText = playerData.combatlevel;
    document.getElementById("levelsToMaxTotal").innerText = numberWithCommas(2736 - playerData.totalskill);
    //document.getElementById("rank").innerText = numberWithCommas(playerData.rank);
}

// Change the currently active highscore
function updateHighscore(newHighscore = true) {
    let select = document.getElementById("highscore");
    // Hide the info on the selected highscore
    document.getElementById("hcimInfo").style = "display: none;";
    document.getElementById("ironInfo").style = "display: none;";
    document.getElementById("regInfo").style = "display: none;";
    if (newHighscore) {
        currentHighscores = select.options[select.selectedIndex].value;
    }
    // Lock some options on the select if that highscore is unavailable
    if (maxHighscore == "HC") {
        select.options[2].disabled = false;
        select.options[1].disabled = false;
    } else if (maxHighscore == "Iron") {
        select.options[2].disabled = true;
        select.options[1].disabled = false;
    } else {
        select.options[2].disabled = true;
        select.options[1].disabled = true;
    }
    // Show the new highscore type
    if (currentHighscores == "HC") {
        document.getElementById("hcimInfo").style = "display: block;";
        select.selectedIndex = 2;
    } else if (currentHighscores == "Iron" && maxHighscore != "Reg") {
        document.getElementById("ironInfo").style = "display: block;";
        select.selectedIndex = 1;
    } else if (currentHighscores == "Reg") {
        document.getElementById("regInfo").style = "display: block;";
        select.selectedIndex = 0;
    }
    if (newHighscore) {
        RefreshPlayerData();
    }
}

// Re-create the skill list
function RefreshPlayerData() {
    // TODO: Use 'getHighscore()'?
    if (currentHighscores == "HC") {
        CreateSkillList(playerSkillsHC);
    } else if (currentHighscores == "Iron") {
        CreateSkillList(playerSkillsIron);
    } else if (currentHighscores == "Reg") {
        CreateSkillList(playerSkillsReg);
    }
    sort(currentSortCol, false);
}

// Create the list of skills
function CreateSkillList(playerSkills) {
    document.getElementById("rank").innerText = numberWithCommas(playerSkills[0].rank);
    document.getElementById("mainData").innerHTML = baseHTML;
    let lowestSkill = 99;
    let milestone = 0;
    let elite = false;
    let maxSkills = 0;
    let maxVSkills = 0;
    let maxXpSkills = 0;
    // Loop through each skill and create and fill each element
    for (s = 1; s < 28; s++) {
        let tempRank = '<div class="bar-text-rank">' + numberWithCommas(playerSkills[s].rank) + '</div>';
        let tempLevel = '<div class="bar-text-level">' + playerSkills[s].level + '</div>';
        let tempXp = '<div class="bar-text-xp">' + numberWithCommas(playerSkills[s].xp) + '</div>';
        let tempVLevelValue = "";
        let tempTNLValue = "";
        if (s != 27) {
            tempVLevelValue = getLevel(playerSkills[s].xp);
            tempTNLValue = getXpDiff(playerSkills[s].xp, getXp(getLevel(playerSkills[s].xp) + 1));
            elite = false;
        } else {
            tempVLevelValue = getLevel(playerSkills[s].xp, true);
            tempTNLValue = getXpDiff(playerSkills[s].xp, getXp(getLevel(playerSkills[s].xp, true) + 1, true), true);
            elite = true;
        }
        let tempVLevel = '<div class="bar-text-vlevel">' + tempVLevelValue + '</div>';
        let tempTNL = '<div class="bar-text-tnl">' + numberWithCommas(tempTNLValue) + '</div>';

        // Add data attributes to the parent element so it can be sorted by them
        let attrNum = document.createAttribute('data-num');
        attrNum.value = s;
        let attrSkill = document.createAttribute('data-skill');
        attrSkill.value = skills[s - 1];
        let attrRank = document.createAttribute('data-rank');
        attrRank.value = playerSkills[s].rank;
        let attrLvl = document.createAttribute('data-lvl');
        attrLvl.value = playerSkills[s].level;
        let attrVLvl = document.createAttribute('data-vlvl');
        attrVLvl.value = tempVLevelValue;
        let attrXp = document.createAttribute('data-xp');
        attrXp.value = playerSkills[s].xp;
        let attrTNL = document.createAttribute('data-tnl');
        attrTNL.value = tempTNLValue;

        // Get the element and set the attributes
        let currElement = document.getElementById("skill" + s)
        currElement.parentElement.setAttributeNode(attrNum);
        currElement.parentElement.setAttributeNode(attrSkill);
        currElement.parentElement.setAttributeNode(attrRank);
        currElement.parentElement.setAttributeNode(attrLvl);
        currElement.parentElement.setAttributeNode(attrVLvl);
        currElement.parentElement.setAttributeNode(attrXp);
        currElement.parentElement.setAttributeNode(attrTNL);
        // Add the data elements to the container
        currElement.innerHTML = currElement.innerHTML + tempRank + tempLevel + tempVLevel + tempXp + tempTNL + '<div class="bar-text-remaining"></div>' + '<div class="bar-text-percentage"></div>';
        // Find the player's lowest skill
        if (playerSkills[s].level < lowestSkill) {
            lowestSkill = playerSkills[s].level;
        }
        // Get totals of each skill level
        if (getLevel(playerSkills[s].xp, elite) >= 99 && getLevel(playerSkills[s].xp, elite) < 120) {
            maxSkills =  maxSkills + 1;
        } else if (getLevel(playerSkills[s].xp, elite) >= 120 && playerSkills[s].xp < 200000000) {
            maxVSkills =  maxVSkills + 1;
        } else if (playerSkills[s].xp == 200000000) {
            maxXpSkills =  maxXpSkills + 1;
        }
    }

    // Add Skill totals to page
    document.getElementById("99s").innerText = maxSkills;
    document.getElementById("120s").innerText = maxVSkills;
    document.getElementById("200ms").innerText = maxXpSkills;

    // Set the clues scroll values on the left
    document.getElementById("clueEasy").innerText = playerClues[0].value;
    document.getElementById("clueMed").innerText = playerClues[1].value;
    document.getElementById("clueHard").innerText = playerClues[2].value;
    document.getElementById("clueElite").innerText = playerClues[3].value;
    document.getElementById("clueMaster").innerText = playerClues[4].value;

    UpdateGoal();
    SetMilestone(playerSkills, lowestSkill);
    sort("default", false);
}

// Sort the skill list
function sort(column, reverse = true) {
    // Revert the active skill's highscore arrow to default temporarily
    if (skillOrder.length != 0) {
        document.getElementById("arrow" + (skillOrder.indexOf(prevActiveSkill) + 1)).style.marginBottom = '7px';
    }
    let rotate = "";
    // Revert the previously selected column's arrow to the default
    if (currentSortCol != "default") {
        document.getElementById(currentSortCol + "-arrow").setAttribute("src", "assets/images/arrowinactive.svg");
        document.getElementById(currentSortCol + "-arrow").setAttribute("class", "");
    }
    // Reverse the order if the column has been clicked twice
    if (currentSortCol == column && tinysort.defaults.order == 'asc' && reverse) {
        rotate = "rotate180";
        tinysort.defaults.order = 'desc';
    } else if (reverse) {
        tinysort.defaults.order = 'asc';
    }
    // Get all the rows
    let skillElements = document.getElementsByClassName("skill-container");
    // Sort the selected row and alter the column's arrow accordingly
    if (column == "default") {
        tinysort(skillElements, { data: 'num' });
    } else if (column == "skill") {
        tinysort(skillElements, { data: 'skill' });
        document.getElementById("skill-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("skill-arrow").setAttribute("class", rotate);
    } else if (column == "rank") {
        tinysort(skillElements, { data: 'rank' });
        document.getElementById("rank-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("rank-arrow").setAttribute("class", rotate);
    } else if (column == "lvl") {
        tinysort(skillElements, { data: 'lvl' }, { data: 'xp' });
        document.getElementById("lvl-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("lvl-arrow").setAttribute("class", rotate);
    } else if (column == "vlvl") {
        tinysort(skillElements, { data: 'vlvl' }, { data: 'xp' });
        document.getElementById("vlvl-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("vlvl-arrow").setAttribute("class", rotate);
    } else if (column == "xp") {
        tinysort(skillElements, { data: 'xp' });
        document.getElementById("xp-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("xp-arrow").setAttribute("class", rotate);
    } else if (column == "tnl") {
        tinysort(skillElements, { data: 'tnl' });
        document.getElementById("tnl-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("tnl-arrow").setAttribute("class", rotate);
    } else if (column == "rem") {
        tinysort(skillElements, { data: 'rem' });
        document.getElementById("rem-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("rem-arrow").setAttribute("class", rotate);
    } else if (column == "percent") {
        tinysort(skillElements, { data: 'percent' });
        document.getElementById("percent-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("percent-arrow").setAttribute("class", rotate);
    }
    // Find the order that the rows now appear in
    skillOrder = [];
    for (let i = 0; i < skillElements.length; i++) {
        skillOrder.push(parseInt(skillElements[i].getAttribute('data-num')));
    }
    // Move the highscore arrows down again since the active skill's position has moved
    if (skillDataActive) {
        document.getElementById("arrow" + (skillOrder.indexOf(prevActiveSkill) + 1)).style.marginBottom = (document.getElementsByClassName("skillData")[0].scrollHeight + 7) + 'px';
    }
    currentSortCol = column;
}

// Update the Goal levels/xp
function UpdateGoal() {
    if (playerData.length != 0) {
        let playerSkills = getHighscore();
        let xpRemaining = 0;
        let actualPlayerXp = 0;
        let vTotal = 0;
        // Loop through each skill
        for (s = 1; s < 28; s++) {
            let tempRemValue = "";
            // Calculate the xp remaining until the new goal is reached
            if (s != 27) { // Regular Skills
                if (s == 25 || s == 19) { // Skills that go up to level 120
                    tempRemValue = xpToGoal(playerSkills[s].xp, true, false)
                    actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, true, false);
                } else { // Skills that cap at 99
                    tempRemValue = xpToGoal(playerSkills[s].xp, false, false)
                    actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, false, false);
                }
                // Add to the player's virtual level
                vTotal = vTotal + getLevel(playerSkills[s].xp);
            } else { // Elite Skills
                tempRemValue = xpToGoal(playerSkills[s].xp, true, true)
                actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, true, true);
                // Add to the player's virtual level
                vTotal = vTotal + getLevel(playerSkills[s].xp, true);
            }
            // If the player has passed the goal, set the remaining xp to 0
            if (tempRemValue < 0) {
                tempRemValue = 0;
            }
            // Calculate the percentage value
            let tempPercentageValue = Math.round(playerSkills[s].xp / (playerSkills[s].xp + tempRemValue) * 100);

            // Add the data to the page
            let currElement = document.getElementById("skill" + s);
            let attrRem = document.createAttribute('data-rem');
            attrRem.value = tempRemValue;
            let attrPercent = document.createAttribute('data-percent');
            attrPercent.value = tempPercentageValue;
            currElement.parentElement.setAttributeNode(attrRem);
            currElement.parentElement.setAttributeNode(attrPercent);
            currElement.style = "width:" + tempPercentageValue + "%";
            currElement.childNodes[8].innerText = numberWithCommas(tempRemValue);
            currElement.childNodes[9].innerText = tempPercentageValue + "%";
            currElement.childNodes[9].setAttribute("style", "color: " + getColor(tempPercentageValue) + ";");
            xpRemaining = xpRemaining + tempRemValue;
        }
        // Update some of the data on the left
        document.getElementById("xpRem").innerText = numberWithCommas(xpRemaining);
        document.getElementById("percentRem").innerText = Math.round(actualPlayerXp / (actualPlayerXp + xpRemaining) * 100) + "%";
        document.getElementById("levelsToTrueMax").innerText = numberWithCommas(3270 - vTotal);
        PageLoaded();
    } else { // If the data was receieved in the wrong order
        wrongTiming = true;
    }
}

// Get the colour that a percentage value should use
const getColor = (percentage) => {
    if (percentage < 25) {
        return percentageColors[0];
    } else if (percentage < 50) {
        return percentageColors[1];
    } else if (percentage < 75) {
        return percentageColors[2];
    } else if (percentage < 100) {
        return percentageColors[3];
    } else if (percentage == 100) {
        return percentageColors[4];
    }
}

// Set the player's milestone (the maximum milestone cape that they can wear)
function SetMilestone(playerSkills, lowestSkill) {
    if (playerSkills[19].level == 120 && playerSkills[25].level == 120 && playerSkills[27].level == 120) {
        milestone = "Max Total";
    } else if (lowestSkill == 99) {
        milestone = "Maxed";
    } else if (lowestSkill == 1) {
        milestone = "1";
    } else {
        milestone = Math.floor(lowestSkill / 10) * 10;
    }
    document.getElementById("milestone").innerText = milestone;
}

// Output some data for debug
function TestOutput() {
    /*for (i = 1; i <= 120; i++) {
        console.log(i + " : " + getLevelXp(i));
    }*/
    console.log(playerSkills);
    console.log(playerClues);
}

// Add commas to numbers larger than 999
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get xp in a skill based on the level
function getXp(level, elite = false) {
    if (elite) { // Elite skills
        if (level > 150) { // Max level
            return 200000000;
        } else {
            // Get the xp from the eliteXp array
            return parseInt(eliteXp[level].xp);
        }
    }
    if (level > 120) { // Max level
        return 104273167;
    }
    let e = 0;
    // Calculate for regular skills
    for (let i = 1; i < level; i++) {
        e += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    return Math.min(Math.floor(e / 4), 200000000);
    //return Math.round((1/8)*level*(level - 1)+75*((Math.pow(2, (level-1)/7)-1)/(1-Math.pow(2,-1/7)))-0.109*level);
}

// Get the level in a skill based on the xp
function getLevel(xp, elite = false) {
    if (elite) { // Elite skills
        if (xp >= 194927409) {
            return 150; // Max level
        }
        // Find the level in the array
        for (let i = 0; i < eliteXp.length; i++) {
            if (eliteXp[i].xp <= xp && eliteXp[i + 1].xp > xp) {
                return i;
            }
        }
    }
    if (xp >= 104273167) {
        return 120; // Max level
    }
    let e = 0;
    let test = 0;
    let i = 0;
    // Calculate for regular skills
    do {
        i++;
        e += Math.floor(i + 300 * Math.pow(2, i / 7));
        test = Math.floor(e / 4);
    } while (test <= xp);

    return i;
}

// Get the difference between two xp values (used to calculate xp until the next level)
const getXpDiff = (startXp, endXp, elite = false) => {
    if (elite && startXp >= 194927409) { // Max elite skill level
        return 0;
    }
    if (startXp >= 104273167) { // Max virtual level
        return 0;
    }
    let diff = endXp - startXp;
    return Math.max(diff, -diff);
}

// Get the xp until the goal (minimum value is 0)
const xpToGoal = (currentXp, comp, elite, limit = false) => {
    let select = document.getElementById("target");
    let goal = select.options[select.selectedIndex].value;

    // Depending on the goal, get the xp remaining
    if (goal == "Max") {
        return Math.max(0, getXp(99, elite) - currentXp);
    } else if (goal == "MaxT") {
        if (comp) {
            return Math.max(0, getXp(120, elite) - currentXp);
        } else {
            return Math.max(0, getXp(99, elite) - currentXp);
        }
    } else if (goal == "120") {
        return Math.max(0, getXp(120, elite) - currentXp);
    } else if (goal == "200m") {
        return Math.max(0, 200000000 - currentXp);
    } else {
        return -1;
    }
}

// Opposite of the above function as it returns either the player's xp or the goal xp, depending on which is lower
// Used to calculate how much xp the player needs for the goal (excluding xp above the goal)
const xpLessThanGoal = (currentXp, comp, elite) => {
    let select = document.getElementById("target");
    let goal = select.options[select.selectedIndex].value;

    // Depending on the goal, get the lowest xp
    if (goal == "Max") {
        return Math.min(getXp(99, elite), currentXp);
    } else if (goal == "MaxT") {
        if (comp) {
            return Math.min(getXp(120, elite), currentXp);
        } else {
            return Math.min(getXp(99, elite), currentXp);
        }
    } else if (goal == "120") {
        return Math.min(getXp(120, elite), currentXp);
    } else if (goal == "200m") {
        return Math.min(200000000, currentXp);
    } else {
        return -1;
    }
}