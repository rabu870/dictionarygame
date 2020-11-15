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
                $users = $db->query("SELECT `id`, `email`, `full_name`, `score`, `round_points` FROM `users`")->fetch_all(MYSQLI_ASSOC);
                $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
                $roundid = $active[0]['id'];
                $submissions = $db->query("SELECT * FROM `submissions` WHERE `round_id` = '$roundid'")->fetch_all(MYSQLI_ASSOC);
                $votes = $db->query("SELECT * FROM `votes` WHERE `round_id` = '$roundid'")->fetch_all(MYSQLI_ASSOC);
                echo "[1, 1, " . json_encode($users, JSON_PRETTY_PRINT) . ', ' . json_encode($submissions, JSON_PRETTY_PRINT) . ', ' . json_encode($active[0], JSON_PRETTY_PRINT) . ', ' . json_encode($votes, JSON_PRETTY_PRINT) . "]";
            } else {
                $users = $db->query("SELECT `id`, `email`, `full_name`, `score`, `round_points` FROM `users`")->fetch_all(MYSQLI_ASSOC);
                $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
                $roundid = $active[0]['id'];
                $submissions = $db->query("SELECT * FROM `submissions` WHERE `round_id` = '$roundid'")->fetch_all(MYSQLI_ASSOC);
                echo "[1, 0, " . json_encode($users, JSON_PRETTY_PRINT) . ', ' . json_encode($submissions, JSON_PRETTY_PRINT) . ', ' . json_encode($active[0], JSON_PRETTY_PRINT) . "]";
            }
        } else {
            $users = $db->query("SELECT `id`, `email`, `full_name`, `score`, `round_points` FROM `users`")->fetch_all(MYSQLI_ASSOC);
            echo "[0, " . json_encode($users, JSON_PRETTY_PRINT) . "]";
        }
    } elseif($_GET['func'] == 'newround') {
        $db->query('DELETE * FROM `rounds` WHERE true');
        $db->query("UPDATE `rounds` SET `active` = '0' WHERE true");
        $word = $_GET['word'];
        $def = $_GET['def'];
        $reverse = $_GET['reverse'];
        $notes = '' . $_GET['notes'];
        if($db->query("INSERT INTO `rounds` (`word`, `definition`, `active`, `reverse`, `voting`, `notes`) VALUES ('$word', '$def', '1', '$reverse', '0', '$notes')")) {
            echo "INSERT INTO `rounds` (`word`, `definition`, `active`, `reverse`, `voting`, `notes`) VALUES ('$word', '$def', '1', '$reverse', '0', '$notes')";
            $roundid = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
            $db->query("INSERT INTO `submissions` (`round_id`, `user_id`, `submission`, `is_real`) VALUES ('$roundid', '0', '$def', '1');");
            $db->query("UPDATE `users` SET `round_points` = '0' WHERE true");
            $data['message'] = 'created';
            $pusher->trigger('student-updates', 'round-update', $data);
            echo '1';
        } else {
            echo "Round creation failed. Please try again.";
        }
    } elseif($_GET['func'] == 'submissions') {
        $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
        $roundid = $active[0]['id'];
        $submissions = $db->query("SELECT * FROM `submissions` WHERE `round_id` = '$roundid'")->fetch_all(MYSQLI_ASSOC);
        echo json_encode($submissions, JSON_PRETTY_PRINT);
    } elseif($_GET['func'] == 'votes') {
        $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
        $roundid = $active[0]['id'];
        $votes = $db->query("SELECT * FROM `votes` WHERE `round_id` = '$roundid'")->fetch_all(MYSQLI_ASSOC);
        $users = $db->query("SELECT `id`, `email`, `full_name`, `score`, `round_points` FROM `users`")->fetch_all(MYSQLI_ASSOC);
        echo '[' . json_encode($votes, JSON_PRETTY_PRINT) . ', ' . json_encode($users) . ']';
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
        $edit = addslashes($_GET['update']);
        if($db->query("UPDATE `submissions` SET `submission` = '$edit' WHERE `id` = '$subid'")) {
            echo '1';
        } else {
            echo "Failed. Try again.";
        }
    } elseif($_GET['func'] == 'autofix') {
        $subid = $_GET['subid'];
        $edit = addslashes($_GET['update']);
        if($db->query("UPDATE `submissions` SET `submission` = '$edit' WHERE `id` = '$subid'")) {
            echo $_GET['update'];
        } else {
            http_response_code(400);
        }
    } elseif($_GET['func'] == 'voting') {
        if($db->query("UPDATE `rounds` SET `voting` = '1' WHERE `active` = '1'")) {
            $data['message'] = 'voting';
            $pusher->trigger('student-updates', 'round-update', $data);
            echo '1';
        } else {
            echo "Failed. Try again.";
        }
    } elseif($_GET['func'] == 'end') {
        if($db->query("UPDATE `rounds` SET `acceptingvotes` = '0' WHERE `active` = '1'")) {
            if($_GET['scored'] == 'true') {
                $db->query("UPDATE `users` SET `score` = `score` + `round_points` WHERE true");
            }
            $data['message'] = 'end';
            $pusher->trigger('student-updates', 'round-update', $data);
            echo '1';
        } else {
            echo "Failed. Try again.";
        }
    } elseif($_GET['func'] == 'endf') {
        if($db->query("UPDATE `rounds` SET `active` = '0' WHERE `active` = '1'")) {
            $data['message'] = 'end';
            $pusher->trigger('student-updates', 'round-update', $data);
            echo '1';
        } else {
            echo "Failed. Try again.";
        }
    }
} else {
    die();
}
