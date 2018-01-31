#!/usr/bin/env php71
<?php

define ("MONGODB_HOST", "10.0.0.100");
define ("MONGODB_PORT", 27017);
define ("MONGODB_USERNAME", 'jsmith');
define ("MONGODB_PASSWORD", 'some-initial-password');
define ("AMQP_HOST", "10.0.0.100");
define ("AMQP_PORT", 5672);
define ("AMQP_LOGIN", "guest");
define ("AMQP_PASSWORD", "guest");
define ("AMQP_APP_EXCHANGE", "tutorial01-todolist");
define ("AMQP_APP_QUEUE", "tutorial01-todolist-php-backend");


define ("ERROR_OK", 1);
define ("ERROR_UNKOWN", -1);
define ("ERROR_UNKOWN_COMMAND", -2);
define ("ERROR_RUNTIME", -3);
define ("ERROR_AMPQ", -1000);
define ("ERROR_AMPQ_TIMEOUT", -1001);
define ("ERROR_AMPQ_CONNECTION", -1002);
define ("ERROR_AMPQ_INCORRECT_DATA", -1003);


require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Connection\AMQPStreamConnection;


global $mongodb_connection, $amqp_connection, $amqp_channel;


# Connect to mongodb
$mongodb_connection = new \MongoDB\Client(
	"mongodb://".MONGODB_HOST.":".MONGODB_PORT,
	[
		//'authMechanism'=>'PLAIN',
		'username'=>MONGODB_USERNAME,
		'password'=>MONGODB_PASSWORD,
	]
);



# Connect to AMQP
$amqp_connection = new AMQPStreamConnection(AMQP_HOST, AMQP_PORT, AMQP_LOGIN, AMQP_PASSWORD);
$amqp_channel = $amqp_connection->channel();


# Create exchange
$amqp_channel->exchange_declare(
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
$amqp_channel->queue_declare(
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
$amqp_channel->queue_bind(
	AMQP_APP_QUEUE,     // string $queue
	AMQP_APP_EXCHANGE,  // string $exchange
	'',                 // string $routing_key
	false,              // bool $nowait
	null,               // array $arguments
	null                // int $ticket	
);



class Commands{
	
	public $mongodb_connection = null;
	
	
	public function getId($row){
		if ($row instanceof \MongoDB\BSON\ObjectId){
			return (string) $row;
		}		
		return $row;
	}
	
	public function toId($id){
		return new \MongoDB\BSON\ObjectId($id);
	}
	
	
	public function cmd_find($data){
		
		$start = isset($data['start']) ? $data['start'] : 0;
		$limit = isset($data['limit']) ? $data['limit'] : 100;
		
		$filter = [];
		$options = [
			'limit'=>$limit,
			'skip'=>$start,
			'projection'=>[
				'name' => 1,
			],
			'sort'=>[
				'name'=>1,
			],
		];
		
		$collection = $this->mongodb_connection->todolist->tasks;
		$cursor = $collection->find(
			$filter,
			$options
		);
		
		$result = [];
		foreach($cursor as $document) {
			$result[] = [
				'id' => $this->getId($document['_id']),
				'name' => $document['name'],
			];
		}
		
		return [
			'code' => ERROR_OK,
			'message' => "OK",
			'items' => $result,
		];
	}
	
	
	public function cmd_get_by_id($data){
		$collection = $this->mongodb_connection->todolist->tasks;
		$document = $collection->findOne(['_id' => $this->toId(isset($data['id']) ? $data['id'] : 0) ]);
		
		return [
			'code' => ERROR_OK,
			'message' => "OK",
			'document' => [
				'id' => $this->getId($document['_id']),
				'name' => $document['name'],
			],
		];
	}
	
	
	public function cmd_add($data){
		
		$collection = $this->mongodb_connection->todolist->tasks;
		$insertOneResult = $collection->insertOne([
			'name' => isset($data['name']) ? $data['name'] : '',
		]);
		
		return [
			'code' => ERROR_OK,
			'message' => "OK",
			'item' => [
				'id' => $this->getId($insertOneResult->getInsertedId()),
				'name' => isset($data['name']) ? $data['name'] : '',
			],
			'count' => $insertOneResult->getInsertedCount(),
			'id' => $this->getId($insertOneResult->getInsertedId()),
		];
	}
	
	public function cmd_edit($data){
		
		$id = isset($data['id']) ? $data['id'] : 0;
		
		$collection = $this->mongodb_connection->todolist->tasks;
		$updateResult = $collection->updateOne(
			[
				'_id' => $this->toId( $id ),
			],
			[
				'$set' => [
					'name' => isset($data['name']) ? $data['name'] : '',
				]
			]
		);
		
		return [
			'code' => ERROR_OK,
			'item' => [
				'id' => $id,
				'name' => isset($data['name']) ? $data['name'] : '',
			],
			'message' => "OK",
			'matched' => $updateResult->getMatchedCount(),
			'modified' => $updateResult->getModifiedCount(),
		];
	}
	
	
	public function cmd_delete($data){
		
		$collection = $this->mongodb_connection->todolist->tasks;
		$deleteResult = $collection->deleteOne(['_id' => $this->toId(isset($data['id']) ? $data['id'] : 0) ]);
		
		return [
			'code' => ERROR_OK,
			'message' => "OK",
			'count' => $deleteResult->getDeletedCount(),
		];
	}
	
	
	public function run($cmd, $data){
		
		if ($cmd == 'find'){
			return $this->cmd_find($data);
		}
		else if ($cmd == 'get_by_id'){
			return $this->cmd_get_by_id($data);
		}
		else if ($cmd == 'add'){
			return $this->cmd_add($data);
		}
		else if ($cmd == 'delete'){
			return $this->cmd_delete($data);
		}
		else if ($cmd == 'edit'){
			return $this->cmd_edit($data);
		}
		
		return [
			'code' => ERROR_UNKOWN_COMMAND,
			'message' => "Unknown command: " . $cmd,
		];
	}
	
}



# Start recieve messages
echo '[*] Waiting for messages. To exit press CTRL+C', "\n";


$callback = function($msg) {
	global $mongodb_connection;
	
	if ($msg->has('reply_to') && $msg->has('correlation_id')){
		
		$body_data = @json_decode($msg->body, true);
		$result = [
			'code' => ERROR_AMPQ_INCORRECT_DATA,
			'message' => "Message body does not json format",
		];
		
		
		if ($body_data){
			$cmd = isset($body_data['cmd']) ? $body_data['cmd'] : null;
			$data = isset($body_data['data']) ? $body_data['data'] : null;
			
			echo "[x] Received command: ", $cmd, "\n";
			
			// Run command
			try{
				$commands = new Commands();
				$commands->mongodb_connection = $mongodb_connection;
				$result = $commands->run($cmd, $data);
				$result['cmd'] = $cmd;
				unset ($commands);
			}
			catch (\Exception $ex){
				$result = [
					'code' => ERROR_RUNTIME,
					'message' => $ex->getMessage(),
				];
			}
			catch (\Error $ex){
				$result = [
					'code' => ERROR_RUNTIME,
					'message' => $ex->getMessage(),
				];
			}
		}
		
		
		$answer = new AMQPMessage(
			(string) json_encode($result),
			array('correlation_id' => $msg->get('correlation_id'))
		);
		
		$msg->delivery_info['channel']->basic_publish(
			$answer, 
			'', 
			$msg->get('reply_to')
		);
	}
	
};


$amqp_channel->basic_qos(null, 1, null);
$amqp_channel->basic_consume(
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

while(count($amqp_channel->callbacks)) {
    $amqp_channel->wait();
}


$amqp_channel->close();
$amqp_connection->close();

echo "exit\n\n";