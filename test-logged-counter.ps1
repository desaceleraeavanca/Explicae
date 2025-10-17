Write-Host "Teste de contador de uso para usuários logados" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$cookieJar = "cookies.txt"

# Limpar cookies anteriores
if (Test-Path $cookieJar) {
    Remove-Item $cookieJar -Force
}

# Fazer login primeiro
Write-Host "`nFazendo login..." -ForegroundColor Yellow
$loginData = @{
    email = "teste@explica.ai"
    password = "senha123"
} | ConvertTo-Json

$loginResponse = curl.exe -s "$baseUrl/api/auth/login" -H "Content-Type: application/json" -d $loginData --cookie-jar $cookieJar
Write-Host "Login realizado, cookies salvos em $cookieJar" -ForegroundColor Green

# Primeira chamada para gerar analogias
Write-Host "`nFazendo primeira chamada para gerar analogias..." -ForegroundColor Yellow
$requestData = @{
    concept = "Teste de contador"
    audience = "Desenvolvedores"
} | ConvertTo-Json

$response1 = curl.exe -s "$baseUrl/api/generate-analogies" -H "Content-Type: application/json" -d $requestData --cookie $cookieJar --cookie-jar $cookieJar
$response1Text = $response1 | Out-String

try {
    $data1 = $response1Text | ConvertFrom-Json
    Write-Host "Uso após primeira chamada: usado=$($data1.usage.used), limite=$($data1.usage.limit), restante=$($data1.usage.remaining)" -ForegroundColor Magenta
} catch {
    Write-Host "Erro ao converter resposta para JSON: $_" -ForegroundColor Red
    Write-Host "Resposta bruta: $response1Text" -ForegroundColor Gray
    exit 1
}

# Segunda chamada para gerar analogias
Write-Host "`nFazendo segunda chamada para gerar analogias..." -ForegroundColor Yellow
$requestData = @{
    concept = "Outro teste de contador"
    audience = "Desenvolvedores"
} | ConvertTo-Json

$response2 = curl.exe -s "$baseUrl/api/generate-analogies" -H "Content-Type: application/json" -d $requestData --cookie $cookieJar --cookie-jar $cookieJar
$response2Text = $response2 | Out-String

try {
    $data2 = $response2Text | ConvertFrom-Json
    Write-Host "Uso após segunda chamada: usado=$($data2.usage.used), limite=$($data2.usage.limit), restante=$($data2.usage.remaining)" -ForegroundColor Magenta
} catch {
    Write-Host "Erro ao converter resposta para JSON: $_" -ForegroundColor Red
    Write-Host "Resposta bruta: $response2Text" -ForegroundColor Gray
    exit 1
}

# Verificar se o contador incrementou
if ($data2.usage.used -gt $data1.usage.used) {
    Write-Host "`nSUCESSO: Contador de uso incrementou corretamente!" -ForegroundColor Green
    Write-Host "Primeira chamada: $($data1.usage.used)" -ForegroundColor Green
    Write-Host "Segunda chamada: $($data2.usage.used)" -ForegroundColor Green
} else {
    Write-Host "`nFALHA: Contador de uso não incrementou corretamente!" -ForegroundColor Red
    Write-Host "Primeira chamada: $($data1.usage.used)" -ForegroundColor Red
    Write-Host "Segunda chamada: $($data2.usage.used)" -ForegroundColor Red
}