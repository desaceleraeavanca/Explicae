$ErrorActionPreference = "Stop"

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$body = @{ email = "teste@explica.ai"; password = "senha123" } | ConvertTo-Json

try {
  $login = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body -WebSession $session
  Write-Host "LOGIN STATUS: $($login.StatusCode)"
} catch {
  Write-Host "LOGIN ERROR: $($_.Exception.Message)"
  if ($_.Exception.Response -ne $null) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $resp = $reader.ReadToEnd()
    Write-Host "LOGIN RESPONSE: $resp"
  }
}

Write-Host "COOKIES:"
$session.Cookies | ForEach-Object { Write-Host "$($_.Name)=$($_.Value)" }

try {
  $resp1 = Invoke-WebRequest -Uri "http://localhost:3000/api/test-usage" -WebSession $session
  Write-Host "TEST-USAGE 1: $($resp1.StatusCode) $($resp1.Content)"
  $resp2 = Invoke-WebRequest -Uri "http://localhost:3000/api/test-usage" -WebSession $session
  Write-Host "TEST-USAGE 2: $($resp2.StatusCode) $($resp2.Content)"
} catch {
  Write-Host "USAGE ERROR: $($_.Exception.Message)"
  if ($_.Exception.Response -ne $null) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $resp = $reader.ReadToEnd()
    Write-Host "USAGE RESPONSE: $resp"
  }
}