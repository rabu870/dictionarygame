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

if ($access == 1) {

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
            $users = $db->query("SELECT `id`, `email`, `full_name`, `score` FROM `users`")->fetch_all(MYSQLI_ASSOC);
            echo "[0, " . json_encode($users, JSON_PRETTY_PRINT) . "]";
        }
    } elseif($_GET['func'] == 'newround') {
        $db->query("UPDATE `rounds` SET `active` = '0' WHERE true");
        $word = $_GET['word'];
        $def = $_GET['def'];
        $reverse = $_GET['reverse'];
        $notes = '' . $_GET['notes'];
        if($db->query("INSERT INTO `rounds` (`word`, `definition`, `active`, `reverse`, `voting`, `notes`) VALUES ('$word', '$def', '1', '$reverse', '0', '$notes')")) {
            $roundid = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
            $db->query("INSERT INTO `submissions` (`round_id`, `user_id`, `submission`, `is_real`) VALUES ('$roundid', '0', '$def', '1');");
            echo '1';
        } else {
            echo "Round creation failed. Please try again.";
        }
    } elseif($_GET['func'] == 'submissions') {
        $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
        $roundid = $active[0]['id'];
        $submissions = $db->query("SELECT * FROM `submissions` WHERE `round_id` = '$roundid'")->fetch_all(MYSQLI_ASSOC);
        echo json_encode($submissions, JSON_PRETTY_PRINT);
    } elseif($_GET['func'] == 'removesub') {
        $subid = $_GET['subid'];
        if($db->query("DELETE FROM `submissions` WHERE `id` = '$subid'")) {
            $data['message'] = $subid;
            $pusher->trigger('student-updates', 'sub-removed', $data);
            echo '1';
        } else {
            echo "Failed. Try again.";
        }
    } elseif($_GET['func'] == 'updatesub') {
        $subid = $_GET['subid'];
        $edit = $_GET['update'];
        if($db->query("UPDATE `submissions` SET `submission` = '$edit' WHERE `id` = '$subid'")) {
            echo '1';
        } else {
            echo "Failed. Try again.";
        }
    } elseif($_GET['func'] == 'autofix') {
        $subid = $_GET['subid'];
        $edit = $_GET['update'];
        if($db->query("UPDATE `submissions` SET `submission` = '$edit' WHERE `id` = '$subid'")) {
            echo $edit;
        } else {
            http_response_code(400);
        }
    }
} else {
    die();
}
