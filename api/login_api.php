<?php
// $pdo = new PDO('mysql:host=localhost;dbname=webanalytics', 'collector', 'C0ll3ct0r_!2026_Secure');
// $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// $method = $_SERVER['REQUEST_METHOD'];
// $path = isset($_GET['path']) ? explode('/', trim($_GET['path'], '/')) : [];

// $resource = $path[0] ?? null;
// $id = $path[1] ?? null;

session_start();

$stmt = $pdo->prepare(
    'SELECT id, email, password_hash, display_name, role FROM users WHERE email = ?'
);
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

session_regenerate_id(true);
$_SESSION['user'] = [
    'email' => $user['email'],
    'displayName' => $user['display_name'],
    'role' => $user['role']
];
echo json_encode(['success' => true, 'data' => $_SESSION['user']]);
exit;
