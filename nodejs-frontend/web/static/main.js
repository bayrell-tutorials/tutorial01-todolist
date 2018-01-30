var WS_PATH = "ws://10.0.0.11:3000/ws";


var App = Vue.extend({
	
	data: function () {
		
		return {
			ws: null,
			client: null,
			csrf_token: null,
		};
	},
	
	methods: {
		
		start: function (){
			/*
			this.ws = new WebSocket(WS_PATH);
			this.ws.onopen = this.onOpen.bind(this);
			this.ws.onclose = this.onClose.bind(this);
			this.ws.onmessage = this.onMessage.bind(this);
			this.ws.onerror = this.onError.bind(this);
			*/
		},
		
		onOpen: function(){
			console.log('open socket');
		},
		
		onClose: function(event){
			if (event.wasClean) {
				console.log('close socket');
			}
			else{
				console.log('Server disconnected');
			}
			console.log('Code: ' + event.code + ', reason: ' + event.reason);
		},
		
		onError: function(event){
			console.log('Error: ' + event.message);
		},
		
		onMessage: function(event){
			console.log('Receive: ' + event.data);
		},
		
		send: function(cmd, data, success, error){
			
			var post_data = {};
			post_data['csrf'] = this.csrf_token;
			post_data['cmd'] = cmd;
			post_data['data'] = data;
			
			$.ajax({
				url: '/rpc/',
				method: 'post',
				data: post_data,
				cache: false,
				dataType: 'json',
				success: (function(success, error){
					return function(data, textStatus, jqXHR){						
						if (data.error == 1){
							if (success != undefined)
								success(data);
						}
						else{
							if (error != undefined)
								error(data);
						}
					}
				})(success, error),
				error: (function(success, error){
					return function(){
						if (error != undefined)
							error({
								"error": -1,
								"message": 'System error',
							});
					}
				})(success, error),
			});
			
		},
		
		
		sendMessage: function(){
			this.send("ping", "Hello world!!!");
		},
	},
	
});



// Init app
var app = null;

app = new App({
	el: '.app_container',
	data: {
	},
});


// Start app
app.start();
$('.app_container').show();

