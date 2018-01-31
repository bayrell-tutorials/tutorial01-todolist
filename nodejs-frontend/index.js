var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var expressWs = require('express-ws')(app);
var amqp = require('amqplib/callback_api');


var AMQP_HOST = "10.0.0.100";
var AMQP_PORT = 5672;
var AMQP_LOGIN = "guest";
var AMQP_PASSWORD = "guest";
var AMQP_APP_EXCHANGE = "tutorial01-todolist";

var amqp_channel = null;

amqp.connect('amqp://' + AMQP_HOST + ":" + AMQP_PORT, function(err, conn) {
	conn.createChannel(function(err, ch) {
		amqp_channel = ch;
	});
});



app.use('/', express.static('web'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


/*
Errors:
-1 - Unknown error
-2 - Error create temporary queue
*/

function ProxyRequest(){
	this.exchange = null;
	this.cmd = null;
	this.data = null;
	this.channel = null;
	this.correlation_id = guid();
	this.tmp_queue = null;
	this.request = null;
	this.response = null;
	this.message_ttl = 10 * 1000; 
	this.max_response_time = 20 * 1000; 
	this.status_ok = 0;
}

ProxyRequest.ERROR_OK = 1;
ProxyRequest.ERROR_UNKOWN = -1;
ProxyRequest.ERROR_AMPQ = -1000;
ProxyRequest.ERROR_AMPQ_TIMEOUT = -1001;
ProxyRequest.ERROR_AMPQ_CONNECTION_ERROR = -1002;

Object.assign( ProxyRequest.prototype, {
	
	
	deleteQueue: function(){
		if (this.tmp_queue == null)
			return;
		
		console.log("Delete queue: " + this.tmp_queue);
		this.channel.deleteQueue( this.tmp_queue );
		this.tmp_queue = null;
	},
	
	
	/**
	 * Send response
	 */
	send_response: function(data){		
		if (this.status_ok == 1)
			return;
		
		this.status_ok = 1;
		if (typeof data == "string"){
			this.response.send(data);
		}
		else{
			this.response.json(data);
		}
	},
	
	
	
	/**
	 * Receive from backend
	 */
	amqp_receive: function(msg){
		if (msg.properties.correlationId == this.correlation_id) {
			console.log('[.] Got answer');
			
			// Send to client
			this.send_response(msg.content.toString());
			this.deleteQueue();
		}
	},
	
	
	/**
	 * Send message to backend
	 */
	amqp_send: function(){
		
		// Listen temporary queue
		this.channel.consume(
			this.tmp_queue, 
			
			// Receive message
			(function(obj){
				return function(msg){
					
					if (msg == null){
						obj.send_response({
							"code": ProxyRequest.ERROR_AMPQ,
							"message": "Message is null",
						});
						obj.deleteQueue();
					}
					else{
						obj.amqp_receive(msg);
					}
				}
			})(this), 
			
			// Consume options
			{
				noAck: true, // The broker won’t expect an acknowledgement of messages delivered to this consumer
				exclusive: true,  // The broker won’t let anyone else consume from this queue
			}
		);
		
		
		// Build message
		var str = JSON.stringify({
			"cmd": this.cmd,
			"data": this.data,
		});
		
		
		// Send message. 
		// http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish
		this.channel.publish(this.exchange, '',
			new Buffer( str ),
			{
				expiration: this.message_ttl, // The message will be discarded after given number of milliseconds
				persistent: false, // The message will be deleted when broker restarted
				correlationId: this.correlation_id, 
				replyTo: this.tmp_queue,
			}
		);
	},
	
	
	/**
	 * Call rpc method
	 */
	send: function(){
		
		// http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue
		this.channel.assertQueue(
			'', 
			{
				exclusive: true,  // Scopes the queue to the current connection 
				durable: false,   // The queue deleted when broker restart
				autoDelete: true, // The queue will be deleted when the number of consumers drops to zero 
				arguments: {
					
					// The queue will be destroyed after n millisecond of disuse
					// expires: this.max_response_time + this.message_ttl + 1000, 
					
				},
			}, 
			(function(obj){
				return function(err, res) {
					
					if (err) {
						obj.response.json({
							"code": ProxyRequest.ERROR_AMPQ,
							"message": "Failed to create temporary queue. " + err.message,
						});
						return;
					}
					
					console.log("Temporary queue created: " + res.queue);
					obj.tmp_queue = res.queue;
					obj.amqp_send();
				};
			})(this)
		);
		
		
		// The queue will be destroyed after max_response_time + message_ttl millisecond
		setTimeout((function(obj){
			return function(){
				obj.send_response({
					"code": ProxyRequest.ERROR_AMPQ_TIMEOUT,
					"message": "Timeout error",
				});
				obj.deleteQueue();
			}
		})(this), this.max_response_time + this.message_ttl + 2000);
	},
	
	
});



app.post('/rpc/', upload.array(), function (req, res) {
	
	if (amqp_channel == null){
		res.json({
			"code": ProxyRequest.ERROR_AMPQ_CONNECTION_ERROR,
			"message": "AMQP Channel is not defined",
		});
		return;
	}
	
	if (req.body == undefined || req.body.cmd == undefined){
		res.json({
			"code": ProxyRequest.ERROR_UNKOWN,
			"message": "Body is not defined",
		});
		return;
	}
	
	var body_data = {};
	if (req.body.data != undefined){
		body_data = req.body.data;
	}
	
	var proxy = new ProxyRequest();
	proxy.exchange = AMQP_APP_EXCHANGE;
	proxy.channel = amqp_channel;
	proxy.request = req;
	proxy.response = res;
	proxy.cmd = req.body.cmd;
	proxy.data = body_data;
	
	console.log("Receive: " + req.body.cmd);
	
	proxy.send();
});


// Web Socket
/*
app.ws('/ws', function(ws, req) {
	
	console.log('Connected');
	
	ws.on('message', function(msg) {
		ws.send(msg);
	});
});
*/

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
