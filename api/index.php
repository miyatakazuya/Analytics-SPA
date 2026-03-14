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

        // Check ACLs
        $role = $_SESSION['user']['role'];
        if ($role === 'viewer') {
            if ($method === 'PUT' || $method === 'DELETE' || !in_array($resource, ['reports', 'dashboard'])) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden. Viewers cannot modify reports or access raw data.']);
                exit;
            }
        } elseif ($role === 'analyst' && $resource === 'data' && $method === 'GET') {
            $category = $_GET['category'] ?? '';
            $perms = $_SESSION['user']['permissions'] ?? [];
            $checkCat = $category === 'realtime' ? 'overview' : $category;
            if (!in_array($checkCat, $perms)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden. You do not have permission to view the ' . htmlspecialchars($category) . ' dashboard.']);
                exit;
            }
        }
    }

    if ($method === 'GET') {
        if ($resource === 'data') {
            $category = $_GET['category'] ?? '';
            $days = intval($_GET['days'] ?? 30);
            $dateFilterSessions = "created_at >= DATE_SUB(NOW(), INTERVAL $days DAY)";
            $dateFilterPageviews = "created_at >= DATE_SUB(NOW(), INTERVAL $days DAY)";
            $dateFilterActivities = "timestamp >= DATE_SUB(NOW(), INTERVAL $days DAY)";
            $dateFilterErrors = "created_at >= DATE_SUB(NOW(), INTERVAL $days DAY)";

            if ($category === 'overview') {
                $stmtVis = $pdo->query("SELECT COUNT(DISTINCT session_id) as visitors FROM sessions WHERE $dateFilterSessions");
                $visitors = $stmtVis->fetchColumn();

                $stmtViews = $pdo->query("SELECT COUNT(*) as views FROM pageviews WHERE $dateFilterPageviews");
                $views = $stmtViews->fetchColumn();

                $stmtBounce = $pdo->query("
                    SELECT 
                        (SELECT COUNT(*) FROM (SELECT session_id FROM pageviews WHERE $dateFilterPageviews GROUP BY session_id HAVING COUNT(*) = 1) as single) / 
                        NULLIF((SELECT COUNT(DISTINCT session_id) FROM pageviews WHERE $dateFilterPageviews), 0) * 100 as bounce_rate
                ");
                $bounceRate = round((float)$stmtBounce->fetchColumn(), 1);

                $stmtDur = $pdo->query("SELECT ROUND(AVG(TIMESTAMPDIFF(SECOND, enter_time, leave_time))) FROM pageviews WHERE leave_time IS NOT NULL AND $dateFilterPageviews");
                $visitDuration = $stmtDur->fetchColumn() ?: 0;

                $stmtChart = $pdo->query("
                    SELECT 
                        DATE(created_at) as day, 
                        COUNT(DISTINCT session_id) as visitors,
                        COUNT(id) as views 
                    FROM pageviews 
                    WHERE $dateFilterPageviews 
                    GROUP BY day 
                    ORDER BY day ASC
                ");
                $chartData = $stmtChart->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'visitors' => $visitors,
                    'views' => $views,
                    'bounceRate' => $bounceRate,
                    'visitDuration' => $visitDuration,
                    'chartData' => $chartData
                ]);
            } elseif ($category === 'performance') {
                $stmtTop = $pdo->query("SELECT url, COUNT(*) as views FROM pageviews WHERE url != '' AND url IS NOT NULL AND $dateFilterPageviews GROUP BY url ORDER BY views DESC LIMIT 10");
                $topPages = $stmtTop->fetchAll(PDO::FETCH_ASSOC);

                $stmtByDay = $pdo->query("SELECT DATE(created_at) as day, COUNT(*) as views FROM pageviews WHERE $dateFilterPageviews GROUP BY day ORDER BY day ASC");
                $byDay = $stmtByDay->fetchAll(PDO::FETCH_ASSOC);

                $stmtErrors = $pdo->query("SELECT error_type, COUNT(*) as count FROM errors WHERE $dateFilterErrors GROUP BY error_type ORDER BY count DESC LIMIT 5");
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
                    WHERE $dateFilterSessions
                    GROUP BY browser
                ");
                $browsers = $stmtBrowser->fetchAll(PDO::FETCH_ASSOC);

                $stmtNetwork = $pdo->query("SELECT network_type, COUNT(*) as count FROM sessions WHERE network_type IS NOT NULL AND $dateFilterSessions GROUP BY network_type");
                $networks = $stmtNetwork->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'browsers' => $browsers,
                    'networks' => $networks
                ]);
            } elseif ($category === 'behavior') {
                $stmtClicks = $pdo->query("SELECT element_tag, COUNT(*) as clicks FROM activities WHERE activity_type = 'click' AND $dateFilterActivities GROUP BY element_tag ORDER BY clicks DESC LIMIT 10");
                $topClicks = $stmtClicks->fetchAll(PDO::FETCH_ASSOC);

                $stmtActiveTime = $pdo->query("SELECT DATE(enter_time) as day, ROUND(AVG(TIMESTAMPDIFF(SECOND, enter_time, leave_time))) as avg_seconds FROM pageviews WHERE leave_time IS NOT NULL AND $dateFilterPageviews GROUP BY day ORDER BY day ASC");
                $activeTime = $stmtActiveTime->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'topClicks' => $topClicks,
                    'activeTime' => $activeTime
                ]);
            } elseif ($category === 'realtime') {
                $stmt = $pdo->query("
                    SELECT COUNT(DISTINCT session_id) as activeUsers 
                    FROM (
                        SELECT session_id FROM pageviews WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MINUTE)
                        UNION 
                        SELECT session_id FROM activities WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 3 MINUTE)
                    ) AS recent_sessions
                ");
                echo json_encode(['activeUsers' => (int)$stmt->fetchColumn()]);
            } elseif ($category === 'heatmap') {
                $targetUrl = $_GET['url'] ?? 'https://test.kazuyamiyata.site/';
                $stmt = $pdo->prepare("
                    SELECT a.x_coord as x, a.y_coord as y, COUNT(*) as value
                    FROM activities a
                    JOIN pageviews p ON a.session_id = p.session_id
                    WHERE p.url = ? AND a.activity_type = 'click' AND a.timestamp BETWEEN p.enter_time AND COALESCE(p.leave_time, NOW())
                    GROUP BY a.x_coord, a.y_coord
                ");
                $stmt->execute([$targetUrl]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
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
        } elseif ($resource === 'users') {
            if ($_SESSION['user']['role'] !== 'super_admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                exit;
            }
            $stmt = $pdo->query("SELECT id, email, display_name, role, permissions, created_at FROM users ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
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
        } elseif ($resource === 'users') {
            if ($_SESSION['user']['role'] !== 'super_admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden. Only administrators can create users.']);
                exit;
            }
            $input = json_decode(file_get_contents('php://input'), true);
            $newEmail = $input['email'] ?? '';
            $newPassword = $input['password'] ?? '';
            $newName = $input['displayName'] ?? '';
            $newRole = 'analyst'; // Analyst only
            $newPerms = $input['permissions'] ?? 'overview';

            if (empty($newEmail) || empty($newPassword)) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password are required']);
                exit;
            }

            $hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, display_name, role, permissions) VALUES (?, ?, ?, ?, ?)");
            try {
                if ($stmt->execute([$newEmail, $hash, $newName, $newRole, $newPerms])) {
                    http_response_code(201);
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to create user.']);
                }
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) { // Duplicate email
                    http_response_code(409);
                    echo json_encode(['error' => 'User with this email already exists.']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Database error.']);
                }
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
    } elseif ($method === 'PUT') {
        if ($resource === 'reports' && $id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $title = $input['title'] ?? null;
            $comments = $input['comments'] ?? null;
            if ($title) {
                $stmt = $pdo->prepare("UPDATE reports SET title = ?, comments = ? WHERE id = ?");
                $stmt->execute([$title, $comments, $id]);
                echo json_encode(['success' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
            }
            exit;
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
        }
    } elseif ($method === 'DELETE') {
        if ($resource === 'reports' && $id) {
            $stmt = $pdo->prepare("DELETE FROM reports WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            exit;
        } elseif ($resource === 'users' && $id) {
            if ($_SESSION['user']['role'] !== 'super_admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
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
