<?php
/**
 * ONE-TIME seed script — inserts No-Go ad (ad_id=1) for user_id=1 into new backend DB.
 * Self-destructs on first successful run.
 */
header('Content-Type: application/json');

// ── Locate backend .env ──────────────────────────────────────────────────────
$base = dirname(__DIR__); // document root of dev.adalyzeai.xyz → /home/aialadze/public_html
$home = dirname($base);   // cPanel home → /home/aialadze

// cPanel patterns: main docroot, addon domains, subdomains, parent dirs
$candidates = [
    // Most likely: backend-dev as sibling or cousin of public_html
    $home . '/backend-dev/.env',
    $home . '/public_html/backend-dev/.env',
    $home . '/dev.evraapp.top/.env',
    $home . '/dev.evraapp.top/backend-dev/.env',
    $home . '/evraapp.top/.env',
    $home . '/evraapp.top/backend-dev/.env',
    $home . '/public_html/dev.evraapp.top/.env',
    $home . '/public_html/dev.evraapp.top/backend-dev/.env',
    // cPanel addon domain roots (common layout)
    $home . '/dev.evraapp.top/public_html/.env',
    $home . '/dev.evraapp.top/public_html/backend-dev/.env',
    // One level up from cPanel home (unusual but possible shared hosting)
    dirname($home) . '/evraapp/backend-dev/.env',
    dirname($home) . '/evraapp/public_html/backend-dev/.env',
    // Absolute fallbacks for evraapp account
    '/home/evraapp/backend-dev/.env',
    '/home/evraapp/public_html/backend-dev/.env',
    '/home/evraapp/dev.evraapp.top/.env',
    '/home/evraapp/dev.evraapp.top/backend-dev/.env',
    // Already-tried (kept for completeness)
    $base . '/../backend-dev/.env',
    $base . '/../../backend-dev/.env',
];

$db_host = 'localhost'; $db_name = ''; $db_user = ''; $db_pass = ''; $db_port = '3306';
$env_found = '';

foreach ($candidates as $f) {
    if (!file_exists($f)) continue;
    $env_found = $f;
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (ltrim($line)[0] === '#') continue;
        if (strpos($line, '=') === false) continue;
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v, " \t\r\n\"'");
        match ($k) {
            'DB_HOST'                   => $db_host = $v,
            'DB_PORT'                   => $db_port = $v,
            'DB_DATABASE', 'DB_NAME'    => $db_name = $v,
            'DB_USERNAME', 'DB_USER'    => $db_user = $v,
            'DB_PASSWORD', 'DB_PASS'    => $db_pass = $v,
            default                     => null,
        };
    }
    break;
}

if (!$db_name) {
    // ── Deep scan: look for any .env with DB_NAME under home ─────────────────
    $found_envs = [];
    $scan_roots = [$home, '/home/evraapp'];
    foreach ($scan_roots as $root) {
        if (!is_dir($root)) continue;
        // Scan 3 levels deep
        foreach (glob("$root/.env") ?: [] as $f) $found_envs[] = $f;
        foreach (glob("$root/*/.env") ?: [] as $f) $found_envs[] = $f;
        foreach (glob("$root/*/*/.env") ?: [] as $f) $found_envs[] = $f;
        foreach (glob("$root/*/*/*/.env") ?: [] as $f) $found_envs[] = $f;
    }

    // ── Directory listings for debugging ─────────────────────────────────────
    $nearby = [];
    $scan_dirs = [
        $home,
        $base,
        $home . '/dev.evraapp.top',
        '/home/evraapp',
        '/home',
    ];
    foreach ($scan_dirs as $dir) {
        if (is_dir($dir)) {
            $nearby[$dir] = array_values(array_diff(scandir($dir), ['.', '..']));
        }
    }

    echo json_encode([
        'error'      => 'Backend .env not found',
        'tried'      => $candidates,
        'base'       => $base,
        'home'       => $home,
        'found_envs' => $found_envs,   // any .env files discovered by glob
        'nearby'     => $nearby,
    ], JSON_PRETTY_PRINT);
    exit;
}

// ── Connect & insert ─────────────────────────────────────────────────────────
try {
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4",
        $db_user, $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Already exists?
    $row = $pdo->query("SELECT ad_id FROM ads WHERE ad_id = 1")->fetch();
    if ($row) {
        // Update image_path in case it's null
        $pdo->exec("UPDATE ads SET image_path = 'https://adalyzeai.xyz/App/uploads/ads/251110_1762791229_69120f3d2267b.jpg', user_id = 1 WHERE ad_id = 1");
        echo json_encode(['status' => 'updated', 'ad_id' => 1, 'env' => $env_found]);
        @unlink(__FILE__);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO ads (ad_id, user_id, ads_name, ads_type, image_path, industry, score, status, uploaded_on)
         VALUES (1, 1, 'Free Trial Ad', 'Single',
                 'https://adalyzeai.xyz/App/uploads/ads/251110_1762791229_69120f3d2267b.jpg',
                 'Technology & Software', 68.00, 1, '2025-11-10 21:00:00')"
    );
    $stmt->execute();

    echo json_encode(['status' => 'success', 'ad_id' => 1, 'user_id' => 1, 'env' => $env_found]);
    @unlink(__FILE__); // self-destruct after success

} catch (Throwable $e) {
    echo json_encode(['error' => $e->getMessage(), 'env' => $env_found]);
}
