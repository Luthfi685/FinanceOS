<?php

$data = json_decode(file_get_contents('https://financeos-fh71.onrender.com/api/system/audit'), true);

foreach ($data['users'] as $u) {
    if ($u['id'] == 1) {
        echo "User ID 1: " . $u['name'] . PHP_EOL;
        echo "Tx Count: " . $u['transaction_count'] . PHP_EOL;
        echo "Total Income: " . $u['total_income'] . PHP_EOL;
        echo "Total Expense: " . $u['total_expense'] . PHP_EOL;
        echo "Wallets Count: " . count($u['wallets']) . PHP_EOL;
        echo "Wallets: " . PHP_EOL;
        foreach ($u['wallets'] as $w) {
            echo "  - " . $w['name'] . " (ID: " . $w['id'] . "): " . $w['balance'] . PHP_EOL;
        }
    }
}
