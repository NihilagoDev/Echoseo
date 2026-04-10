<?php

$pleskWebhookUrl = 'http://127.0.0.1:8443/modules/git/public/web-hook.php?uuid=4162bb31-29e5-35e4-47e1-65ac464c9b76';

$githubEvent = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? '';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? '';

$rawPayload = file_get_contents('php://input');
if ($rawPayload === false || $rawPayload === '') {
    $rawPayload = '{}';
}

$headers = [
    'Content-Type: application/json',
    'User-Agent: github-deploy-forwarder',
    'Content-Length: ' . strlen($rawPayload),
];

$ch = curl_init($pleskWebhookUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $rawPayload,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$responseHeaders = substr($response ?: '', 0, $headerSize);
$responseBody = substr($response ?: '', $headerSize);

header('Content-Type: application/json');

echo json_encode([
    'received' => true,
    'request_method' => $requestMethod,
    'github_event' => $githubEvent,
    'forwarded_to' => $pleskWebhookUrl,
    'plesk_http_code' => $httpCode,
    'plesk_curl_error' => $curlError,
    'plesk_response_headers' => $responseHeaders,
    'plesk_response_body' => $responseBody,
], JSON_PRETTY_PRINT);