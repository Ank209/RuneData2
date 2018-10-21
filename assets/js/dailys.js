let repeatables = "" // List of all Repeatables
Cookies.defaults.expires = 365 * 24 * 60 * 60; // Set default expiry time of cookies to 1 year

// Get the repeatables from the json file
$.ajax({
    url: "assets/repeatables.json", dataType: "json", success: function (data) { repeatables = data; genList(); }
});

// Generate HTML for the list of repeatables
function genList() {
    let dailyContainer = document.getElementById("daily");
    // For every daily event
    for (let i = 0; i < repeatables.daily.length; i++) {
        // Create the row in the table for this daily and set it's id and class
        let row = document.createElement('tr');
        row.id = 'daily_' + i;
        row.classList.add('repRowDay')
        // Create the cells for the tick icon and the daily's data 
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="complete(\'' + row.id + '\', \'' + repeatables.daily[i].id + '\')"><img src="assets/images/tick.svg" height="30" width="30" draggable=false></td>';
        row.innerHTML = row.innerHTML + '<td width="150px;">' + toTitleCase(repeatables.daily[i].id) + '</td>';
        row.innerHTML = row.innerHTML + '<td>' + repeatables.daily[i].notes + '</td>';
        // Create the cell for the links and fill it
        let links = document.createElement('td');
        links.width = 125;
        // Get all the links for this daily
        if (repeatables.daily[i].links.length != 0) {
            for (let l = 0; l < repeatables.daily[i].links.length; l++) {
                links.innerHTML = links.innerHTML + '<a href="' + repeatables.daily[i].links[l].link + '">' + toTitleCase(repeatables.daily[i].links[l].name) + '</a>';
            }
        }
        row.appendChild(links);
        // Create the cells for the exclamation and cross icons
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="important(\'' + row.id + '\', \'' + repeatables.daily[i].id + '\')"><img src="assets/images/exclamation.svg" height="30" width="30" draggable=false></td>';
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="ignore(\'' + row.id + '\', \'' + repeatables.daily[i].id + '\')"><img src="assets/images/cross.svg" height="30" width="30" draggable=false></td>';
        // Add the row to the table
        dailyContainer.appendChild(row);
    }
    let weeklyContainer = document.getElementById("weekly");
    // For every weekly event
    for (let i = 0; i < repeatables.weekly.length; i++) {
        // Create the row in the table for this weekly and set it's id and class
        let row = document.createElement('tr');
        row.id = 'weekly_' + i;
        row.classList.add('repRowWeek')
        // Create the cells for the tick icon and the weekly's data 
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="complete(\'' + row.id + '\', \'' + repeatables.weekly[i].id + '\')"><img src="assets/images/tick.svg" height="30" width="30" draggable=false></td>';
        row.innerHTML = row.innerHTML + '<td width="200px;">' + toTitleCase(repeatables.weekly[i].id) + '</td>';
        row.innerHTML = row.innerHTML + '<td>' + repeatables.weekly[i].notes + '</td>';
        // Create the cell for the links and fill it
        let links = document.createElement('td');
        links.width = 125;
        // Get all the links for this weekly
        if (repeatables.weekly[i].links.length != 0) {
            for (let l = 0; l < repeatables.weekly[i].links.length; l++) {
                links.innerHTML = links.innerHTML + '<a href="' + repeatables.weekly[i].links[l].link + '">' + toTitleCase(repeatables.weekly[i].links[l].name) + '</a>';
            }
        }
        row.appendChild(links);
        // Create the cells for the exclamation and cross icons
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="important(\'' + row.id + '\', \'' + repeatables.weekly[i].id + '\')"><img src="assets/images/exclamation.svg" height="30" width="30" draggable=false></td>';
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="ignore(\'' + row.id + '\', \'' + repeatables.weekly[i].id + '\')"><img src="assets/images/cross.svg" height="30" width="30" draggable=false></td>';
        // Add the row to the table
        weeklyContainer.appendChild(row);
    }
    let monthlyContainer = document.getElementById("monthly");
    for (let i = 0; i < repeatables.monthly.length; i++) {
        // Create the row in the table for this weekly and set it's id and class
        let row = document.createElement('tr');
        row.id = 'monthly_' + i;
        row.classList.add('repRowMonth')
        // Create the cells for the tick icon and the monthly's data 
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="complete(\'' + row.id + '\', \'' + repeatables.monthly[i].id + '\')"><img src="assets/images/tick.svg" height="30" width="30" draggable=false></td>';
        row.innerHTML = row.innerHTML + '<td width="150px;">' + toTitleCase(repeatables.monthly[i].id) + '</td>';
        row.innerHTML = row.innerHTML + '<td>' + repeatables.monthly[i].notes + '</td>';
        // Create the cell for the links and fill it
        let links = document.createElement('td');
        links.width = 125;
        // Get all the links for this monthly
        if (repeatables.monthly[i].links.length != 0) {
            for (let l = 0; l < repeatables.monthly[i].links.length; l++) {
                links.innerHTML = links.innerHTML + '<a href="' + repeatables.monthly[i].links[l].link + '">' + toTitleCase(repeatables.monthly[i].links[l].name) + '</a>';
            }
        }
        row.appendChild(links);
        // Create the cells for the exclamation and cross icons
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="important(\'' + row.id + '\', \'' + repeatables.monthly[i].id + '\')"><img src="assets/images/exclamation.svg" height="30" width="30" draggable=false></td>';
        row.innerHTML = row.innerHTML + '<td width="30px;" onclick="ignore(\'' + row.id + '\', \'' + repeatables.monthly[i].id + '\')"><img src="assets/images/cross.svg" height="30" width="30" draggable=false></td>';
        // Add the row to the table
        monthlyContainer.appendChild(row);
    }
    loadCookies()
}

// Capitalises the first letter of each word for a string
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

// Get the users cookies
function loadCookies() {
    // Find the previous daily reset
    let prevDailyReset = new Date();
    prevDailyReset.setUTCHours(0, 0, 0, 0);
    console.log(prevDailyReset.toUTCString());
    // For each daily check if it's outdated and update the interface
    for (let i = 0; i < repeatables.daily.length; i++) {
        checkOutdated(repeatables.daily[i].id, prevDailyReset);
        updateInterface('daily_' + i, repeatables.daily[i].id);
    }
    // Find the previous weekly reset
    let prevWeeklyReset = new Date();
    prevWeeklyReset.setUTCDate(prevWeeklyReset.getUTCDate() - (prevWeeklyReset.getUTCDay() + 4) % 7);
    prevWeeklyReset.setUTCHours(0, 0, 0, 0);
    console.log(prevWeeklyReset.toUTCString());
    // For each weekly check if it's outdated and update the interface
    for (let i = 0; i < repeatables.weekly.length; i++) {
        checkOutdated(repeatables.weekly[i].id, prevWeeklyReset)
        updateInterface('weekly_' + i, repeatables.weekly[i].id);
    }
    // Find the previous monthly reset
    let prevMonthlyReset = new Date();
    prevMonthlyReset.setUTCDate(1);
    prevMonthlyReset.setUTCHours(0, 0, 0, 0);
    console.log(prevMonthlyReset.toUTCString());
    // For each monthly check if it's outdated and update the interface
    for (let i = 0; i < repeatables.monthly.length; i++) {
        checkOutdated(repeatables.monthly[i].id);
        updateInterface('monthly_' + i, repeatables.monthly[i].id);
    }
    // Sort the dailys, weeklies and monthlies
    let rows = document.getElementsByClassName("repRowDay");
    tinysort(rows, { data: 'num' });
    rows = document.getElementsByClassName("repRowWeek");
    tinysort(rows, { data: 'num' });
    rows = document.getElementsByClassName("repRowMonth");
    tinysort(rows, { data: 'num' });
}

// Checks if a cookie is outdated
function checkOutdated(repId, prevReset) {
    let cookie = Cookies.getJSON(repId);
    // If a cookie is outdated, set it's completion status to false
    if (cookie != undefined && cookie.date < prevReset) {
        Cookies.set(repId, { "complete": false, "important": cookie.important, "ignore": cookie.ignore, "date": cookie.date });
    }
}

// Update the colours for each row according to cookie data
function updateInterface(rowId, repId) {
    cookie = Cookies.getJSON(repId);
    // sortNum is a value from 1 to 4 which is used to sort the rows by importance
    let sortNum = document.createAttribute('data-num');
    if (cookie != undefined) {
        if (cookie.complete) { // If the row has been completed
            document.getElementById(rowId).classList.add('complete');
            sortNum.value = 3;
            document.getElementById(rowId).setAttributeNode(sortNum);
            // Add important and ignore if needed
            if (cookie.important) {
                document.getElementById(rowId).classList.add('important');
            }
            if (cookie.ignore) {
                document.getElementById(rowId).classList.add('ignore');
            }
        } else if (cookie.important) { // If the row hasn't been completed but is important
            document.getElementById(rowId).classList.add('important');
            sortNum.value = 1;
            document.getElementById(rowId).setAttributeNode(sortNum);
        } else if (cookie.ignore) { // If the row has been ignored
            document.getElementById(rowId).classList.add('ignore');
            sortNum.value = 4;
            document.getElementById(rowId).setAttributeNode(sortNum);
        } else { // If the row has a cookie but doesn't have any other data
            sortNum.value = 2;
            document.getElementById(rowId).setAttributeNode(sortNum);
        }
    } else { // If a cookie doesn't exist
        sortNum.value = 2;
        document.getElementById(rowId).setAttributeNode(sortNum);
    }
}

// When the user clicks the tick icon for a row, update or set the cookie
function complete(rowId, repId) {
    // Get the date, row element and cookie
    let currentUTC = Date.now();
    let row = document.getElementById(rowId);
    let cookie = Cookies.getJSON(repId);
    // If there is no cookie, create a temp one
    if (cookie == undefined) {
        cookie = { "complete": false, "important": false, "ignore": false, "date": 0 }
    }
    if (row.classList.contains('complete')) { // If the row is complete, uncomplete it
        row.classList.remove('complete');
        Cookies.set(repId, { "complete": false, "important": cookie.important, "ignore": cookie.ignore, "date": currentUTC });
    } else { // If the row is uncomplete, set it as complete
        row.classList.add('complete');
        Cookies.set(repId, { "complete": true, "important": cookie.important, "ignore": cookie.ignore, "date": currentUTC });
    }
}

// When the user clicks the exclamation icon for a row, update or set the cookie
function important(rowId, repId) {
    // Get the date, row element and cookie
    let row = document.getElementById(rowId);
    let cookie = Cookies.getJSON(repId);
    // If there is no cookie, create a temp one
    if (cookie == undefined) {
        cookie = { "complete": false, "important": false, "ignore": false, "date": 0 }
    }
    if (row.classList.contains('important')) { // If the row is already important, revert it
        row.classList.remove('important');
        Cookies.set(repId, { "complete": cookie.complete, "important": false, "ignore": cookie.ignore, "date": cookie.date });
    } else { // If the row isn't important, make it important
        row.classList.add('important');
        Cookies.set(repId, { "complete": cookie.complete, "important": true, "ignore": false, "date": cookie.date });
    }
    if (row.classList.contains('ignore')) { // Remove the ignore class as these are mutually exclusive
        row.classList.remove('ignore');
    }
}

// When the user clicks the cross icon for a row, update or set the cookie
function ignore(rowId, repId) {
    // Get the date, row element and cookie
    let row = document.getElementById(rowId);
    let cookie = Cookies.getJSON(repId);
    // If there is no cookie, create a temp one
    if (cookie == undefined) {
        cookie = { "complete": false, "important": false, "ignore": false, "date": 0 }
    }
    if (row.classList.contains('ignore')) { // If the row is already ignored, revert it
        row.classList.remove('ignore');
        Cookies.set(repId, { "complete": cookie.complete, "important": cookie.important, "ignore": false, "date": cookie.date });
    } else { // If the row isn't ignored, make it ignored
        row.classList.add('ignore');
        Cookies.set(repId, { "complete": cookie.complete, "important": false, "ignore": true, "date": cookie.date });
    }
    if (row.classList.contains('important')) { // Remove the important class as these are mutually exclusive
        row.classList.remove('important');
    }
}