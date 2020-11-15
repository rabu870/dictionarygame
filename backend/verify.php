<?php
require_once './connection.php';

$key = $_COOKIE["login_key"];

if ($db->query("SELECT id FROM `users` WHERE `login_key` = '$key'")->num_rows) {
    $access = 2;
} elseif ($db->query("SELECT id FROM `admin` WHERE `login_key` = '$key'")->num_rows) {
    $access = 1;
} else {
    $access = 0;
}
if (!empty($_GET['client'])) {
    echo $access;
}
