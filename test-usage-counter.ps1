Write-Host "Teste de contador de uso para usuários logados" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$cookieJar = "cookies.txt"

# Limpar cookies anteriores
if (Test-Path $cookieJar) {
    Remove-Item $cookieJar -Force
}

# Primeira chamada ao endpoint de teste
Write-Host "`nFazendo primeira chamada ao endpoint de teste..." -ForegroundColor Yellow
$response1 = curl.exe -s "$baseUrl/api/test-usage" -H "Content-Type: application/json" --cookie-jar $cookieJar
$response1Text = $response1 | Out-String

Write-Host "Resposta bruta: $response1Text" -ForegroundColor Gray

try {
    $data1 = $response1Text | ConvertFrom-Json
} catch {
    Write-Host "Erro ao converter resposta para JSON: $_" -ForegroundColor Red
    exit 1
}

if ($data1.error -eq "login_required") {
    Write-Host "Não autenticado. Faça login no app, depois execute novamente este script." -ForegroundColor Yellow
    exit 0
}

Write-Host "Uso após primeira chamada: usado=$($data1.usage.used), limite=$($data1.usage.limit), restante=$($data1.usage.remaining)" -ForegroundColor Magenta

# Segunda chamada ao endpoint de teste (usando os cookies da primeira chamada)
Write-Host "`nFazendo segunda chamada ao endpoint de teste..." -ForegroundColor Yellow
$response2 = curl.exe -s "$baseUrl/api/test-usage" -H "Content-Type: application/json" --cookie $cookieJar --cookie-jar $cookieJar
$response2Text = $response2 | Out-String

Write-Host "Resposta bruta: $response2Text" -ForegroundColor Gray

try {
    $data2 = $response2Text | ConvertFrom-Json
} catch {
    Write-Host "Erro ao converter resposta para JSON: $_" -ForegroundColor Red
    exit 1
}

if ($data2.error -eq "login_required") {
    Write-Host "Não autenticado. Faça login no app, depois execute novamente este script." -ForegroundColor Yellow
    exit 0
}

Write-Host "Uso após segunda chamada: usado=$($data2.usage.used), limite=$($data2.usage.limit), restante=$($data2.usage.remaining)" -ForegroundColor Magenta

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

# Mostrar informações do usuário
if ($data2.user) {
    Write-Host "`nUsuário logado: $($data2.user.email)" -ForegroundColor Cyan
} else {
    Write-Host "`nNão autenticado. Faça login e execute novamente o teste." -ForegroundColor Cyan
}

# Aguardar um pouco
Write-Host "`nAguardando 2 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Segunda chamada ao endpoint de teste
Write-Host "`nFazendo segunda chamada ao endpoint de teste..." -ForegroundColor Yellow
$response2 = curl.exe -s "$baseUrl/api/test-usage" -H "Content-Type: application/json" -b $cookieJar -c $cookieJar
$data2 = $response2 | ConvertFrom-Json

Write-Host "Uso após segunda chamada: usado=$($data2.usage.used), limite=$($data2.usage.limit), restante=$($data2.usage.remaining)" -ForegroundColor Magenta

# Verificar se o contador incrementou
if ($data2.usage.used -gt $data1.usage.used) {
    Write-Host "`n✅ SUCESSO: Contador de uso incrementou corretamente!" -ForegroundColor Green
    Write-Host "   Incremento: $($data1.usage.used) → $($data2.usage.used)" -ForegroundColor Green
} else {
    Write-Host "`n❌ FALHA: Contador de uso não incrementou corretamente!" -ForegroundColor Red
    Write-Host "   Valores: $($data1.usage.used) → $($data2.usage.used)" -ForegroundColor Red
}

Write-Host "`nTeste concluído." -ForegroundColor Cyan