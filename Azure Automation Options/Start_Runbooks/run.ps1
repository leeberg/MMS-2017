Write-Output " "
Write-Output "----------------------------------------------------------"
Write-Output "PowerShell Timer trigger function executed at:$(get-date)";
Write-Output "----------------------------------------------------------"


Write-Output "Getting Environmental Variables!"

$ResourceGroupName = $env:AzureAutomationResourceGroupName
$AutomationAccountName = $env:AzureAutomationAccountName
$SubscriptionName = $env:AzureSubscriptionName
$AzureSubscriptionID = $env:AzureSubscriptionID
$AzureAutomationUser = $env:AzureSubscriptionID
$AzureAutomationPassword = $env:AzureSubscriptionID

Write-Output "Logging into Azure Subscription to Start Runbook!"

$AzureAutomationUser ="AccountNameGoesHere"
$AzureAutomationPassword = ConvertTo-SecureString "SecretPasswordGoesHere!" -AsPlainText -Force
$psCred = New-Object System.Management.Automation.PSCredential($AzureAutomationUser, $AzureAutomationPassword)
$Login = Login-AzureRmAccount -Credential $psCred 

Write-Output "Logged In to Azure Subscription!"

Write-Output "Starting Azure Automation Runbook"

$RunbookOutput = Start-AzureRmAutomationRunbook -Name "Hello_World" -ResourceGroupName $ResourceGroupName -AutomationAccountName $AutomationAccountName

Write-Output ("Runbook Output: $RunbookOutput")

Write-Output "----------------------------------------------------------"
Write-Output "PowerShell Timer trigger function completed at:$(get-date)";