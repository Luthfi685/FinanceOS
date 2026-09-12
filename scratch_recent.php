<?php

$data = json_decode(file_get_contents('https://financeos-fh71.onrender.com/api/system/audit'), true);

foreach ($data['recent'] as $tx) {
    echo "ID: " . $tx['id'] . " | User: " . $tx['user_id'] . " | Type: " . $tx['type'] . " | Amount: " . $tx['amount'] . " | Desc: " . $tx['description'] . " | Date: " . $tx['date'] . PHP_EOL;
}
