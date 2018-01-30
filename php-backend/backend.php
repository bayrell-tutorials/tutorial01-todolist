#!/usr/bin/env php71
<?php


define ("AMQP_HOST", "10.0.0.100");
define ("AMQP_PORT", 5672);
define ("AMQP_LOGIN", "guest");
define ("AMQP_PASSWORD", "guest");
define ("AMQP_APP_EXCHANGE", "tutorial01-todolist");
define ("AMQP_APP_QUEUE", "tutorial01-todolist-php-backend");


define ("ERROR_OK", 1);
define ("ERROR_UNKOWN", -1);
define ("ERROR_AMPQ", -1000);
define ("ERROR_AMPQ_TIMEOUT", -1001);
define ("ERROR_AMPQ_CONNECTION", -1002);
define ("ERROR_AMPQ_INCORRECT_DATA", -1003);


require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Connection\AMQPStreamConnection;


# Connect to AMQP
$connection = new AMQPStreamConnection(AMQP_HOST, AMQP_PORT, AMQP_LOGIN, AMQP_PASSWORD);
$channel = $connection->channel();


# Create exchange
$channel->exchange_declare(
	AMQP_APP_EXCHANGE,  // string $exchange
	'direct',    // string $type
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
	
	if ($msg->has('reply_to') && $msg->has('correlation_id')){
		
		$body_data = @json_decode($msg->body, true);
		$result = json_encode([
			'code' => ERROR_AMPQ_INCORRECT_DATA,
			'message' => "Message body does not json format",
		]);
		
		if ($body_data){
			$cmd = isset($body_data['cmd']) ? $body_data['cmd'] : null;
			$data = isset($body_data['data']) ? $body_data['data'] : null;
			
			echo "[x] Received command: ", $cmd, "\n";
			
			$arr = [
				'code' => ERROR_OK,
				'message' => "OK",
				'cmd' => $cmd,
			];
			
			$result = json_encode([
				'code' => ERROR_OK,
				'message' => "OK",
				'cmd' => $cmd,
			]);
		}
		
		
		$answer = new AMQPMessage(
			(string) $result,
			array('correlation_id' => $msg->get('correlation_id'))
		);
		
		$msg->delivery_info['channel']->basic_publish(
			$answer, 
			'', 
			$msg->get('reply_to')
		);
	}
	
};


$channel->basic_qos(null, 1, null);
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


$channel->close();
$connection->close();
