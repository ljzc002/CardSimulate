/**
 * Created by lz on 2019/2/28.
 */
var socket;//��React�͵ĵ�ҳӦ���У�����������������ҳ���ȫ�ֶ���Ҳ�����Ǵ�һ����ʵ��������ʵ����
// ��iframe�ͳ����У�ÿ������ҳ����ӵ��һ����Ϊȫ�ֱ�����
function openSocket(ip,userId,passWord) {
    if(typeof(WebSocket) == "undefined") {
        console.log("�����������֧��WebSocket");
    }else {
        console.log("���������֧��WebSocket");
    }
    var socketUrl="ws://ip:2121/im/";
    //socketUrl=socketUrl.replace("https","ws").replace("http","ws");
    console.log(socketUrl)
    socket = new WebSocket(socketUrl);
    //���¼�
    socket.onopen = function() {
        console.log("websocket�Ѵ�");
        var msg={userId:userId,passWord:passWord}
        socket.send("[setUser]" + JSON.stringify(msg));//�ں������һ���û�
    };
    //�����Ϣ�¼�
    socket.onmessage = function(msg) {
        console.log(msg.data);
        //������Ϣ����    ��ʼ����ǰ�˴����߼�
    };
    //�ر��¼�
    socket.onclose = function() {
        console.log("websocket�ѹر�");
    };
    //�����˴����¼�
    socket.onerror = function() {
        console.log("websocket�����˴���");
    }
}
function sendMessage() {
    if(typeof(WebSocket) == "undefined") {
        console.log("�����������֧��WebSocket");
    }else {
        console.log("���������֧��WebSocket");
        console.log('[{"toUserId":"'+$("#toUserId").val()+'","contentText":"'+$("#contentText").val()+'"}]');
        socket.send('[{"toUserId":"'+$("#toUserId").val()+'","contentText":"'+$("#contentText").val()+'"}]');
    }
}