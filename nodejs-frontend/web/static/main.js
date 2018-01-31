var WS_PATH = "ws://10.0.0.11:3000/ws";
var PLEASE_WAIT_MESSAGE = "Идет обработка запроса...";


function htmlEscape(s){ 
	return (new String(s)).replace(/[&<>]/g, {
		"&": "&amp;",
		"<":"&lt;",
		">": "&gt;",
		"'": "&apos;",
		'"': "&quot;",
	}); 
}


var App = Vue.extend({
	
	data: function () {
		
		return {
			items: [],
		};
	},
	
	methods: {
		
		/**
		 * Deep clone object
		 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
		 */
		deepClone: function(oldObject){
			var newObject = jQuery.extend(true, {}, oldObject);
			return newObject;
		},
		
		
		getPosById: function(id){
			for (var i=0; i<this.items.length; i++){
				if (this.items[i].id == id)
					return i;
			}
			return -1;
		},
		
		
		getById: function(id){
			for (var i=0; i<this.items.length; i++){
				if (this.items[i].id == id)
					return this.items[i];
			}
			return null;
		},
		
		
		deleteItemById: function(id){
			var pos = this.getPosById(id);
			if (pos == -1)
				return;
			this.items.splice(pos, 1);
		},
		
		
		editItemById: function(id, name){
			var pos = this.getPosById(id);
			if (pos == -1)
				return;
			this.items[pos]['name'] = name;
		},
		
		
		start: function (){
			this.updateList();
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
						if (data.code == 1){
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
			//this.send("ping", "Hello world!!!");
		},
		
		
		updateList: function(){
			this.send(
				"find", 
				{}, 
				this.updateListSuccess.bind(this)
			)
		},
		
		updateListSuccess: function(data){
			this.items = data.items;
			//console.log(data);
		},
		
		
		
		showAdd: function(){
			BootstrapDialog.show({
				title: 'Add row',
				message: $(
					'<input type="text" class="form-control" name="name" placeholder="Title"></input>' +
					'<div class="form-result"></div>',
				),
				onshow: function(dialog) {
					//dialog.getButton('button-c').disable();
				},
				buttons: [
					{
						label: 'Add record',
						cssClass: 'btn-success',
						action: function(dialog) {
							
							var name = dialog.$modalBody.find('input[name=name]').val()
							var $result = dialog.$modalBody.find('.form-result');
							$result.removeClass('form-result--error');
							$result.removeClass('form-result--success');
							$result.html(PLEASE_WAIT_MESSAGE);
							
							app.send(
								"add", 
								{
									'name': name,
								}, 
								
								// Success
								(function(dialog){
									return function(data){
										dialog.close();
										app.items.push(data.item);
									}
								})(dialog),
								
								// Error
								(function(dialog){
									return function(data){
										var $result = dialog.$modalBody.find('.form-result');
										$result.addClass('form-result--error');
										$result.html(data.message);
									}
								})(dialog),
								
							);
							
						}
					},
					{
						label: 'Close',
						cssClass: 'btn-default',
						action: function(dialog) {
							dialog.close();
						}
					}
				]
			});
		},
		
		
		
		showDelete: function(id){
			
			var item = this.getById(id);
			if (item == null)
				return ;
			
			BootstrapDialog.show({
				title: 'Delete row',
				message: $(
					'<div>Do you realy want to delete "' + item.name + '"?</div>' +
					'<div class="form-result"></div>',
				),
				onshow: function(dialog) {
					//dialog.getButton('button-c').disable();
				},
				buttons: [
					{
						label: 'Delete record',
						cssClass: 'btn-danger',
						action: function(dialog) {
							
							app.send(
								"delete", 
								{
									'id': item.id,
								}, 
								
								// Success
								(function(dialog){
									return function(data){
										dialog.close();
										app.deleteItemById(item.id);
									}
								})(dialog),
								
								// Error
								(function(dialog){
									return function(data){
										var $result = dialog.$modalBody.find('.form-result');
										$result.addClass('form-result--error');
										$result.html(data.message);
									}
								})(dialog),
								
							);
							
						}
					},
					{
						label: 'Close',
						cssClass: 'btn-default',
						action: function(dialog) {
							dialog.close();
						}
					}
				]
			});
		},
		
		
		showEdit: function(id){
			
			var item = this.getById(id);
			if (item == null)
				return ;
			
			BootstrapDialog.show({
				title: 'Edit row',
				message: $(
					'<input type="text" class="form-control" name="name" placeholder="Title" value="'+
						htmlEscape(item.name) + 
					'"></input>' +
					'<div class="form-result"></div>',
				),
				onshow: function(dialog) {
					//dialog.getButton('button-c').disable();
				},
				buttons: [
					{
						label: 'Edit record',
						cssClass: 'btn-success',
						action: function(dialog) {
							
							var name = dialog.$modalBody.find('input[name=name]').val()
							var $result = dialog.$modalBody.find('.form-result');
							$result.removeClass('form-result--error');
							$result.removeClass('form-result--success');
							$result.html(PLEASE_WAIT_MESSAGE);
							
							app.send(
								"edit", 
								{
									'id': item.id,
									'name': name,
								}, 
								
								// Success
								(function(dialog){
									return function(data){
										dialog.close();
										app.editItemById(item.id, data.item.name);
									}
								})(dialog),
								
								// Error
								(function(dialog){
									return function(data){
										var $result = dialog.$modalBody.find('.form-result');
										$result.addClass('form-result--error');
										$result.html(data.message);
									}
								})(dialog),
								
							);
							
						}
					},
					{
						label: 'Close',
						cssClass: 'btn-default',
						action: function(dialog) {
							dialog.close();
						}
					}
				]
			});
			
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
window['app'] = app;


// Start app
app.start();
$('.app_container').show();

