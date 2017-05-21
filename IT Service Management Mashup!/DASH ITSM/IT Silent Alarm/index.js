/**
 * This is a sample Lambda function that sends an email on click of a
 * button. It requires these SES permissions.
 * THIS IS FOR LEE1 IOT BUTTON!
 * 
 * 
*/

'use strict';

const AWS = require('aws-sdk');
var http = require("https");
const SES = new AWS.SES();
const EMAIL_ADDRESS = '@.com'; // change it to your email address

// DEFINE POST FOR SN OPTIONS
var SNIncident ='';

var options = {
  "method": "POST",
  "hostname": ".service-now.com",
  "port": null,
  "path": "/api/now/table/incident?sysparm_view=number",
  "headers": {
    "authorization": "Basic =",
    "content-type": "application/json",
    "cache-control": "no-cache",
    "postman-token": "8cec7797-fd42-f07d-b080-d11edd63bcb3"
  }
};


var slackoptions = {
  "method": "POST",
  "hostname": "hooks.slack.com",
  "path": "/services///",
  "headers": {
  "content-type": "application/json",

  }
};




function callServiceNow(serialNumber,payload,callback)
{ 
    console.log("Starting call ServiceNow!");

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            
            console.log("Doing onEND Of CallServiceNow Function");

            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var parsed = (JSON.parse(body));
            // For Some Reason ServiceNow Stores all Info in a Result - so re-string to JSON
            var result= parsed.result;
            // console.log(result);
            var parsed2 = JSON.stringify(result);
            
            var incidentContent = JSON.parse(parsed2);
            console.log(incidentContent);
            console.log("Number is:");
            console.log(incidentContent.number);
            
            var number = incidentContent.number;

            //POST TO SLACK!
            console.log(`Creating Notice to Slack with INC NUMBER: ${number} in Slack!`);
            callSlack2(serialNumber, payload, number, callback);
            console.log(`Created Notice to Slack with INC NUMBER: ${number} in Slack!`);

            callback('Submitted to ServiceNow and Slack OK!');

         });


    });



    req.write(JSON.stringify({ short_description: 'IT Silent Alarm has been pressed in Conf Room 5B',
            description: `IT Silent Alarm has been pressed in Conf Room 5B - IoT Button ${serialNumber}. Here is the full event: ${payload}.`,
            caller: "Sam.Clark",
            category: 'Inquiry / Help',
            subcategory: 'On-Site',
            contact_type: 'Phone',
            urgency: '1',
            impact: '1',
            assignment_group: 'd625dccec0a8016700a222a0f7900d06' }));
    
    req.end();

}


function callSlack(serialNumber,payload,callback)
{ 

    //Setup the Slack Request Function with Callback
    var req_slack = http.request(slackoptions, function (res2) {
    var chunks2 = [];
 
    res2.on("data", function (chunk2) {
        chunks2.push(chunk2);
    });

    res2.on("end", function () {
        var body = Buffer.concat(chunks2);
        console.log(body.toString());
        callback('API request sent successfully.');
    });


    });

    req_slack.write(JSON.stringify(
       {
            text: `IT Silent Alarm has been pressed in Conf Room 5B \n IoT Button ${serialNumber}. Here is the full event: ${payload}.`
	}));

    req_slack.end();
}



function callSlack2(serialNumber,payload,snnumber,callback)
{ 

    //Setup the Slack Request Function with Callback
    var req_slack = http.request(slackoptions, function (res2) {
    var chunks2 = [];
 
    res2.on("data", function (chunk2) {
        chunks2.push(chunk2);
    });

    res2.on("end", function () {
        var body = Buffer.concat(chunks2);
        console.log(body.toString());
        callback('API request sent successfully.');
    });


    });

    req_slack.write(JSON.stringify(
       {
            text: `IT Silent Alarm has been pressed in Conf Room 5B \n Incident ${snnumber} has been created and assigned to the Service Desk! \n IoT Button ${serialNumber}. Here is the full event: ${payload}.`
	}));

    req_slack.end();
}


// Send a verification email to the given email address.
function sendVerification(email, callback) {
    SES.verifyEmailIdentity({ EmailAddress: email }, (err) => {
        callback(err || 'Verification email sent. Please verify it.');
    });
}

// Check whether email is verified. Only verified emails are allowed to send emails to or from.
function checkEmail(email, callback) {
    SES.getIdentityVerificationAttributes({ Identities: [email] }, (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        const attributes = data.VerificationAttributes;
        if (!(email in attributes) || attributes[email].VerificationStatus !== 'Success') {
            sendVerification(email, callback);
        } else {
            callback(err, data);
        }
    });
}



exports.handler = (event, context, callback) => {

    console.log('Received event:', event);

    const payload = JSON.stringify(event);
     
              
    checkEmail(EMAIL_ADDRESS, (err) => {
        if (err) {
            console.log(`Failed to check email: ${EMAIL_ADDRESS}`, err);
            callback(err);
            return;
        }
       
        const subject = `Hello from your IoT Button ${event.serialNumber}`;
        const bodyText = `Hello from your IoT Button ${event.serialNumber}. Here is the full event: ${payload}.`;
        const params = {
            Source: EMAIL_ADDRESS,
            Destination: { ToAddresses: [EMAIL_ADDRESS] },
            Message: { Subject: { Data: subject }, Body: { Text: { Data: bodyText } } },
        };
        
        console.log("Sending Email!");
        SES.sendEmail(params, callback);

      });


    //Generate ServiceNow Work Item and Post to Slack!
    console.log("Generating ServiceNow Incident!");
    callServiceNow(event.serialNumber, payload, function (status) { context.done(null, status); });  


};

















