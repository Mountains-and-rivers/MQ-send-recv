var amqp   = require('amqp');

var serviceName = 'server_test';

var mqOption = {
    host     : '172.27.8.113',
    login    : serviceName,
    password : "123456"
};
var sendExchage;
var recvExchage;

var connect = amqp.createConnection(mqOption);

connect.on('ready', function() {
    console.log((new Date()) + ' [MQHD]Connect to MQ for %s is ready: %s', serviceName, JSON.stringify(mqOption));

    sendExchage = connect.exchange('mq_direct', {type: 'direct', durable: false, autoDelete: true});
    //recvExchage = connect.exchange('mq_reply', {type: 'direct', durable: false, autoDelete: true});


    connect.queue(serviceName, {durable: false, exclusive: false}, function (q1) {
        console.log("[MQHD]Queue " + serviceName + " for request is open.");
        q1.bind('mq_direct', serviceName);
        q1.subscribe(function(message, header, deliveryInfo) {
            console.log((new Date()) + ' Received mq message from %s: %s', deliveryInfo.appId, message.data);
            console.log('  deliveryInfo: ' + JSON.stringify(deliveryInfo));
            sendMsg('mq_test', 'recv success. i am server_test', mqOption);
        });
    });
});

connect.on('error', function (err) {
    console.error("[MQHD]Failed to connect MQ for "+serviceName+' with '+err+', mq option: '+JSON.stringify(mqOption));
});
connect.on('end', function (err) {
    console.warn("[MQHD]received end event.");
});
connect.on('close', function (err) {
    console.warn("[MQHD]received close event.");
});


function sendMsg(pkey, msg, option) {
    if(sendExchage)
    {
        try {
            sendExchage.publish(pkey, msg, option);
            console.log((new Date()) + ' [MQHD]Send message to %s success by %s.', pkey, sendExchage.name);
            console.log('  message: %s', msg);
            console.log('  key/option = %s/%s.', pkey, JSON.stringify(option));
        }
        catch(err) {
            console.error((new Date()) + ' [MQHD]Send message to %s failed with error: %s', pkey, err);
        }
    } else {
        console.warn("[MQHD]Exchange is null or undefined!");
    }
}