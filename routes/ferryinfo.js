"use strict";

var express = require("express");
var router = express.Router();
var request = require("request");
var config = require("./config.json");

var baseUrl = "https://www.wsdot.wa.gov/Ferries/API/Vessels/rest/vessellocations?";

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

router.get("/", function (req, res) {
    request(requestOptions, function (requestError, requestResponse, requestBody) {
        if (requestResponse) {
            res.status(requestResponse.statusCode);
            res.setHeader("Access-Control-Allow-Origin",
            "*");
            if (requestResponse && requestResponse.statusCode == 200) {
                res.send(requestBody);
            } else {
                res.send(requestBody);
            }
        }
    });
});

module.exports = router;