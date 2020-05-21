<?php

    require_once './google-api-php-client/vendor/autoload.php';
    require_once '../backend/connection.php';

    $id_token = $_GET['idtoken'];

    $client = new Google_Client(['client_id' => '570971308489-6golgnijuhqlvon7s2av7getpv2j4h4d.apps.googleusercontent.com']);
    $guzzleClient = new \GuzzleHttp\Client(array( 'curl' => array( CURLOPT_SSL_VERIFYPEER => false, ), ));
    $client->setHttpClient($guzzleClient);

    $payload = $client->verifyIdToken($id_token);

    if ($payload) {
        $email = $payload['email'];
        //verify student
        if($db->query("SELECT id FROM `students` WHERE `email` = '$email'")->num_rows) {
            setcookie('login_key', $id_token, time() + (86400 * 5), "/");
            $db->query("UPDATE `students` SET `login_key` = '$id_token' WHERE `email` = '$email'");
            echo '2';
        } elseif ($db->query("SELECT id FROM `admin` WHERE `email` = '$email'")->num_rows) {
            setcookie('login_key', $id_token, time() + (86400 * 3), "/");
            $db->query("UPDATE `admin` SET `login_key` = '$id_token' WHERE `email` = '$email'");
            echo '1';
        } else {
            echo '3';
        }
    } else {     
        echo '0';
    }

?>