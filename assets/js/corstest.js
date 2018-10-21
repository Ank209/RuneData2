/*$.ajax({
    url: "http://services.runescape.com/m=hiscore/index_lite.ws?player=Iron Ankh",
    dataType: "text", success: function (data) { HandleSuccess(data) }, error: function (data) { HandleError(data) }
});*/

$.ajax({
    type: 'GET',
    url: 'https://allorigins.me/get?method=raw&url=https://apps.runescape.com/runemetrics/quests?user=Iron Ankh',
  
    // The 'contentType' property sets the 'Content-Type' header.
    // The JQuery default for this property is
    // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
    // a preflight. If you set this value to anything other than
    // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
    // you will trigger a preflight request.
    dataType: 'json',
  
    xhrFields: {
      // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
      // This can be used to set the 'withCredentials' property.
      // Set the value to 'true' if you'd like to pass cookies to the server.
      // If this is enabled, your server must respond with the header
      // 'Access-Control-Allow-Credentials: true'.
      withCredentials: false
    },
  
    headers: {
      // Set any custom headers here.
      // If you set any non-simple headers, your server must include these
      // headers in the 'Access-Control-Allow-Headers' response header.
    },

    converters: {"* text": window.String, "text html": true, "text jsonp": WhoKnows, "text xml": jQuery.parseXML},
  
    success: function(data) {
      // Here's where you handle a successful response.
      HandleSuccess(data)
    },
  
    error: function(data, test) {
      // Here's where you handle an error response.
      // Note that if the error was due to a CORS issue,
      // this function will still fire, but there won't be any additional
      // information about the error.
      HandleError(test)
    }
  });

function HandleError(data) {
    document.getElementById('result').innerText = "Failed";
    console.log(data);
}

function HandleSuccess(data) {
    document.getElementById('result').innerText = "Success";
    console.log(data);
}

function WhoKnows(data) {
    console.log(data);
    return data;
}