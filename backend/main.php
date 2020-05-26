<?php

require __DIR__ . '/vendor/autoload.php';
require_once './verify.php';
require_once './connection.php';

$options = array(
    'cluster' => 'us3',
    'useTLS' => true
  );
  $pusher = new Pusher\Pusher(
    'c23e05d150117a5b82ed',
    '0f70b99e7d82429375de',
    '1005405',
    $options
  );

  //$data['message'] = 'hello world';
  //$pusher->trigger('admin-updates', 'my-event', $data);

if ($access == 2) {

    if ($_GET['func'] == 'load') {
        if($db->query("SELECT `id` FROM `rounds` WHERE `active` = '1'")->num_rows > 0) {
            if($db->query("SELECT `id` FROM `rounds` WHERE `active` = '1' AND `voting` = '1'")->num_rows > 0) {

            } else {
                $users = $db->query("SELECT `id`, `email`, `full_name`, `score` FROM `users`")->fetch_all(MYSQLI_ASSOC);
                $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
                $roundid = $active[0]['id'];
                $submissions = $db->query("SELECT * FROM `submissions` WHERE `round_id` = '$roundid'")->fetch_all(MYSQLI_ASSOC);
                echo "[1, " . json_encode($users, JSON_PRETTY_PRINT) . ', ' . json_encode($submissions, JSON_PRETTY_PRINT) . ', ' . json_encode($active[0], JSON_PRETTY_PRINT) . "]";
            }
        } else {
            echo "[0]";
        }
    }
} else {
    die();
}
