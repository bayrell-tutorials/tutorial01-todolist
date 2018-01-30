#!/usr/bin/env php71
<?php


define ("AMQP_HOST", "10.0.0.100");
define ("AMQP_PORT", 5672);
define ("AMQP_LOGIN", "guest");
define ("AMQP_PASSWORD", "guest");
define ("AMQP_APP_EXCHANGE", "tutorial01-todolist");
define ("AMQP_APP_QUEUE", "tutorial01-todolist-php-backend");


require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;


# Connect to AMQP
$connection = new AMQPStreamConnection(AMQP_HOST, AMQP_PORT, AMQP_LOGIN, AMQP_PASSWORD);
$channel = $connection->channel();


# Create exchange
$channel->exchange_declare(
	AMQP_APP_EXCHANGE,  // string $exchange
	'fanout',    // string $type
	false,       // bool $passive
	true,        // bool $durable
	false,       // bool $auto_delete
	false,       // bool $internal
	false,       // bool $nowait
	null,        // array $arguments
	null         // int $ticket	
);


# Create queue
$channel->queue_declare(
	AMQP_APP_QUEUE,  // string $queue_name
	false,  // bool $passive
	true,   // bool $durable
	false,  // bool $exclusive
	false,  // bool $auto_delete
	false,  // bool $nowait
	null,   // array $arguments
	null    // int $ticket
);


# Bind exchange to queue
$channel->queue_bind(
	AMQP_APP_QUEUE,     // string $queue
	AMQP_APP_EXCHANGE,  // string $exchange
	'',                 // string $routing_key
	false,              // bool $nowait
	null,               // array $arguments
	null                // int $ticket	
);


# Start recieve messages
echo '[*] Waiting for messages. To exit press CTRL+C', "\n";


$callback = function($msg) {
  echo "[x] Received ", $msg->body, "\n";
};

$channel->basic_consume(
	AMQP_APP_QUEUE,   // string $queue_name
	'',           // string $consumer_tag
	false,        // bool $no_local
	true,         // bool $no_ack
	false,        // bool $exclusive
	false,        // bool $nowait
	$callback,    // callable $callback
	null,         // int $ticket
	null          // array $arguments
);

while(count($channel->callbacks)) {
    $channel->wait();
}

