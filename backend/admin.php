<?php
require_once './verify.php';
require_once './connection.php';
if ($access == 1) {
    if ($_GET['func'] == 'load') {
        $s = $db->query('SELECT * FROM `students`')->fetch_all(MYSQLI_ASSOC);
        $a = $db->query('SELECT * FROM `admin`')->fetch_all(MYSQLI_ASSOC);
        $c = $db->query('SELECT * FROM `meta`')->fetch_all(MYSQLI_ASSOC);
        $u = [];
        foreach($s as $stu){
            if(strval($stu['stickered']) == '0'){
                array_push($u,ucwords($stu['first_name'] . ' ' . str_split($stu['last_name'])[0] . '.'));
            }
        }
        echo "[" . json_encode($s, JSON_PRETTY_PRINT) . ", " . json_encode($a, JSON_PRETTY_PRINT) . ", " . json_encode($c, JSON_PRETTY_PRINT) . ", " . json_encode($u, JSON_PRETTY_PRINT) . "]";
    }
} else {
    die();
}
