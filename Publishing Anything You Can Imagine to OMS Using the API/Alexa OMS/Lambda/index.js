var Alexa = require('alexa-sdk');
var http = require('https');

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL)

var newline = "\n";
var output = "";
var alexa;

exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};


var handlers = {

    'Unhandled': function () {
        this.emit(':tell', 'OMS Query Doesn\'t understand!');
    },

    'getSavedSearch': function () {
        var savedsearchslotvalue = this.event.request.intent.slots.savedsearch.value;

        console.log("Get Saved Search Handler Starting with Slot:");
        console.log(savedsearchslotvalue);

        var OMSquery = savedsearchslotvalue; //need to get this from the user
        console.log(OMSquery);

        console.log("Saved Search Handler is starting Query OMS Sub Function!");

        QueryOMS(OMSquery, function (response) {

            var responseData = response;

            if (responseData === null) {
                output = "There was a problem with getting data please try again!";
            } else {
                console.log(output);
                output = responseData;
            }

            alexa.emit(':tell', output);

        });


        console.log("Saved Search Handler Complete!");
    }



};


function QueryOMS(OMSquery, callback) {

    console.log("Starting Function QUERY OMS");

    // Build the post string from an object
    // Defaulted to a randome query here....
    if (OMSquery === null) {
        OMSquery = 'Logons in Last 24 Hours';
    }

    console.log("Building POST Data VAR");

    var JSONOBJ = {
        "SavedSearchName": OMSquery
    };
    var post_data = JSON.stringify(JSONOBJ);

    console.log("Post Data is:")
    console.log(post_data.toString());

    //ENTER YOUR AZURE FUNCTION VARIABLES HERE!!!!!
    //REALLY IT WOULD BE SMART TO QUERY OMS RIGHT FROM THE AWS FUNCTION WITH LOGIN CREDS AND ALL THAT
    //BUT THAT REQUIRES SOME REAL EFFORT SO LET'S USE AZURE FUNCTIONS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    var options = {
        "method": "POST",
        "hostname": "myazurefunctionanem.azurewebsites.net",
        "port": null,
        "path": "/api/MyAzureFunctionUrl12345Goeshere",
        "headers": {
            "content-type": "application/json",
            "Content-Length": post_data.length
        }
    };

    console.log("Setting Up req");

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            var text = body.toString();

            console.log("End Function Body Reply is: ");
            console.log(text);

            //Clean Up the Mess so that Alexa doesn't say a bunch of garbage...
            //This is the world Javascript in the world - I should be ashamed of myself
            //Hey... it's only a demo / test ;)
            text = text.replace(/(?:\\[rn]|[\r\n]+)+/g, "");
            text = text.replace(/(?:\\[rn])+/g, "");
            text = text.replace("\\\\r\\\\n", "");
            text = text.replace("M\\", "M");
            text = text.replace("\"\"", "");
            text = text.replace("\"\\\"", "");

            callback(text);
        });
    });

    req.write(post_data);
    req.end();

    console.log("Function QUERY OMS Completed");

}