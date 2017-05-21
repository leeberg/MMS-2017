using System;
using System.Threading.Tasks;
using System.Net.Http;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;

 private static TelemetryClient telemetry = new TelemetryClient();
 private static string key = TelemetryConfiguration.Active.InstrumentationKey = System.Environment.GetEnvironmentVariable("APPINSIGHTS_INSTRUMENTATIONKEY", EnvironmentVariableTarget.Process);
   

public static async Task<string> Run(string myQueueItem, TraceWriter log)
{
    
    try
    {
        log.Info("C# ServiceBus queue trigger function started");
     
        telemetry.TrackEvent("Function Started");
        
        using (var client = new HttpClient())
        {
            var WebHookUri = "webhookurl_goes_here";
    
            telemetry.TrackEvent("Calling Webhook: " + WebHookUri);
    
            StringContent queryString = new StringContent(myQueueItem);
            
            //  throw new Exception();
    
            var result = await client.PostAsync(WebHookUri,queryString);
            string resultContent = await result.Content.ReadAsStringAsync();
            
            log.Info(resultContent);
            telemetry.TrackEvent("Function Completed");
            
        }
    }
    catch (Exception ex)  
    {
          telemetry.TrackEvent("Function FAILED!");
          telemetry.TrackException(ex);
    } 
 
     return myQueueItem;
   
        
}