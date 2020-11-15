<!DOCTYPE html>
<html>

<head>
    <title>Dictionary Game Score</title>
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">


    <link href="./assets/css/libraries/spectre.min.css" rel="stylesheet" type="text/css" />
    <link href="./assets/css/main.css" rel="stylesheet" type="text/css" />
    <link href="./assets/css/libraries/spectre-icons.min.css" rel="stylesheet" type="text/css" />

</head>

<body>
    <table class='table'>
        <thead>
            <tr>
                <td>Player</td>
                <td>Overall score</td>
                <td>Points earned in current or most recent round</td>
            </tr>
        </thead>
        <tbody>
    <?php 
    
    require_once './backend/connection.php';

    $users = $db->query("SELECT `id`, `full_name`, `score`, `round_points` FROM `users`")->fetch_all(MYSQLI_ASSOC);

    foreach($users as $user) {
        echo '<tr>';
        echo '<td>';
        echo $user['full_name'];
        echo '</td>';
        echo '<td>';
        echo $user['score'];
        echo '</td>';
        echo '<td>';
        echo $user['round_points'];
        echo '</td>';
        echo '</tr>';
    }

    ?>
    </tbody>
    </table>
</body>

</html>