var NodeHelper = require("node_helper");
const WebSocket = require('ws');

module.exports = NodeHelper.create({


	// ws_action: function(){
	// 	//ws = new ReconnectingWebSocket("ws://192.168.31.232:16666/");
	// 	ws = new ReconnectingWebSocket("ws://192.168.31.232:16666/");
	// 	var that = this;
	// 	ws.onopen = function(){
	// 		ws.send("START");
	// 		console.log("[DB] WebSocket Opened.");
	// 	};
	// 	ws.onmessage = function(event){
	// 		console.log("[DB] Got message: ", event.data);//字符串拼接
	// 		if(event.data.slice(0,9) == "IS_A_FACE"){
	// 			that.sendSocketNotification("IS_A_FACE", payload=event.data.slice(10));
	// 		}
	// 		else if(event.data == "RUNING"){
	// 			that.sendSocketNotification("RUNING");
	// 		}
	// 	};
	// 	ws.onclose = function(){
	// 		console.log('[DB] Websocket Closed.');
	// 		that.sendSocketNotification("CLOSE");
	// 	};
	// 	ws.onerror = function(){
	// 		console.log('[DB] Websocket Error.');
	// 	}
	// },


	ws_action: function() {
		ws = new WebSocket('ws://192.168.31.232:16666/', {
			perMessageDeflate: false
		});
		var that = this;
		ws.on('open', function open() {
			ws.send("START");
			console.log("[DB] WebSocket Opened.");
		});
		ws.on('message', function incoming(data) {
			console.log("[DB] Got message: ", data);//字符串拼接
			if(data.slice(0,9) == "IS_A_FACE"){
				that.sendSocketNotification("IS_A_FACE", data.slice(10));
			}
			else if(data == "RUNING"){
				that.sendSocketNotification("RUNING");
			}
		});
		ws.on('close', function close() {
			console.log('[DB] Websocket Closed. try to reconnect');
			that.sendSocketNotification("CLOSE");
			setTimeout(function() {
				that.ws_action();
			}, 1000);
		});
		ws.on('error', function error() {
			console.log('[DB] Websocket Error. try to reconnect');
			ws.close();
		});
	},


	socketNotificationReceived: function(notification, payload) {
		if(notification == "SHOWED") {
			//收到暂时完成
			console.log("try to send start");
			ws.send("START");//发送socket让识别重新开始
		}
		else if(notification == "READY") {
			this.ws_action();
			console.log("[DB] READY");
		}
	},
});
