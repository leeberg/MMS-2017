Write-Output "HTTP Trigger Initiated!"

#here REQ is the data from the HTTP POST made by external source...
$requestBody = Get-Content $req -Raw | ConvertFrom-Json
   
#Pull "SavedSearchName" payload from request
$name = $requestBody.SavedSearchName

Write-Output "Saved Search Name is: $name"

if ($name) 
{
    #Note, use function app SSL Cert Thumbprint ID, Function App ENV Var, or keyvault instead of plaintexting your credos:
    $azureAccountName ="accounthere.onmicroosft.com"
    $azurePassword = ConvertTo-SecureString "passwordhere" -AsPlainText -Force
    $psCred = New-Object System.Management.Automation.PSCredential($azureAccountName, $azurePassword)
    
    #Use Azure Function App Setting Variables here
    $ResourceGroupName = $env:OMS_ResourceGroupName
    $WorkspaceName = $env:OMS_WorkspaceName
    $OMSQueryFailed = "NO"

    Write-Output "Logging Into Azure"
    $Login = Login-AzureRmAccount -Credential $psCred 
    
    #NOTE YOU WILL NEED TO CREATE YOUR OWN SAVED SEARCHES PREFIXES WITH "ALEXA|... you don't have to do this but I figured it was a good way to keep it clean.
    $SavedSearchName = 'ALEXA|' + $name
   

    Write-Output "Querying OMS"
    
    Try
    {
        $OMSResults = Get-AzureRmOperationalInsightsSavedSearchResults -ResourceGroupName $ResourceGroupName -WorkspaceName $WorkspaceName -SavedSearchId $SavedSearchName
    }
    
    Catch
    {
       $OMSQueryFailed = "YES"
       $Exception = $_.Exception
       $ErrorCode = $Exception.Error.Code
       If($ErrorCode -eq 'SavedSearchNotFound')
       {
            $SavedSearchName = $SavedSearchName.Replace("ALEXA|","")
            $ResultString = "Saved Search: $SavedSearchName - NOT FOUND!"
       }
       else
       {
        $ResultString = "An Error Occured Trying to Run Saved Search, with Error Code: $ErrorCode"
       }
    }

    
    Write-Output "Query Done"

    IF($OMSQueryFailed -eq "NO")
    {
        $SavedSearchName = $SavedSearchName.Replace("ALEXA|","")
        $ResultCount = $OMSResults.value.Count
        $ResultString = "Saved Search: $SavedSearchName, Search Result Count: $ResultCount .. Results: "
        $ResultNumber = 0

        If($ResultCount -eq 0)
        {
            $ResultString = "No Results Found!"
        }
        else
        {
            foreach($Result in $OMSResults.value)
            {

                #ASSUME FIELDS COMPUTER AND COUNT
                $ResultNumber = $ResultNumber +1
                $ResultObj = ConvertFrom-Json $Result
                $Computer = $ResultObj.Computer
                $Count = [math]::Round($ResultObj.Count)

                $ResultString = $ResultString  + "ComputerName: $Computer Count: $Count"
                $ResultString = $ResultString + " ... "
            
            }
        }
    }
    Write-Output $ResultString #Just for Debugging in the Azure Function Console

    #Out-file to $res will be the output of the Azure FUnction - in this case... back to our AWS Alexa function :)
    Out-File -Encoding Ascii -FilePath $res -inputObject $ResultString
}
else
{
    Write-Output "No Saved Search Name was Sent to OMS!"
    Out-File -Encoding Ascii -FilePath $res -inputObject "No Saved Search Name was Sent to OMS!"
}
