<?php
require_once './verify.php';
require_once './connection.php';

if ($access == 1) {

if ($_GET['func'] == 'load') {
    $users = $db->query("SELECT `id`, `email`, `full_name`, `score`, `round_points`, `login_key` FROM `users`")->fetch_all(MYSQLI_ASSOC);
    echo "[" . json_encode($users, JSON_PRETTY_PRINT) . "]";
} elseif($_GET['func'] == 'update') {
    $u = json_decode($_GET['users']);
    $db->query('DELETE FROM `users` WHERE true');
    foreach($u as $user) {
        if($user->id != "") {
            $id = $user->id;
            $email = $user->email;
            $name = $user->name;
            $score = $user->score;
            $rscore = $user->roundScore;
            $logkey = $user->login_key;
            echo "INSERT INTO `users` (`id`, `email`, `full_name`, `score`, `round_points`, `login_key`) VALUES ('$id', '$email', '$name', '$score', '$rscore', '$logkey')";
            $db->query("INSERT INTO `users` (`id`, `email`, `full_name`, `score`, `round_points`, `login_key`) VALUES ('$id', '$email', '$name', '$score', '$rscore', '$logkey')");
        } else {
            $email = $user->email;
            $name = $user->name;
            $score = 0;
            $rscore = 0;
            $logkey = $user->email;
            $db->query("INSERT INTO `users` (`email`, `full_name`, `score`, `round_points`, `login_key`) VALUES ('$email', '$name', '$score', '$rscore', '$logkey')");
        }
    }
} elseif ($_GET['func'] == 'adduser') {
    $logkey = uniqid();
    $db->query("INSERT INTO `users` (`email`, `full_name`, `score`, `round_points`, `login_key`) VALUES ('', '', 0, 0, '$logkey')");
}
} else {
die();
}
?>