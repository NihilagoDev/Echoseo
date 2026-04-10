<?php

$webhookUrl = 'http://127.0.0.1:8443/modules/git/public/web-hook.php?uuid=4162bb31-29e5-35e4-47e1-65ac464c9b76';

$payload = file_get_contents('php://input');
if ($payload === false || $payload === '') {
    $payload = '{}';
}

$ch = curl_init($webhookUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload),
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

header('Content-Type: application/json');

echo json_encode([
    'success' => $error === '' && $httpCode >= 200 && $httpCode < 300,
    'http_code' => $httpCode,
    'curl_error' => $error,
    'response' => $response,
], JSON_PRETTY_PRINT);
