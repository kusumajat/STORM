<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

// Validasi data
if (!isset($data['longitude'], $data['latitude'], $data['keterangan'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
    exit;
}

$longitude = $data['longitude'];
$latitude = $data['latitude'];
$keterangan = $data['keterangan'];

// Koneksi ke database
$conn = new mysqli('localhost', 'root', '', 'dbresp');

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// Insert data ke tabel
$stmt = $conn->prepare('INSERT INTO tabel_resp (longitude, latitude, keterangan) VALUES (?, ?, ?)');
$stmt->bind_param('dds', $longitude, $latitude, $keterangan);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
