let clanName = "IronSoulz"; // Use underscore instead of space
let pages = 4;
let currentPage = 1;
let players = [];
let currentPlayer = 1;
let numChecked = 0;

let titles = [];

getClan(currentPage);
document.getElementById("clanName").innerText = clanName;

function getClan(page) {
    $.ajax({
        type: 'GET',
        url: "http://allorigins.me/get?url=http://www.runeclan.com/clan/" + clanName + "/hiscores/" + page + "?skill=2&sort_by=xp&order=desc",
        dataType: "text", success: function (data) { HandlePlayers(data) }, error: function (data) { HandleError(data) }
    });
}

function HandleError(data) {
    console.log("RuneClan Error");
    getClan(currentPage)
}

function HandlePlayers(rawData) {
    let data = JSON.parse(rawData).contents;
    players = $(data).find(".clan_hs_wrap")[0].children[2].children[0].children;
    loopPlayers();
    /*for (let i = 1; i < 2; i = i + 2) {
        
        //console.log(players[i].children[1].innerText);
    }
    
    if (currentPage < pages) {
        currentPage = currentPage + 1;
        getClan(currentPage);
    }*/
}

function loopPlayers() {
    getUser(players[currentPlayer].children[1].innerText);
}

function getUser(user) {
    $.ajax({
        type: 'GET',
        url: "http://allorigins.me/get?url=http://services.runescape.com/m=hiscore_hardcore_ironman/ranking?table=0&category_type=0&time_filter=0&date=1522122130143&user=" + user,
        dataType: "text", success: function (data) { checkUser(data, user) }, error: function (data) { getUser(user) }
    });
}

function checkUser(rawData, name) {
    let data = JSON.parse(rawData).contents;
    console.log(data);
    let container = document.getElementById("clanMembersTable");
    let tempRow = document.createElement("tr");
    let tempCell = document.createElement("td");
    let player = $(data).find(".hover"); // .hover class hasn't loaded yet
    if (player.length == 0) {
        console.log("[NOT ON HIGHSCORES]" + name);
        tempCell.innerText = "[NOT ON HIGHSCORES]" + name;
        tempRow.appendChild(tempCell);
        container.appendChild(tempRow);
    } else if (player[0].classList.length != 1) {
        console.log("[NOT HCIM]" + name);
        tempCell.innerText = "[NOT HCIM]" + name;
        tempRow.appendChild(tempCell);
        container.appendChild(tempRow);
    } else {
        console.log(name);
    }
    numChecked = numChecked + 1;
    document.getElementById("num").innerText = numChecked;
    if (currentPlayer < 100 - 1) {
        currentPlayer = currentPlayer + 2;
        setTimeout(loopPlayers(), 200);
    } else if (currentPage < pages) {
        currentPage = currentPage + 1;
        currentPlayer = 1;
        getClan(currentPage);
    }
}