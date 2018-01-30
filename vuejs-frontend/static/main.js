var WS_PATH = "http://10.0.0.100:15674/ws";


var App = Vue.extend({
	
	data: function () {
	},
	
	methods: {
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
$('.app_container').show();

