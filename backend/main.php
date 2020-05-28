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
                $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
                $roundid = $active[0]['id'];
                $key = $_COOKIE["login_key"];
                $activeid = $active[0]['id'];
                $id = $db->query("SELECT `id` FROM `users` WHERE `login_key` = '$key'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
                $voted = $db->query("SELECT `id` FROM `votes` WHERE `user_id` = '$id' AND `round_id` = '$activeid'")->num_rows > 0;
                $submissions = $db->query("SELECT `id`, `submission` FROM `submissions` WHERE `round_id` = '$roundid' ORDER BY RAND()")->fetch_all(MYSQLI_ASSOC);
                echo "[1, 1, " . json_encode($active[0], JSON_PRETTY_PRINT) . ', ' . json_encode($voted) . ', '. json_encode($submissions) . "]";
            } else {
                $active = $db->query("SELECT * FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC);
                $roundid = $active[0]['id'];
                $key = $_COOKIE["login_key"];
                $activeid = $active[0]['id'];
                $id = $db->query("SELECT `id` FROM `users` WHERE `login_key` = '$key'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
                $submitted = $db->query("SELECT `id` FROM `submissions` WHERE `user_id` = '$id' AND `round_id` = '$activeid'")->num_rows > 0;
                echo "[1, 0, " . json_encode($active[0], JSON_PRETTY_PRINT) . ', ' . json_encode($submitted) . "]";
            }
        } else {
            echo "[0]";
        }
    } elseif($_GET['func'] == 'sub') {
        $sub = $_GET['sub'];
        $key = $_COOKIE["login_key"];
        $activeid = $db->query("SELECT id FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
        $id = $db->query("SELECT `id` FROM `users` WHERE `login_key` = '$key'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
        $submitted = $db->query("SELECT `id` FROM `submissions` WHERE `user_id` = '$id' AND `round_id` = '$activeid'")->num_rows > 0;
        $voting = $db->query("SELECT `id` FROM `rounds` WHERE `active` = '1' AND `voting` = '1'")->num_rows > 0;
        if(!$submitted || $sub != '' || !$voting) {
            if($db->query("INSERT INTO `submissions` (`round_id`, `user_id`, `submission`, `is_real`) VALUES ('$activeid', '$id', '$sub', '0');")) {
                $data['message'] = '1';
                $pusher->trigger('admin-updates', 'new-submission', $data);
                echo '1';
            } else {
                echo 'Failed. Try again.';
            }
        } else {
            echo "Something's wrong...";
        }
    } elseif($_GET['func'] == 'vote') {
        $sub = $_GET['sub'];
        $activeid = $db->query("SELECT id FROM `rounds` WHERE `active` = '1'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
        $key = $_COOKIE["login_key"];
        $id = $db->query("SELECT `id` FROM `users` WHERE `login_key` = '$key'")->fetch_all(MYSQLI_ASSOC)[0]['id'];
        $voted = $db->query("SELECT `id` FROM `votes` WHERE `user_id` = '$id' AND `round_id` = '$activeid'")->num_rows > 0;
        $voting = $db->query("SELECT `id` FROM `rounds` WHERE `active` = '1' AND `voting` = '1'")->num_rows > 0;
        if(!$voted && $sub != '' && $voting && $db->query("SELECT `id` FROM `rounds` WHERE `active` = '1' AND `acceptingvotes` = '1'")->num_rows > 0) {
            if($db->query("INSERT INTO `votes` (`round_id`, `user_id`, `submission_id`) VALUES ('$activeid', '$id', '$sub');")) {
                $subinfo = $db->query("SELECT * FROM `submissions` WHERE `id` = '$sub'")->fetch_all(MYSQLI_ASSOC)[0];
                if($subinfo['is_real'] == '1') {
                    $db->query("UPDATE `users` SET `score` = `score` + 2 WHERE `id` = '$id'");
                    $db->query("UPDATE `users` SET `round_points` = `round_points` + 2 WHERE `id` = '$id'");
                } else {
                    $authorid = $db->query("SELECT `user_id` FROM `submissions` WHERE `id` = '$sub'")->fetch_all(MYSQLI_ASSOC)[0]['user_id'];
                    $db->query("UPDATE `users` SET `score` = `score` + 1 WHERE `id` = '$authorid'");
                    $db->query("UPDATE `users` SET `round_points` = `round_points` + 1 WHERE `id` = '$authorid'");
                }
                $data['message'] = '1';
                $pusher->trigger('admin-updates', 'new-vote', $data);
                echo '1';
            } else {
                echo 'Failed. Try again.';
            }
        } else {
            echo "Something's wrong...";
        }
    }
} else {
    die();
}
