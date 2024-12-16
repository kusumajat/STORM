<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', '', 'dbresp');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$query = "SELECT no, longitude, latitude, keterangan FROM tabel_resp";
$result = $conn->query($query);

$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'no' => $row['no'],
            'longitude' => $row['longitude'],
            'latitude' => $row['latitude'],
            'keterangan' => $row['keterangan']
        ];
    }
}

echo json_encode(['success' => true, 'data' => $data]);
$conn->close();
?>
