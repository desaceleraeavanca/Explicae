# Script para testar geração logada com curl
# Este script faz duas chamadas para a API de geração de analogias
# e verifica se o contador de uso incrementa corretamente

# Configurações
$baseUrl = "http://localhost:3000"
$cookieJar = "cookies.txt"
$concept1 = "computação quântica"
$audience1 = "estudantes do ensino médio"
$concept2 = "blockchain"
$audience2 = "executivos de negócios"

Write-Host "Iniciando teste de geração logada..." -ForegroundColor Cyan

# Limpar cookies para garantir um teste limpo
if (Test-Path $cookieJar) {
    Remove-Item $cookieJar
}

# Verificar se o usuário está logado
Write-Host "`nVerificando status de login..." -ForegroundColor Yellow
$userCheck = curl.exe -s "$baseUrl/api/auth/me" -H "Content-Type: application/json" --cookie-jar $cookieJar
$userCheckContent = $userCheck | Out-String

try {
    $userData = $userCheckContent | ConvertFrom-Json
    if ($userData.user) {
        Write-Host "✅ Usuário logado: $($userData.user.email)" -ForegroundColor Green
    } else {
        Write-Host "❌ Usuário não está logado. Por favor, faça login no navegador primeiro." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao verificar login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Resposta recebida: $userCheckContent" -ForegroundColor Red
    exit 1
}

# Primeira chamada de API usando curl diretamente
Write-Host "`n1️⃣ Fazendo primeira chamada de API para gerar analogias..." -ForegroundColor Yellow
Write-Host "Conceito: '$concept1', Audiência: '$audience1'"

$body1 = "{`"concept`":`"$concept1`",`"audience`":`"$audience1`"}"
$response1 = curl.exe -s -X POST "$baseUrl/api/generate-analogies" -H "Content-Type: application/json" --cookie-jar $cookieJar -d $body1

$data1 = $response1 | ConvertFrom-Json
Write-Host "Resposta da primeira chamada:" -ForegroundColor Green
Write-Host "Uso: $($data1.usage | ConvertTo-Json -Compress)"
Write-Host "Quantidade de analogias: $($data1.analogies.Length)"

$firstUsed = $data1.usage.used

# Aguardar um momento para garantir que o banco de dados processou a primeira chamada
Start-Sleep -Seconds 2

# Segunda chamada de API usando curl diretamente
Write-Host "`n2️⃣ Fazendo segunda chamada de API para gerar analogias..." -ForegroundColor Yellow
Write-Host "Conceito: '$concept2', Audiência: '$audience2'"

$body2 = "{`"concept`":`"$concept2`",`"audience`":`"$audience2`"}"
$response2 = curl.exe -s -X POST "$baseUrl/api/generate-analogies" -H "Content-Type: application/json" --cookie $cookieJar -d $body2

$data2 = $response2 | ConvertFrom-Json
Write-Host "Resposta da segunda chamada:" -ForegroundColor Green
Write-Host "Uso: $($data2.usage | ConvertTo-Json -Compress)"
Write-Host "Quantidade de analogias: $($data2.analogies.Length)"

# Verificar se o contador incrementou
Write-Host "`nVerificando incremento de uso..." -ForegroundColor Cyan
$secondUsed = $data2.usage.used

if ($secondUsed -gt $firstUsed) {
    Write-Host "✅ Contador de uso incrementou corretamente!" -ForegroundColor Green
    Write-Host "Primeira chamada usado: $firstUsed, Segunda chamada usado: $secondUsed"
} else {
    Write-Host "❌ FALHA: Contador de uso não incrementou corretamente!" -ForegroundColor Red
    Write-Host "Primeira chamada usado: $firstUsed, Segunda chamada usado: $secondUsed"
}


Write-Host "Resposta da segunda chamada:" -ForegroundColor Green
Write-Host "Uso: $($data2.usage | ConvertTo-Json -Compress)"
Write-Host "Quantidade de analogias: $($data2.analogies.Length)"

$secondUsed = $data2.usage.used

# Verificar incremento de uso
Write-Host "`nVerificando incremento de uso..." -ForegroundColor Cyan
if ($secondUsed -gt $firstUsed) {
    Write-Host "✅ SUCESSO: Contador de uso incrementou corretamente!" -ForegroundColor Green
    Write-Host "Primeira chamada usado: $firstUsed, Segunda chamada usado: $secondUsed" -ForegroundColor Green
} else {
    Write-Host "❌ FALHA: Contador de uso não incrementou corretamente!" -ForegroundColor Red
    Write-Host "Primeira chamada usado: $firstUsed, Segunda chamada usado: $secondUsed" -ForegroundColor Red
}