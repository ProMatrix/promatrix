# keep this file for reference. Shows how to pull parameters from a json file
Set-Location C:\\ProMatrix.2\\Angular.Studio.11.00\\studio.app\\dotnetcore

# Read parameters
$parameters = Get-Content -Raw ./parameters.json | ConvertFrom-Json
$resourceGroupName = $parameters.ResourceGroup.Name
$resourceGroupLocation = $parameters.ResourceGroup.Location
$webSiteName = $parameters.webSite.Name
$hostingPlanName = $parameters.website.HostingPlan.Name

# Check if Resource Group exists
$doesResourceGroupExist = Get-AzResourceGroup | Where-Object {$_.ResourceGroupName -eq $resourceGroupName}
if ($doesResourceGroupExist -eq $null) {
    $status = New-AzResourceGroup -Name $resourceGroupName -Location $resourceGroupLocation
    write-host "Resource Group" $resourceGroupName "creation status "$status.ProvisioningState". Provisioned location "$resourceGroupLocation
}
else {
    write-host "Resource Group" $resourceGroupName "exists in location "$resourceGroupLocation    
}

# Check if Hosting Plan exists
$doesAppServicePlanExist = Get-AzAppServicePlan -ResourceGroupName $resourceGroupName -ErrorAction silentlyContinue
if ($doesAppServicePlanExist -eq $null) {
    $status = New-AzAppServicePlan -Name $hostingPlanName -Location $resourceGroupLocation -Tier Basic -ResourceGroupName $resourceGroupName
    write-host "Hosting Plan" $hostingPlanName "creation status "$status.Status". Provisioned location "$resourceGroupLocation
}
else {
    write-host "Hosting Plan" $hostingPlanName "exists in Resource Group "$resourceGroupName    
}

# Check if Web App exists
$doesWebAppExist = Get-AzWebApp -Name $webSiteName -ErrorAction silentlyContinue
if ($doesWebAppExist -eq $null) {
    $status = New-AzWebApp -Name $webSiteName -ResourceGroupName $resourceGroupName -AppServicePlan $hostingPlanName -Location $resourceGroupLocation
    write-host "Web App" $webSiteName "creation status "$status.Status". Provisioned location "$resourceGroupLocation
}
else {
    write-host "Web App" $webSiteName "exists in Resource Group "$resourceGroupName    
}