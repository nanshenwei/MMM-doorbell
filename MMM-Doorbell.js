
Module.register("MMM-Doorbell",{
	defaults: {
		is_img: false,
		file_path: "1.png",
		text: "DOORBELL IS READY."
	},
	getDom: function() {
		var wrapper = document.createElement("div");
		if(this.config.is_img){
			var img = document.createElement("img");
			img.src = "modules/MMM-Doorbell/"+this.config.file_path;
			img.width = "640";
			wrapper.appendChild(img);
		}
		else{
			wrapper.innerHTML = this.config.text;
		}
		return wrapper;
	},
	start: function() {
		this.sendSocketNotification("READY");
	},

	// getScripts: function() {
	// 	return [
	// 		'reconnecting-websocket.js', 
	// 	]
	// },
	// notificationReceived: function(notification, payload, sender) {
		
	// },

	show_runing(){
		this.config.text = "DOORBELL IS READY.";
		this.updateDom(500);
	},
	socketNotificationReceived: function(notification, payload){
		if(notification == "IS_A_FACE"){
			var that = this;
			//保存照片路径
			this.config.file_path = payload;
			//更新照片
			this.config.is_img = true;
			//展示照片
			this.updateDom(500);
			//展示照片一段时间
			setTimeout(function() {
				//发送helper展示完成
				that.config.is_img = false;
				that.sendSocketNotification("SHOWED");
			}, 5000);
		}
		else if(notification == "RUNING"){
			this.show_runing();
		}
		else if(notification == "CLOSE"){
			//展示连接断开，模块停止工作
			this.config.text = "DISCONNECTED, TRY TO RECONNECT. PLEASE CHECK.";
			this.updateDom(500);
		}
	}

});
