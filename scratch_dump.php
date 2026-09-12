<?php

$data = json_decode(file_get_contents('https://financeos-fh71.onrender.com/api/system/audit'), true);

$allTx = $data['recent'];
// Let's create an endpoint that returns all transactions for user 2
file_put_contents('scratch_dump_tx.json', json_encode($allTx, JSON_PRETTY_PRINT));
echo "Recent tx count: " . count($allTx) . PHP_EOL;
