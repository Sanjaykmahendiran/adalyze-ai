<?php
/**
 * Same-origin proxy for the legacy PHP backend (evraapp.top/App/api.php).
 * Fixes 404 when frontend calls /api.php?gofor=... as a relative URL.
 *
 * BUG-CORS-002: axiosInstance baseURL is set to NEXT_PUBLIC_REST_BASE_URL (the new
 * REST backend). Services that still call "/api.php" as a relative path get that path
 * appended to the new backend, which has no api.php — resulting in a 404. This proxy
 * sits at the same origin (dev.adalyzeai.xyz/api.php via .htaccess rewrite) and
 * forwards all query parameters server-side to evraapp.top/App/api.php.
 *
 * Called by Apache rewrite: RewriteRule ^api\.php$ /legacy-proxy.php [QSA,L]
 */

// ── Build upstream URL ───────────────────────────────────────────────────────────
$query    = $_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : '';
$upstream = 'https://evraapp.top/App/api.php' . $query;

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
    'CONTENT_TYPE'           => 'Content-Type',
    'HTTP_AUTHORIZATION'     => 'Authorization',
    'HTTP_ACCEPT'            => 'Accept',
    'HTTP_X_REQUESTED_WITH'  => 'X-Requested-With',
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
    echo json_encode(['error' => 'Upstream error', 'detail' => $curl_err]);
    exit();
}

http_response_code($http_code ?: 502);
if ($ct) {
    header('Content-Type: ' . $ct);
}
echo $response;
