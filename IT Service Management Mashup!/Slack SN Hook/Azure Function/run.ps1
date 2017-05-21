# POST method: $req
$requestBody = Get-Content $req -Raw 

# GET method: each querystring parameter is its own variable
if ($requestBody) 
{
    $BaseUrl = $env:CNCYSNURL
    $AuthKey = $env:CNCYSNKEY

    write-output "URL is: $BaseUrl"


    $body = $requestBody.Split('&')

    foreach($line in $body)
    {
        if($line -like 'text=AssignMe+*')
        {
            $number = $line.Substring($line.IndexOf('+') + 1,$line.Length - ($line.IndexOf('+') + 1))
        }
        if($line -like 'user_name=*')
        {
            $username = $line.Substring($line.IndexOf('=') + 1,$line.Length - ($line.IndexOf('=') + 1))  
        }
    }

    IF($username -eq 'leeberg')
    {
        #Dumb
        $username = 'lberg@concurrency.com'
    }

         
    # Set proper headers
    $GlobalHeaders = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $GlobalHeaders.Add('Accept','application/json')
    $GlobalHeaders.Add('Content-Type','application/json')
    $GlobalHeaders.Add('authorization',$AuthKey)

    # GET THE SYS_ID
    $URL = "$BaseUrl/api/now/table/incident?number=$number"

    Write-Output "Assigning $username to $number"
    $WebContent = Invoke-WebRequest -Headers $GlobalHeaders -Method "GET" -Uri $URL -UseBasicParsing
    $WebContent = $WebContent.Content | ConvertFrom-Json
    
    Foreach($Object in $WebContent)
    {
        IF($Object.result.sys_id)
        {       
            $sys_id = $Object.result.sys_id
            Write-Output $sys_id
            
            $Body = '{"assigned_to”: "'+$username+'"}'
            $URL = "$BaseUrl/api/now/table/incident/$sys_id"
            
            $PutRequest = Invoke-WebRequest -Headers $GlobalHeaders -Method "PUT" -Uri $URL -Body $Body -UseBasicParsing
        }
    }

#>

}

Out-File -Encoding Ascii -FilePath $res -inputObject "{""text"": ""Assigned: $Username to $Number!""}"