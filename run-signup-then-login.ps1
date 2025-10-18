# Sign up, login, and test usage increment with persistent session cookies
param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Email = "teste@explica.ai",
  [string]$Password = "senha123",
  [string]$FullName = "Teste"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Iniciando fluxo de signup + login + test-usage ===" -ForegroundColor Cyan

# Prepare web session to hold cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1) Signup
try {
  $signupBody = @{ email = $Email; password = $Password; fullName = $FullName } | ConvertTo-Json
  $signupUri = "$BaseUrl/api/auth/signup"
  Write-Host "[1/4] Signup: $signupUri" -ForegroundColor Yellow
  $signupResp = Invoke-RestMethod -Method Post -Uri $signupUri -Body $signupBody -ContentType 'application/json'
  Write-Host "Signup status: OK" -ForegroundColor Green
  Write-Host (ConvertTo-Json $signupResp -Depth 6)
} catch {
  Write-Host "Signup falhou:" -ForegroundColor Red
  Write-Host $_.Exception.Message
}

# 2) Login and capture cookies
try {
  $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
  $loginUri = "$BaseUrl/api/auth/login"
  Write-Host "[2/4] Login: $loginUri" -ForegroundColor Yellow
  $loginResp = Invoke-WebRequest -Method Post -Uri $loginUri -Body $loginBody -ContentType 'application/json' -WebSession $session -UseBasicParsing
  Write-Host "Login status: $($loginResp.StatusCode)" -ForegroundColor Green
  Write-Host "Cookies recebidos:" -ForegroundColor Green
  $session.Cookies.GetCookies($BaseUrl) | ForEach-Object { Write-Host ("- {0}={1}; Domain={2}; Path={3}; Secure={4}" -f $_.Name, $_.Value, $_.Domain, $_.Path, $_.Secure) }
} catch {
  Write-Host "Login falhou:" -ForegroundColor Red
  Write-Host $_.Exception.Message
}

# 3) Test usage - first call
try {
  $usageUri = "$BaseUrl/api/test-usage"
  Write-Host "[3/4] Test usage #1: $usageUri" -ForegroundColor Yellow
  $usage1 = Invoke-RestMethod -Method Get -Uri $usageUri -WebSession $session
  Write-Host "Uso #1:" -ForegroundColor Green
  Write-Host (ConvertTo-Json $usage1 -Depth 6)
} catch {
  Write-Host "Test-usage #1 falhou:" -ForegroundColor Red
  Write-Host $_.Exception.Message
}

# 4) Test usage - second call
try {
  $usageUri = "$BaseUrl/api/test-usage"
  Write-Host "[4/4] Test usage #2: $usageUri" -ForegroundColor Yellow
  $usage2 = Invoke-RestMethod -Method Get -Uri $usageUri -WebSession $session
  Write-Host "Uso #2:" -ForegroundColor Green
  Write-Host (ConvertTo-Json $usage2 -Depth 6)
} catch {
  Write-Host "Test-usage #2 falhou:" -ForegroundColor Red
  Write-Host $_.Exception.Message
}