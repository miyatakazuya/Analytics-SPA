<?php
$log_file = "deploy_log.txt";
$date = date('Y-m-d H:i:s');

$output = shell_exec("git pull origin main 2>&1");

$log_entry = "[$date] PULL RESULT: " . trim($output) . "\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

echo "Deployment finished. Check log for details.";
?>
