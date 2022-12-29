/*
 * Name          : wsclient.js
 * @author       : CLEMENT DUAN
 */
//Global Config
// Forward json message to client's callback
// var msg = '{"cmd":"connected"}';
// var msg = '{"cmd":"disconnected"}';
// var msg = '{"cmd":"updatepos", "pos":{"x":1.2, "y":0.5, "z":0.8}, "rotate":{"x":1.2, "y":0.5, "z":0.8}}';

var SocketClient = (function(ws_url, msg_callback)
{
    var socket_client;
    var status_connected = false;

    if ("WebSocket" in window) {
        socket_client = new ReconnectingWebSocket(ws_url);
        socket_client.onopen = callback_connect;
        socket_client.onmessage = callback_message;
        socket_client.onclose = callback_close;
    } else {
        alert("Error: No WebSocket found!");
    }

    function callback_connect() {
        console.log('server connected!');
        status_connected = true;

        var msg = '{"cmd":"connected"}';
        msg_callback(msg);
    }

    function callback_close() {
        console.log('server connection closed!');
        status_connected = false;

        var msg = '{"cmd":"disconnected"}';
        msg_callback(msg);
    }

    function callback_message(msg) {
        var received_msg = msg.data;
        // console.log(received_msg);
        msg_callback(received_msg);
    }

    function sendMsg(json_msg) {
        socket_client.send(json_msg);
    }

    /******************************************************
     * Public methods
     *****************************************************/
    return {
        // 需要外部访问的函数，定义在下方，相当于声明一下外部可调用
        sendMsg: sendMsg,
        isConnected: function (){return status_connected;}
	};
});
