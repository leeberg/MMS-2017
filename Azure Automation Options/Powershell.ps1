# Calling AA runbook via webhook

# https://s1events.azure-automation.net/webhooks?token=%%3d

$uri = "https://s1events.azure-automation.net/webhooks?token=%3d"
$headers = @{"From"="pz.onmicrosoft.com";"Date"="05/28/2015 15:47:00"}

  $msg  =  @{ message="Message via PowerShell"}

# $msg  = @(
#            @{ message="Message via PowerShell"}
#        )



$body = ConvertTo-Json -InputObject $msg

$uri = 'https://.azurewebsites.net/api/Vote?code=6bAoQA==&rating=3'



for ($i=1; $i -le 10; $i++) 
{
    
  $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
  Write-Output "Invoke!"
}

$jobid = $response.JobIds




Write-Output "----------------------------------"
Write-Output "----------------------------------"
Write-Output "  "
Write-Output "Hello MMS!"
Write-Output "  "
Write-Output "Job Complete! Here is your Job ID:"
Write-OUtput $jobid
Write-Output "  "
Write-Output "----------------------------------"
Write-Output "----------------------------------"
Write-Output "  "
