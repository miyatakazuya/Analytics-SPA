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
    $id = $path[1] ?? null; // Can act as session_id for nested routes
    
    if ($method === 'GET') {
        if ($resource === 'sessions') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM sessions WHERE session_id = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
            } else {
                $stmt = $pdo->query("SELECT * FROM sessions");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
        } elseif ($resource === 'pageviews') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM pageviews WHERE session_id = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } else {
                $stmt = $pdo->query("SELECT * FROM pageviews");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
        } elseif ($resource === 'activities') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM activities WHERE session_id = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } else {
                $stmt = $pdo->query("SELECT * FROM activities");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
        } elseif ($resource === 'errors') {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM errors WHERE session_id = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } else {
                $stmt = $pdo->query("SELECT * FROM errors");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
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
?>
