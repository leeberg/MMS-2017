exports.handler = function( event, context ) {
    

var http = require("https");

var options = {
  "method": "GET",
  "hostname": "service-now.com",
  "port": null,
  "path": "/api/now/table/incident?sysparm_limit=5&assigned_to=lberg@.com&state=2",
  "headers": {
    "authorization": "Basic",
    "cache-control": "no-cache",
    "postman-token": "effcf0ef-2dd4-8ba9-d1de-bafd709962c8"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    // Store Body JSON
    var body = Buffer.concat(chunks);
    // Parse to Object
    var parsed = (JSON.parse(body));
    // For Some Reason ServiceNow Stores all Info in a Result - so re-string to JSON
    var result= parsed.result
    // console.log(result);
    var parsed2 = JSON.stringify(result);
    
    var incidentContent = JSON.parse(parsed2);
    //console.log(incidentContent)

    var keys = Object.keys(incidentContent);

    var incidentCount = keys.length;
    
    var text = ''

    if(incidentCount==1)
    {
        text = 'You are currently assigned one incident... ';
    }
    else if (incidentCount > 1)
    {
        text = 'You are currently assigned: '+ incidentCount + ' Incidents. Here are your Incidents: ';
    }
    else
    {
        text = 'You have no assigned incidents';
    }

    for( var i = 0,length = keys.length; i < length; i++ ) {
        //console.log(" ");
        //console.log("Number:", incidentContent[i].number);
        //console.log("Opened:", incidentContent[i].opened_at);
        //console.log("short_description:", incidentContent[i].short_description);
        //console.log(" ");
        
        var number = (incidentContent[i].number).replace(/^INC0+/, '');

        text += ("Incident Number: " + number + " , ");
        text += ("Short Description: " + incidentContent[i].short_description + " , ");
        text += ("Priority: Level " + incidentContent[i].priority + " , ");
        
        text += ("...")
        
     }
    
         output( text, context );
    
    });
});

req.end();

    
};
    
function output( text, context ) {

    var response = {
        outputSpeech: {
            type: "PlainText",
            text: text
        }
        //,
        //card: {
        //    type: "Simple",
         //   title: "Stocks",
          //  content: text
        //},
        //ShouldEndSession: true
    };
    
    context.succeed( { response: response } );
    
}

