<?php

$data = json_decode(file_get_contents('https://financeos-fh71.onrender.com/api/system/audit'), true);

echo "Total Users: " . count($data['users']) . PHP_EOL;
echo "Total Transactions: " . $data['total_transactions'] . PHP_EOL;
echo "----------------------------------------" . PHP_EOL;

foreach ($data['users'] as $u) {
    if ($u['transaction_count'] > 0) {
        echo "User ID: " . $u['id'] . " | Name: " . $u['name'] . " | Tx Count: " . $u['transaction_count'] . " | Income: " . $u['total_income'] . " | Expense: " . $u['total_expense'] . " | Wallet Count: " . count($u['wallets']) . PHP_EOL;
    }
}
