var http = require("https");
var incidentCount = 0;
var incidentContent;
var text = '';
var sys_id = '';
var sys_idlist = '';
var number ='';



var options_get = {
  "method": "GET",
  "hostname": ".service-now.com",
  "port": null,
  "path": "/api/now/table/incident?sysparm_limit=5&assigned_to=lberg@.com&state=2",
  "headers": {
    "authorization": "Basic =",
    "cache-control": "no-cache",
    "postman-token": "effcf0ef-2dd4-8ba9-d1de-bafd709962c8"
  }
};


function ReAssignIncident(sys_id, callback) {

    var openIncidentPath = ('/api/now/table/incident/' + sys_id);

    var options_put = {
        "method": "PUT",
        "hostname": ".service-now.com",
        "port": null,
        "path": '',
        "headers": {
            "authorization": "Basic =",
            "content-type": "application/json",
            "cache-control": "no-cache",
        }
    };

    console.log("ReAssignIncident Starting! with: " + openIncidentPath); 

    options_put.path = openIncidentPath;

    var reQ_post = http.request(options_put, function (reS_post) {
        var chunks = [];

        reS_post.on("data", function (chunk) {
            chunks.push(chunk);
           // console.log("CHUNK PUSHING!");
        });
        
        reS_post.on("end", function () {
           var body = Buffer.concat(chunks);
           //console.log(body.toString());
           callback("Incident Post End!");
        });


    });

    reQ_post.write(JSON.stringify({
        assigned_to: 'lberg@.com'
    }));

    reQ_post.end();

}



function callServiceNow_GetIncidents(callback)
{
    var req = http.request(options_get, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        
        res.on("end", function (chunk) {
            console.log("GetIncidents http on end!"); 
            // Store Body JSON
            var body = Buffer.concat(chunks);
            // Parse to Object
            var parsed = (JSON.parse(body));
            // For Some Reason ServiceNow Stores all Info in a Result - so re-string to JSON
            var result= parsed.result;
            // console.log(result);
            var parsed2 = JSON.stringify(result);   
            incidentContent = JSON.parse(parsed2);
            //console.log(incidentContent)
            keys = Object.keys(incidentContent);
            callback(keys);

        });
    });

    req.end();
 

}



exports.handler = function (event, context) {

    callServiceNow_GetIncidents(function(returnValue) {
    // use the return value here instead of like a regular (non-evented) return value

        //function doit (callback){
        // use the return value here instead of like a regular (non-evented) return value
        console.log("Going into FOR LOOP!");

        incidentCount = keys.length;
        
        if(incidentCount>0)
        {  

          for( var i = 0, length = keys.length; i < length; i++ ) {
                                       
                    sys_id = incidentContent[i].sys_id;
                    number = incidentContent[i].number;
                    console.log("UnAssign:" +sys_id);
                    console.log("Count:" + ( i + 1)  + " of: " + keys.length);

                    
                    if(i === keys.length -1 )
                    {


                        console.log("ReAssigning FINAL Incident: "+ number);
                                                
                        ReAssignIncident(sys_id, function(returnValue){
                            console.log("Last function(return value) is done!");
                          
                            text = 'OK Lee, Have fun on vacation, your ' + incidentCount + ' incidents have been reassigned. Mic Drop.';

                            var response = {
                                outputSpeech: {
                                type: "PlainText",
                                text: text
                                }
                            };
                            
                            console.log("----------------------------------------------------");
                            console.log("Alexa Speech here:");
                            console.log(text);
                            console.log("----------------------------------------------------");
                            
                            context.succeed( { response: response } );    

                        });

                        
                        
                    }
                    else
                    {
                        console.log("Assigning Incident: "+ number);
                                                
                        ReAssignIncident(sys_id, function(returnValue){
                            console.log("Last function(return value) is done!");
                            console.log(returnValue);

                        });
                        
                    }


                }
                    
            }
            
            else
            {
                text = 'OK Lee, Have fun on vacation, you had no incidents assigned!';

                var response = {
                    outputSpeech: {
                        type: "PlainText",
                        text: text
                        }
                    }; 
                                 
                    context.succeed( { response: response } );
            }
            

});


    
    

};

    




