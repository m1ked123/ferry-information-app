var express = require("express");
var request = require("request");
var config = require("../config/config.json")

var app = express()

// TODO: Place the API Key into an untracked config file
var baseUrl = "https://www.wsdot.wa.gov/Ferries/API/Vessels/rest/vessellocations?";

// TODO: Get the API key from the server config file
// var apiKey = JSON.parse()
var apiKey = config.apiKey;
var apiAccessCode = "apiaccesscode=" + apiKey;
var requestUrl = baseUrl + apiAccessCode;
var requestOptions = {
    uri: requestUrl,
    method: "GET",
    headers: {
        "Accept" : "application/json",
    }
}

var server = app.listen(8081, function () {
    var port = server.address().port;
    console.log("Ferry Information App server listening at " +
                "http://localhost:%s", port);
});

// TODO: Make it so this provides more information if it can't get data
app.get('/getferrydata', function (serverRequest, serverResponse) {
    request(requestOptions, function (requestError, requestResponse, requestBody) {
        if (requestResponse) {
            serverResponse.status(requestResponse.statusCode);
            serverResponse.setHeader("Access-Control-Allow-Origin",
            "*");
            if (requestResponse && requestResponse.statusCode == 200) {
                serverResponse.send(requestBody);
            } else {
                serverResponse.send(requestBody);
            }
        }
    });
});

function readConfig() {
    var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.onload = getData;
		ajaxRequest.onerror = ajaxFailure;
		ajaxRequest.open("GET", "http://localhost:8081/getferrydata", true);
		ajaxRequest.send();
}