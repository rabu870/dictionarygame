<?php
  require __DIR__ . '/vendor/autoload.php';

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

  $data['message'] = 'hello world';
  $pusher->trigger('my-channel', 'my-event', $data);
?>