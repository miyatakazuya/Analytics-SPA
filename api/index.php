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
                ]);
            } elseif ($category === 'demographics') {
                $stmtBrowser = $pdo->query("
                    SELECT 
                        CASE 
                            WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
                            WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
                            WHEN user_agent LIKE '%Safari%' THEN 'Safari'
                            WHEN user_agent LIKE '%Edge%' THEN 'Edge'
                            ELSE 'Other'
                        END as browser,
                        COUNT(*) as count
                    FROM sessions 
                    GROUP BY browser
                ");
                $browsers = $stmtBrowser->fetchAll(PDO::FETCH_ASSOC);

                $stmtNetwork = $pdo->query("SELECT network_type, COUNT(*) as count FROM sessions WHERE network_type IS NOT NULL GROUP BY network_type");
                $networks = $stmtNetwork->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'browsers' => $browsers,
                    'networks' => $networks
                ]);
            } elseif ($category === 'behavior') {
                $stmtClicks = $pdo->query("SELECT element_tag, COUNT(*) as clicks FROM activities WHERE activity_type = 'click' GROUP BY element_tag ORDER BY clicks DESC LIMIT 10");
                $topClicks = $stmtClicks->fetchAll(PDO::FETCH_ASSOC);

                $stmtActiveTime = $pdo->query("SELECT DATE(enter_time) as day, ROUND(AVG(TIMESTAMPDIFF(SECOND, enter_time, leave_time))) as avg_seconds FROM pageviews WHERE leave_time IS NOT NULL GROUP BY day ORDER BY day ASC");
                $activeTime = $stmtActiveTime->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'topClicks' => $topClicks,
                    'activeTime' => $activeTime
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid category specified.']);
            }
        } elseif ($resource === 'reports') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM reports WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
            } else {
                $stmt = $pdo->query("SELECT * FROM reports ORDER BY created_at DESC");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
        } elseif ($resource === 'dashboard') {
            echo json_encode(['user' => $_SESSION['user']]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found.']);
        }
    } elseif ($method === 'POST') {
        if ($resource === 'login') {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';

            require 'login_api.php';
            exit;
        } elseif ($resource === 'reports') {
            $input = json_decode(file_get_contents('php://input'), true);
            $title = $input['title'] ?? 'Untitled Report';
            $category = $input['category'] ?? 'performance';
            $data_snapshot = json_encode($input['data_snapshot'] ?? []);
            $comments = $input['comments'] ?? '';
            $author_email = $_SESSION['user']['email'];

            $stmt = $pdo->prepare("INSERT INTO reports (title, category, author_email, data_snapshot, comments) VALUES (?, ?, ?, ?, ?)");
            if ($stmt->execute([$title, $category, $author_email, $data_snapshot, $comments])) {
                http_response_code(201);
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save report.']);
            }
            exit;
        } elseif ($resource === 'logout') {
            session_start();
            session_destroy();
            setcookie(session_name(), '', time() - 3600, '/');
            echo json_encode(['success' => true]);
            exit;
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed for reporting API']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
