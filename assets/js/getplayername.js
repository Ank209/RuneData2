CheckPlayer();

function CheckPlayer() {
    if (getQueryVariable("playerName")) {
        playerName = decodeURI(getQueryVariable("playerName"));
        document.getElementById("rsn").value = playerName;
        document.getElementById("searchHelp").style.display = "none";
    }
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}