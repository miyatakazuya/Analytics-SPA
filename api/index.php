<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=webanalytics', 'collector', 'C0ll3ct0r_!2026_Secure');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $method = $_SERVER['REQUEST_METHOD'];
    $path = isset($_GET['path']) ? explode('/', trim($_GET['path'], '/')) : [];

    $resource = $path[0] ?? null;
    $id = $path[1] ?? null;

    $public_routes = ['login', 'logout'];
    if (!in_array($resource, $public_routes)) {
        session_start();
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized. Please log in.']);
            exit;
        }

        // RBAC Logic
        $role = $_SESSION['user']['role'];
        if ($role === 'viewer' && !in_array($resource, ['reports', 'dashboard'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden. Viewers cannot access raw data.']);
            exit;
        }
    }

    if ($method === 'GET') {
        if ($resource === 'data') {
            $category = $_GET['category'] ?? '';

            if ($category === 'performance') {
                // Existing pageviews logic + error counts
                $stmtTop = $pdo->query("SELECT url, COUNT(*) as views FROM pageviews WHERE url != '' AND url IS NOT NULL GROUP BY url ORDER BY views DESC LIMIT 10");
                $topPages = $stmtTop->fetchAll(PDO::FETCH_ASSOC);

                $stmtByDay = $pdo->query("SELECT DATE(created_at) as day, COUNT(*) as views FROM pageviews GROUP BY day ORDER BY day ASC");
                $byDay = $stmtByDay->fetchAll(PDO::FETCH_ASSOC);

                $stmtErrors = $pdo->query("SELECT error_type, COUNT(*) as count FROM errors GROUP BY error_type ORDER BY count DESC LIMIT 5");
                $topErrors = $stmtErrors->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'topPages' => $topPages,
                    'byDay' => $byDay,
                    'topErrors' => $topErrors
