exports.handler = function( event, context ) {
    

var http = require("https");

var options = {
  "method": "GET",
  "hostname": "URL.service-now.com",
  "port": null,
  "path": "/api/now/table/incident?sysparm_limit=5&assigned_to=beth.anglin&state=2",
  "headers": {
    "authorization": "Basic :) :) :) :) :) :) :)",
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

    var text = 'Here are your Incidents:  ';


    var keys = Object.keys(incidentContent);
    for( var i = 0,length = keys.length; i < length; i++ ) {
        
        var number = (incidentContent[i].number).replace(/^INC0+/, '');

        text += ("Incident Number: " + number + " ,");
        text += ("Short Description: " + incidentContent[i].short_description + " ,");
        text += ("Priority: Level " + incidentContent[i].priority + " ,");
        
        text += ("...")
        
     }
    
         output( text, context );
    
    });
});

req.end();






    
    /*
    http.get( url, function( response ) {
        
        var data = '';
        
        response.on( 'data', function( x ) { data += x; } );

        response.on( 'end', function() {

            var json = JSON.parse( data );

            var text = 'Here are your stock quotes: ';

            for ( var i=0 ; i < 10 ; i++ ) {
                var quote = json.query.results.quote[i];
                if ( quote.Name ) {
                    text += quote.Name + ' at ' + quote.Ask
                            + ' dollars, a change of '
                            + quote.Change + ' dollars. ';
                }
            }
        
            output( text, context );
        
        } );
        
    } );
    
    
    */
    
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

