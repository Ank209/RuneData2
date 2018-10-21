let percentageColors = ['#FF0000', '#FF9B00', '#E7E400', '#6CBC00', '#00BC00'];
let player1SkillsHC = [];
let player1SkillsIron = [];
let player1SkillsReg = [];
let player2SkillsHC = [];
let player2SkillsIron = [];
let player2SkillsReg = [];
let player1Data = [];
let player2Data = [];
let eliteXp = [];
let wrongTiming = false;
let player1Name = "";
let player2Name = "";
let baseHTMLLeft = "";
let baseHTMLRight = "";

let skillOrder = [];

let highscoresReceived = [];
let maxHighscore = "HC";
let currentHighscores = "HC";
let currentSortCol = "default";
let currentSortColNum = 1;

genHTML();

function genHTML() {
    let leftContainer = document.getElementById("mainDataLeft");
    let rightContainer = document.getElementById("mainDataRight");
    for (let i = 1; i <= 27; i++) {
        leftContainer.innerHTML = leftContainer.innerHTML + '<div class="skill-container" name="skillColumn1" onmouseenter="SkillHover(' + i + ', 1)" onmouseleave="SkillHoverExit(' + i + ', 1)"><div id="skill' + i + '_1" class="skill-bar"></div></div>'
        rightContainer.innerHTML = rightContainer.innerHTML + '<div class="skill-container" name="skillColumn2" onmouseenter="SkillHover(' + i + ', 2)" onmouseleave="SkillHoverExit(' + i + ', 2)"><div id="skill' + i + '_2" class="skill-bar"></div></div>'
    }
    
    baseHTMLLeft = document.getElementById("mainDataLeft").innerHTML;
    baseHTMLRight = document.getElementById("mainDataRight").innerHTML;
    CheckPlayers();
}

function CheckPlayers() {
    if (getQueryVariable("player1") && getQueryVariable("player2")) {
        player1Name = decodeURI(getQueryVariable("player1"));
        player2Name = decodeURI(getQueryVariable("player2"));
        document.getElementById("rsn1").value = player1Name;
        document.getElementById("rsn2").value = player2Name;
        searchPlayers();
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

$("#headerCompare").submit(function (e) {
    e.preventDefault();
});

function LoadUserPage() {
    let newURL = "";
    let newPlayer1Name = document.getElementById("rsn1").value;
    let newPlayer2Name = document.getElementById("rsn2").value;
    if (newPlayer1Name == "") {
        if (player1Name != "") {
            newPlayer1Name = player1Name;
        } else {
            SearchError(1);
            return;
        }
    }
    if (newPlayer2Name == "") {
        if (player2Name != "") {
            newPlayer2Name = player2Name;
        } else {
            SearchError(2);
            return;
        }
    }

    if (window.location.href.includes("?player1=")) {
        newURL = window.location.href.slice(0, window.location.href.indexOf("?player1=")) + "?player1=" + newPlayer1Name + "&player2=" + newPlayer2Name;
    } else if (window.location.href.includes("&player2=")) {
        newURL = window.location.href.slice(0, window.location.href.indexOf("&player2=")) + "?player1=" + newPlayer1Name + "&player2=" + newPlayer2Name;
    } else {
        newURL = window.location.href + "?player1=" + document.getElementById("rsn1").value + "&player2=" + document.getElementById("rsn2").value;
    }
    window.location.href = newURL;
}

function SearchError(playerNum) {
    if (playerNum == 1) {
        document.getElementById("searchHelp").innerText = "Please enter the name of the first player";
    } else if (playerNum == 2) {
        document.getElementById("searchHelp").innerText = "Please enter the name of the second player to compare with";
    }
    document.getElementById("searchHelp").style.display = "block";
}

function searchPlayers() {
    //Hide old search and show loading animation
    document.getElementsByClassName("extraInfo")[0].style.display = "none";
    document.getElementById("mainDataLeft").style.display = "none";
    document.getElementById("skill-list").style.display = "none";
    document.getElementById("mainDataRight").style.display = "none";
    document.getElementById("searchHelp").style.display = "none";
    document.getElementById("loading").style.display = "block";
    player1SkillsHC = [];
    player1SkillsIron = [];
    player1SkillsReg = [];
    player1Data = []
    player2SkillsHC = [];
    player2SkillsIron = [];
    player2SkillsReg = [];
    player2Data = []
    highscoresReceived = [];
    wrongTiming = false;
    maxHighscore = "HC";
    currentHighscores = "HC";
    currentSortCol = "default";
    currentSortColNum = 1;
    //GetUserData(document.getElementById("rsn").value);
    GetUserData(player1Name, 1);
    GetUserData(player2Name, 2);
    document.getElementById("rsn1").blur();
    document.getElementById("rsn2").blur();
}

function GetUserData(searchTerm, playerNum) {
    $.ajax({
        url: "assets/eliteskillxp.json", dataType: "json", success: function (data) { eliteXp = data; }
    });
    $.ajax({
        url: "http://allorigins.me/get?url=https://apps.runescape.com/runemetrics/profile/profile?user=" + searchTerm + "&activities=0",
        dataType: "json", success: function (data) { HandlePlayerData(data, playerNum) }
    });
    $.ajax({
        type: 'GET',
        url: "http://allorigins.me/get?url=http://services.runescape.com/m=hiscore_hardcore_ironman/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { HandleNetwork(data, 2, "HC", playerNum) }, error: function (data) { HandleError(data, 2, "HC", playerNum) }
    });
    $.ajax({
        url: "http://allorigins.me/get?url=http://services.runescape.com/m=hiscore_ironman/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { HandleNetwork(data, 1, "Iron", playerNum) }, error: function (data) { HandleError(data, 1, "Iron", playerNum) }
    });
    $.ajax({
        url: "http://allorigins.me/get?url=http://services.runescape.com/m=hiscore/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { HandleNetwork(data, 0, "Reg", playerNum) }, error: function (data) { HandleError(data, 0, "Reg", playerNum) }
    });
}

function HandlePlayerData(rawData, playerNum) {
    data = JSON.parse(rawData.contents);
    //console.log(data);
    if (playerNum == 1) {
        player1Data = data;
    } else if (playerNum == 2) {
        player2Data = data;
    }
    if (wrongTiming) {
        UpdateGoal(playerNum);
    }
    if (player1Data.name) {
        UpdatePlayerData(playerNum);
    } else if (player2Data.name) {
        UpdatePlayerData(playerNum);
    }
}

function UpdatePlayerData(playerNum) {
    if (playerNum == 1 && player1Data.name) {
        document.getElementById("rsn" + playerNum).value = "";
        document.getElementById("rsn" + playerNum).placeholder = player1Data.name;
    } else if (playerNum == 2 && player2Data.name) {
        document.getElementById("rsn" + playerNum).value = "";
        document.getElementById("rsn" + playerNum).placeholder = player2Data.name;
    }
}

function HandleNetwork(rawData, type, typeString, playerNum) {
    data = JSON.parse(rawData);
    if (data.status.http_code == 200) {
        HandlePlayerStats(data, type, typeString, playerNum)
    } else if (data.status.http_code == 404) {
        console.log("Player " + playerNum + " not found on " + typeString + " highscores");
        if (type == 0) {

        }
        dataReceived(-playerNum);
    } else {
        console.log("Error getting " + typeString + " status: " + error.status);
        location.reload();
    }
}

function HandlePlayerStats(data, type, typeString, playerNum) {
    console.log("Player " + playerNum + " found on " + typeString + " highscores.");
    let playerSkills = [];
    let skills = data.contents.split('\n');
    let i = 0;
    for (i; i < 28; i++) {
        let skill = skills[i].split(',');
        let tempSkill = {
            id: i,
            rank: parseInt(skill[0]),
            level: parseInt(skill[1]),
            xp: parseInt(skill[2])
        }
        playerSkills.push(tempSkill);
        //console.log(skills[i]);
    }
    /*playerClues = [];
    i = 52;
    for (i; i < 57; i++) {
        let clue = skills[i].split(',');
        let tempClueValue = 0;
        if (parseInt(clue[1]) != -1) {
            tempClueValue = parseInt(clue[1]);
        }
        let tempClue = {
            rank: parseInt(clue[0]),
            value: tempClueValue
        }
        playerClues.push(tempClue);
    }*/
    if (playerNum == 1) {
        switch (type) {
            case 0:
                player1SkillsReg = playerSkills;
                break;
            case 1:
                player1SkillsIron = playerSkills;
                break;
            case 2:
                player1SkillsHC = playerSkills;
                break;
        }
    } else if (playerNum == 2) {
        switch (type) {
            case 0:
                player2SkillsReg = playerSkills;
                break;
            case 1:
                player2SkillsIron = playerSkills;
                break;
            case 2:
                player2SkillsHC = playerSkills;
                break;
        }
    }
    //console.log(data);
    //TestOutput();
    dataReceived(type);
}

function dataReceived(type) {
    highscoresReceived.push(type);
    if (highscoresReceived.length == 6) {
        highscoresReceived.sort(function (a, b) { return b - a });
        let HCValid = 0;
        let IronValid = 0;
        let player1Error = 0;
        let player2Error = 0;
        for (let i = 0; i < highscoresReceived.length; i++) {
            if (highscoresReceived[i] == 2) {
                HCValid = HCValid + 1;
            } else if (highscoresReceived[i] == 1) {
                IronValid = IronValid + 1;
            } else if (highscoresReceived[i] == -1) {
                player1Error = player1Error + 1;
            } else if (highscoresReceived[i] == -2) {
                player2Error = player2Error + 1;
            }
        }
        if (player1Error == 3) {
            document.getElementById("loading").style.display = "none";
            document.getElementById("helpText").innerText = "First player not found, please check the spelling or try another";
            document.getElementById("searchHelp").style.display = "block";
            return;
        } else if (player2Error == 3) {
            document.getElementById("loading").style.display = "none";
            document.getElementById("helpText").innerText = "Second player not found, please check the spelling or try another";
            document.getElementById("searchHelp").style.display = "block";
            return;
        }
        if (HCValid == 2) {
            maxHighscore = "HC";
            currentHighscores = maxHighscore;
            CreateSkillList(player1SkillsHC, 1);
            CreateSkillList(player2SkillsHC, 2);
        } else if (IronValid == 2) {
            maxHighscore = "Iron";
            currentHighscores = maxHighscore;
            CreateSkillList(player1SkillsIron, 1);
            CreateSkillList(player2SkillsIron, 2);
        } else {
            maxHighscore = "Reg";
            currentHighscores = maxHighscore;
            CreateSkillList(player1SkillsReg, 1);
            CreateSkillList(player2SkillsReg, 2);
        }
        updateHighscore(false);
    }
}

function CreateSkillList(playerSkills, playerNum) {
    if (playerNum == 1) {
        document.getElementById("mainDataLeft").innerHTML = baseHTMLLeft;
    } else if (playerNum == 2) {
        document.getElementById("mainDataRight").innerHTML = baseHTMLRight;
    }
    for (s = 1; s < 28; s++) {
        let tempRank = '';
        let tempLevel = '';
        let tempXp = '';
        let tempVLevel = '';
        let tempPercent = '';
        let tempVLevelValue = "";
        let tempTNLValue = "";
        if (s != 27) {
            tempVLevelValue = getLevel(playerSkills[s].xp);
            tempTNLValue = getXpDiff(playerSkills[s].xp, getXp(getLevel(playerSkills[s].xp) + 1));
        } else {
            tempVLevelValue = getLevel(playerSkills[s].xp, true);
            tempTNLValue = getXpDiff(playerSkills[s].xp, getXp(getLevel(playerSkills[s].xp, true) + 1, true), true);
        }
        if (playerNum == 1) {
            tempRank = '<div class="bar-text-rank compareL">' + numberWithCommas(playerSkills[s].rank) + '</div>';
            tempLevel = '<div class="bar-text-level compareL">' + playerSkills[s].level + '</div>';
            tempXp = '<div class="bar-text-xp compareL">' + numberWithCommas(playerSkills[s].xp) + '</div>';
            tempVLevel = '<div class="bar-text-vlevel compareL">' + tempVLevelValue + '</div>';
            tempPercent = '<div class="bar-text-percentage compareL"></div>';
        } else if (playerNum == 2) {
            tempRank = '<div class="bar-text-rank compare">' + numberWithCommas(playerSkills[s].rank) + '</div>';
            tempLevel = '<div class="bar-text-level compare">' + playerSkills[s].level + '</div>';
            tempXp = '<div class="bar-text-xp compare">' + numberWithCommas(playerSkills[s].xp) + '</div>';
            tempVLevel = '<div class="bar-text-vlevel compare">' + tempVLevelValue + '</div>';
            tempPercent = '<div class="bar-text-percentage compare"></div>';
        }

        let attrNum = document.createAttribute('data-num');
        attrNum.value = s;
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

        let currElement = document.getElementById("skill" + s + "_" + playerNum);
        currElement.parentElement.setAttributeNode(attrNum);
        currElement.parentElement.setAttributeNode(attrRank);
        currElement.parentElement.setAttributeNode(attrLvl);
        currElement.parentElement.setAttributeNode(attrVLvl);
        currElement.parentElement.setAttributeNode(attrXp);
        currElement.parentElement.setAttributeNode(attrTNL);
        //currElement.data('xp', playerSkills[s].xp)
        currElement.parentElement.innerHTML = currElement.parentElement.innerHTML + tempRank + tempLevel + tempVLevel + tempXp + tempPercent;
    }
    UpdateGoal(playerNum);
    sort("default", 1, false);
}

function setSkillTextColor() {
    let player1Skills = getHighscore(1);
    let player2Skills = getHighscore(2);
    for (let s = 1; s < 28; s++) {
        if (player1Skills[s].xp > player2Skills[s].xp) {
            document.getElementById("skill" + s + "_" + 1).parentElement.style.color = "#FFF";
        } else if (player1Skills[s].xp < player2Skills[s].xp) {
            document.getElementById("skill" + s + "_" + 2).parentElement.style.color = "#FFF";
        } else if (player1Skills[s].rank < player2Skills[s].rank) {
            document.getElementById("skill" + s + "_" + 1).parentElement.style.color = "#FFF";
        } else {
            document.getElementById("skill" + s + "_" + 2).parentElement.style.color = "#FFF";
        }
    }
}

function SkillHover(row, column) {
    if (column == 1) {
        document.getElementById("skill" + row + "_" + 2).classList.add('skill-bar-hover');
        document.getElementById("skill" + row + "_" + 2).parentElement.classList.add('skill-container-hover');
    } else if (column == 2) {
        document.getElementById("skill" + row + "_" + 1).classList.add('skill-bar-hover');
        document.getElementById("skill" + row + "_" + 1).parentElement.classList.add('skill-container-hover');
    }
}
function SkillHoverExit(row, column) {
    if (column == 1) {
        document.getElementById("skill" + row + "_" + 2).classList.remove('skill-bar-hover');
        document.getElementById("skill" + row + "_" + 2).parentElement.classList.remove('skill-container-hover');
    } else if (column == 2) {
        document.getElementById("skill" + row + "_" + 1).classList.remove('skill-bar-hover');
        document.getElementById("skill" + row + "_" + 1).parentElement.classList.remove('skill-container-hover');
    }
}

function UpdateAllGoals() {
    UpdateGoal(1);
    UpdateGoal(2);
}

function UpdateGoal(playerNum) {
    if (playerNum == 1) {
        playerData = player1Data;
    } else if (playerNum == 2) {
        playerData = player2Data;
    }
    let actualPlayerXp = 0;
    if (playerData.length != 0) {
        let playerSkills = getHighscore(playerNum);
        let xpRemaining = 0;
        for (s = 1; s < 28; s++) {
            let tempRemValue = "";
            if (s != 27) {
                if (s == 25 || s == 19) {
                    tempRemValue = xpToGoal(playerSkills[s].xp, true, false)
                    actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, true, false);
                } else {
                    tempRemValue = xpToGoal(playerSkills[s].xp, false, false)
                    actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, false, false);
                }
            } else {
                tempRemValue = xpToGoal(playerSkills[s].xp, true, true)
                actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, true, true);
            }
            if (tempRemValue < 0) {
                tempRemValue = 0;
            }

            let tempPercentageValue = Math.round((playerSkills[s].xp / (playerSkills[s].xp + tempRemValue) * 100) * 100) / 100;
            let currElement = document.getElementById("skill" + s + "_" + playerNum);

            let attrPercent = document.createAttribute('data-percent');
            attrPercent.value = tempPercentageValue;
            currElement.parentElement.setAttributeNode(attrPercent);
            if (playerNum == 1) {
                currElement.style = "width: " + tempPercentageValue + "%; margin-left: " + (100 - tempPercentageValue + 0.01) + "%;";
            } else if (playerNum == 2) {
                currElement.style = "width: " + tempPercentageValue + "%";
            }
            currElement.parentElement.childNodes[5].innerText = Math.round(tempPercentageValue * 10) / 10 + "%";
            currElement.parentElement.childNodes[5].setAttribute("style", "color: " + getColor(tempPercentageValue) + ";");
            xpRemaining = xpRemaining + tempRemValue;
        }
        document.getElementById("goalPercent" + playerNum).innerText = Math.round(actualPlayerXp / (actualPlayerXp + xpRemaining) * 100) + "%";
        document.getElementById("goalPercent" + playerNum).style.color = getColor(Math.round(actualPlayerXp / (actualPlayerXp + xpRemaining) * 100))
        document.getElementById("goalXp" + playerNum).innerText = numberWithCommas(xpRemaining);
        PageLoaded();
    } else {
        wrongTiming = true;
    }
}

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

const getHighscore = (playerNum) => {
    if (playerNum == 1) {
        switch (currentHighscores) {
            case "Reg":
                return player1SkillsReg;
                break;
            case "Iron":
                return player1SkillsIron;
                break;
            case "HC":
                return player1SkillsHC;
                break;
        }
    } else if (playerNum == 2) {
        switch (currentHighscores) {
            case "Reg":
                return player2SkillsReg;
                break;
            case "Iron":
                return player2SkillsIron;
                break;
            case "HC":
                return player2SkillsHC;
                break;
        }
    }
}

function PageLoaded() {
    document.getElementById("loading").style.display = "none";
    document.getElementsByClassName("extraInfo")[0].style.display = "block";
    document.getElementById("mainDataLeft").style.display = "block";
    document.getElementById("skill-list").style.display = "block";
    document.getElementById("mainDataRight").style.display = "block";
}

function updateHighscore(newHighscore = true) {
    let select = document.getElementById("highscore");
    if (newHighscore) {
        currentHighscores = select.options[select.selectedIndex].value;
    }
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
    if (currentHighscores == "HC") {
        select.selectedIndex = 2;
    } else if (currentHighscores == "Iron" && maxHighscore != "Reg") {
        select.selectedIndex = 1;
    } else if (currentHighscores == "Reg") {
        select.selectedIndex = 0;
    }
    if (newHighscore) {
        RefreshPlayerData();
    }
    setSkillTextColor();
}

function RefreshPlayerData() {
    if (currentHighscores == "HC") {
        CreateSkillList(player1SkillsHC, 1);
        CreateSkillList(player2SkillsHC, 2);
    } else if (currentHighscores == "Iron") {
        CreateSkillList(player1SkillsIron, 1);
        CreateSkillList(player2SkillsIron, 2);
    } else if (currentHighscores == "Reg") {
        CreateSkillList(player1SkillsReg, 1);
        CreateSkillList(player2SkillsReg, 2);
    }
    sort(currentSortCol, currentSortColNum, false);
}

function sort(columnName, columnNum, reverse = true) {
    let rotate = "";
    if (currentSortCol != "default") {
        document.getElementById(currentSortCol + "-arrow" + currentSortColNum).setAttribute("src", "assets/images/arrowinactive.svg");
        document.getElementById(currentSortCol + "-arrow" + currentSortColNum).setAttribute("class", "");
    }
    if (currentSortCol == columnName && tinysort.defaults.order == 'asc' && reverse && columnNum == currentSortColNum) {
        rotate = "rotate180";
        tinysort.defaults.order = 'desc';
    } else if (reverse) {
        tinysort.defaults.order = 'asc';
    }
    let mainElements = [];
    let secondaryElements = [];
    if (columnNum == 1 || columnName == "default") {
        mainElements = document.getElementsByName("skillColumn1");
        secondaryElements = document.getElementsByName("skillColumn2");
    } else if (columnNum == 2) {
        mainElements = document.getElementsByName("skillColumn2");
        secondaryElements = document.getElementsByName("skillColumn1");
    }
    if (columnName == "default") {
        tinysort(mainElements, { data: 'num' });
    } else if (columnName == "rank") {
        tinysort(mainElements, { data: 'rank' });
        document.getElementById("rank-arrow" + columnNum).setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("rank-arrow" + columnNum).setAttribute("class", rotate);
    } else if (columnName == "lvl") {
        tinysort(mainElements, { data: 'lvl' }, { data: 'xp' });
        document.getElementById("lvl-arrow" + columnNum).setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("lvl-arrow" + columnNum).setAttribute("class", rotate);
    } else if (columnName == "vlvl") {
        tinysort(mainElements, { data: 'vlvl' }, { data: 'xp' });
        document.getElementById("vlvl-arrow" + columnNum).setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("vlvl-arrow" + columnNum).setAttribute("class", rotate);
    } else if (columnName == "xp") {
        tinysort(mainElements, { data: 'xp' });
        document.getElementById("xp-arrow" + columnNum).setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("xp-arrow" + columnNum).setAttribute("class", rotate);
    } else if (columnName == "percent") {
        tinysort(mainElements, { data: 'percent' });
        document.getElementById("percent-arrow" + columnNum).setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("percent-arrow" + columnNum).setAttribute("class", rotate);
    }
    skillOrder = [];
    for (let i = 0; i < mainElements.length; i++) {
        skillOrder.push(parseInt(mainElements[i].getAttribute('data-num')));
    }
    tinysort(secondaryElements, {sortFunction:function(a, b) {
        var rowA = skillOrder.indexOf(parseInt(a.elm.getAttribute('data-num')));
        var rowB = skillOrder.indexOf(parseInt(b.elm.getAttribute('data-num')));
    
        return rowA == rowB ? 0 : (rowA > rowB ? 1 : -1);
    }});
    let skillIcons = document.getElementsByClassName("bar-text-icon");
    tinysort(skillIcons, {sortFunction:function(a, b) {
        var rowA = skillOrder.indexOf(parseInt(a.elm.getAttribute('data-skill')));
        var rowB = skillOrder.indexOf(parseInt(b.elm.getAttribute('data-skill')));
    
        return rowA == rowB ? 0 : (rowA > rowB ? 1 : -1);
    }});
    currentSortCol = columnName;
    currentSortColNum = columnNum;
}

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const getLevel = (xp, elite = false) => {
    if (elite) {
        if (xp >= 194927409) {
            return 150;
        }
        for (let i = 0; i < eliteXp.length; i++) {
            if (eliteXp[i].xp <= xp && eliteXp[i + 1].xp > xp) {
                return i;
            }
        }
    }
    if (xp >= 104273167) {
        return 120;
    }
    let e = 0;
    let test = 0;
    let i = 0;
    do {
        i++;
        e += Math.floor(i + 300 * Math.pow(2, i / 7));
        test = Math.floor(e / 4);
    } while (test <= xp);

    return i;
}

const getXpDiff = (startXp, endXp, elite = false) => {
    if (elite && startXp >= 194927409) {
        return 0;
    }
    if (startXp >= 104273167) {
        return 0;
    }
    let diff = endXp - startXp;
    return Math.max(diff, -diff);
}

const getXp = (level, elite = false) => {
    if (elite) {
        if (level > 150) {
            return 200000000;
        } else {
            return parseInt(eliteXp[level].xp);
        }
    }
    if (level > 120) {
        return 104273167;
    }
    let e = 0;
    for (let i = 1; i < level; i++) {
        e += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    return Math.min(Math.floor(e / 4), 200000000);
    //return Math.round((1/8)*level*(level - 1)+75*((Math.pow(2, (level-1)/7)-1)/(1-Math.pow(2,-1/7)))-0.109*level);
}

const xpToGoal = (currentXp, comp, elite, limit = false) => {
    let select = document.getElementById("target");
    let goal = select.options[select.selectedIndex].value;

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

const xpLessThanGoal = (currentXp, comp, elite) => {
    let select = document.getElementById("target");
    let goal = select.options[select.selectedIndex].value;

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