let clanName = "ironsoulz"; // Use underscore instead of space
let pages = 4;
let currentPage = 1;

let titles = [];

getTitles();

function getTitles() {
    $.ajax({
        url: 'http://allorigins.me/get?url=http://runescape.wikia.com/wiki/Titles', success: function (text) {
            let data = JSON.parse(text).contents;
            titles = $(data).find('#mw-content-text')[0].children[11].children[0].children;
            //console.log(titles);
            getClan(currentPage);
        }, error: function (data) { getTitles() }, dataType: 'text'
    }); // Loop if it fails to get data
}

function getClan(page) {
    $.ajax({
        type: 'GET',
        url: "http://allorigins.me/get?url=http://www.runeclan.com/clan/" + clanName + "/hiscores/" + page + "?skill=2&sort_by=xp&order=desc",
        dataType: "text", success: function (data) { HandlePlayers(data) }, error: function (data) { HandleError(data) }
    });
}

function HandleError(data) {
    console.log("RuneClan Error");
}

function HandlePlayers(rawData) {
    let data = JSON.parse(rawData).contents;
    let players = $(data).find(".clan_hs_wrap")[0].children[2].children[0].children;
    let tempPlayerArray = [];
    for (let i = 1; i < players.length; i = i + 2) {
        tempPlayerArray.push('"' + players[i].children[1].innerText + '"');
        //console.log(players[i].children[1].innerText);
    }
    getPlayerTitles(tempPlayerArray);
}

function getPlayerTitles(playerArray) {
    $.ajax({
        url: 'http://services.runescape.com/m=website-data/playerDetails.ws?names=[' + playerArray + ']',
        dataType: "jsonp", success: HandlePlayerInfo, error: function (data) { console.log("RuneScape Error"); }
    });
}

function HandlePlayerInfo(data) {
    let container = document.getElementById("clanMembersTable");
    for (let i = 0; i < data.length; i++) {
        let tempRow = document.createElement("tr");
        let tempPrefCell = document.createElement("td");
        let tempNameCell = document.createElement("td");
        let tempSufCell = document.createElement("td");
        let element = "";
        let innerElement = "";
        let tempTitle = "";
        tempPrefCell.classList.add("prefix");
        tempNameCell.innerText = data[i].name;
        tempSufCell.classList.add("suffix");
        /*if (data[i].isSuffix) {
            tempCell.innerText = data[i].name + tempTitle;
        } else {
            tempCell.innerText = tempTitle + data[i].name;
        }*/
        // Loop through each title
        for (let l = 2; l < titles.length; l = l + 1) {
            let outerSpan = titles[l].children[0].children[0].children[0];
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
            if (data[i].title == "Ironman" 
            || data[i].title == "Ironwoman" 
            || data[i].title == "the Ironman" 
            || data[i].title == "the Ironwoman" 
            || data[i].title == "Professor" 
            || data[i].title == "Sir"
            || data[i].title == "Don"
            || data[i].title == "The") {
                // Skip over titles that are similar in name but incorrect
                skip = true;
            }
            if (data[i].title != "" && findTitle(innerElement, data[i].title)) {
                if (!(skip && (findTitle(innerElement, "Hardcore") 
                || findTitle(innerElement, "Mad") 
                || findTitle(innerElement, "Scion") 
                || findTitle(innerElement, "Shape")
                || findTitle(innerElement, "Deacon")
                || findTitle(innerElement, "Delusional")
                || findTitle(innerElement, "of the")))) { // Edge case for certain titles
                    element = element.replace("[Name]", "")
                    // Update the title value in HTML
                    if (data[i].isSuffix) {
                        tempSufCell.innerHTML = element;
                    } else {
                        tempPrefCell.innerHTML = element;
                    }
                    // If it's a multi gender title, use the correct gender
                    if (innerElement.indexOf("/") != -1 && data[i].isSuffix) {
                        tempSufCell.children[0].innerText = data[i].title;
                    } else if (innerElement.indexOf("/") != -1) {
                        tempPrefCell.children[0].innerText = data[i].title;
                    }
                    //console.log(data[i].title);
                    break;
                }
            }
        }
        tempRow.appendChild(tempPrefCell);
        tempRow.appendChild(tempNameCell);
        tempRow.appendChild(tempSufCell);
        container.appendChild(tempRow);
    }
    if (currentPage < pages) {
        currentPage = currentPage + 1;
        getClan(currentPage);
    }
    //console.log(data);
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