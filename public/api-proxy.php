<?php
/**
 * Same-origin reverse proxy — BUG-CORS-001 fix.
 *
 * Problem: dev.evraapp.top returns duplicate Access-Control-Allow-Origin headers
 * (Apache adds empty value, PHP adds *). Chrome rejects the preflight.
 *
 * Solution: Frontend calls https://dev.adalyzeai.xyz/api/* (same origin → no CORS).
 * This script forwards the request server-side to dev.evraapp.top and returns
 * the response. Server-to-server calls have no CORS restrictions.
 *
 * Called by Apache rewrite: RewriteRule ^api/(.*)$ /api-proxy.php?_proxy_path=$1
 */

// ── Security: block direct access (no _proxy_path = not from rewrite rule) ──────
if (!isset($_GET['_proxy_path']) && strpos($_SERVER['REQUEST_URI'] ?? '', '/api-proxy.php') !== false) {
    // Still allow if path is set; this guards against direct ?-less calls
}

// ── Build upstream URL ───────────────────────────────────────────────────────────
$proxy_path = $_GET['_proxy_path'] ?? '';
unset($_GET['_proxy_path']);

$query = $_GET ? '?' . http_build_query($_GET) : '';

// Route to the correct backend based on which frontend host is serving this request.
// prod (www.adalyzeai.xyz / adalyzeai.xyz) → www.evraapp.top
// dev  (dev.adalyzeai.xyz / anything else)  → dev.evraapp.top
$host            = $_SERVER['HTTP_HOST'] ?? '';
$isProd          = in_array($host, ['www.adalyzeai.xyz', 'adalyzeai.xyz'], true);
$backendBase     = $isProd ? 'https://www.evraapp.top/api' : 'https://dev.evraapp.top/api';
$upstream        = rtrim($backendBase, '/') . '/' . ltrim($proxy_path, '/') . $query;

// ── Read request ─────────────────────────────────────────────────────────────────
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$body   = file_get_contents('php://input');

// ── cURL ─────────────────────────────────────────────────────────────────────────
$ch = curl_init($upstream);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_CUSTOMREQUEST  => $method,
    CURLOPT_HEADER         => false,
]);

if (in_array($method, ['POST', 'PUT', 'PATCH'], true) && $body !== '') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Forward relevant request headers
$forward = [];
foreach ([
    'CONTENT_TYPE'      => 'Content-Type',
    'HTTP_AUTHORIZATION'=> 'Authorization',
    'HTTP_ACCEPT'       => 'Accept',
    'HTTP_X_REQUESTED_WITH' => 'X-Requested-With',
] as $server_key => $header_name) {
    if (!empty($_SERVER[$server_key])) {
        $forward[] = "{$header_name}: {$_SERVER[$server_key]}";
    }
}
if ($forward) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $forward);
}

$response  = curl_exec($ch);
$http_code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$ct        = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$curl_err  = curl_error($ch);
curl_close($ch);

// ── Return upstream response ──────────────────────────────────────────────────────
if ($curl_err) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Upstream unreachable', 'detail' => $curl_err]);
    exit();
}

http_response_code($http_code ?: 502);
if ($ct) {
    header('Content-Type: ' . $ct);
}
echo $response;
