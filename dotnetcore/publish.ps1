Set-Location C:\\ProMatrix.2\\nx.angular.studio.lite\\promatrix\\dotnetcore

$appsvWebAppName = "ngx-studio"
$resourceGroupName = "RC-1"
$zipfile = "C:\\ProMatrix.2\\nx.angular.studio.lite\\promatrix\dotnetcore\\publish.zip"

$resource = Invoke-AzResourceAction -ResourceGroupName $resourceGroupName -ResourceType Microsoft.Web/sites/config -ResourceName "$appsvWebAppName/publishingcredentials" -Action list -ApiVersion 2018-02-01 -Force

$username = $resource.Properties.publishingUserName
$password = $resource.Properties.publishingPassword
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $username, $password)))
$userAgent = "powershell/1.0"

# Create the folder (ui), in the wwwroot folder. Keep this for reference purposes
# $apiUrl = "https://$appsvWebAppName.scm.azurewebsites.net/api/vfs/site/wwwroot/ui/"
# Invoke-RestMethod -Uri $apiUrl -Headers @{Authorization=("Basic {0}" -f $base64AuthInfo)} -UserAgent $userAgent -Method PUT

#Create a zip file that excludes the root directory, but zips all its files and subdirectories, use the asterisk ( * ) wildcard.
$compress = @{
    Path = "C:\\ProMatrix.2\\nx.angular.studio.lite\\promatrix\\dotnetcore\\bin\\Debug\\net5.0\\publish\\*"
    CompressionLevel = "Fastest"
    DestinationPath = $zipfile
  }
  Compress-Archive @compress -Force

#Stop Website
Stop-AzWebApp -ResourceGroupName $resourceGroupName -Name $appsvWebAppName

#Upload the zip file
$wwwrootUrl = "https://$appsvWebAppName.scm.azurewebsites.net/api/zip/site/wwwroot"
Invoke-RestMethod -Uri $wwwrootUrl -Headers @{Authorization=("Basic {0}" -f $base64AuthInfo)} -UserAgent $userAgent -Method PUT -InFile $zipfile -ContentType "multipart/form-data"

#Start Website
Start-AzWebApp -ResourceGroupName $resourceGroupName -Name $appsvWebAppName

#Delay 10 seconds
Start-Sleep -Seconds 10