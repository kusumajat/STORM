<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', '', 'dbresp');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['no'])) {
    $no = intval($_POST['no']);

    $stmt = $conn->prepare('DELETE FROM tabel_resp WHERE no = ?');
    $stmt->bind_param('i', $no);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No rows deleted. Check the "no" value.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Query execution failed: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request or missing "no" parameter']);
}

$conn->close();
?>
