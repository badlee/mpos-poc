console.log('Initializing POC');


// Globals
function getCurrentDate() {
    'use strict';
    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate(),
        hour = now.getHours(),
        minute = now.getMinutes(),
        second = now.getSeconds(),
        dateTime;

    if (month.toString().length === 1) {
        month = '0' + month;
    }
    if (day.toString().length === 1) {
        day = '0' + day;
    }
    if (hour.toString().length === 1) {
        hour = '0' + hour;
    }
    if (minute.toString().length === 1) {
        minute = '0' + minute;
    }
    if (second.toString().length === 1) {
        second = '0' + second;
    }

    dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    return dateTime;
}

var host = "10.51.100.149",
    port = 18002,
    callbackPort = 18004,
    safeBag = 123456,
    transactionId = '1850095146577',
    isConnected = false,
    currentId = 0;

// Write on Screen (LOG)
function writeOnScreen(message) {
    'use strict';
    console.log(message);

    var node = document.getElementById('divResult'),
        newNode = document.createElement('div');

    newNode.appendChild(document.createTextNode(message));
    //newNode.appendChild(document.createTextNode('[' + getCurrentDate() + '] ' + message));

    newNode.appendChild(document.createElement('br'));
    newNode.appendChild(document.createElement('br'));

    node.appendChild(newNode);
}

function writeJson(json) {
    var jsonAddTender = {
        "jsonrpc": "2.0",
        "method": "AddTender",
        "params": {
            "tenderType": "cash",
            //"tenderType": "manual-visa",
            "amount": 35000
        },
        "id": 5
    };
    var node = document.getElementById('divResult');

    node.appendChild(syntaxHighlight(jsonAddTender));
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function setCurrentId(data) {
    'use strict';
    if (data) {
        currentId = data.id;
    }
}

function clearScreen() {
    'use strict';
    document.getElementById('divResult').innerHTML = '';
}

/* ######## CONNECTION - 18002 and 18004 ######## */
function connect() {
    'use strict';
    var successConnect = function (data) {
        writeOnScreen('[SUCCESS] - Connected on ' + host + ':' + port);
        var successCallback = function () {
            writeOnScreen('[SUCCESS] - Connected on ' + host + ':' + callbackPort);

            // Hide Buttons
            document.getElementById('btnConnect').style.display = 'none';
            document.getElementById('btnDisconnect').style.display = '';
            document.getElementById('btnGetStatus').style.display = '';

            isConnected = true;
        };

        var errorCallback = function () {
            writeOnScreen('[ERROR] - Error Connecting to ' + host + ':' + callbackPort);

            document.getElementById('btnConnect').style.display = '';
            document.getElementById('btnDisconnect').style.display = 'none';

            isConnected = false;
        };

        writeJson();

        window.tlantic.plugins.socket.connect(successCallback, errorCallback, host, callbackPort);
    };

    var errorConnect = function (reason) {
        writeOnScreen('[ERROR] - Error trying to connect on ' + host + ':' + port);
    };

    writeOnScreen('[INFO] - Connecting to: ' + host + ':' + port + ' and ' + host + ':' + callbackPort);
    window.tlantic.plugins.socket.connect(successConnect, errorConnect, host, port);
}

function disconnect() {
    'use strict';
    if (isConnected === true) {
        var successDisconnect = function (data) {
            writeOnScreen('[SUCCESS] - Disconnected from ' + host + ':' + port);

            // Disconnecting from 18004
            var successCallback = function (data) {
                writeOnScreen('[SUCCESS] - Disconnected from ' + host + ':' + callbackPort);

                document.getElementById('btnDisconnect').style.display = 'none';
                document.getElementById('btnConnect').style.display = '';
                document.getElementById('btnSendNull').style.display = 'none';
                document.getElementById('btnSendYes').style.display = 'none';
                document.getElementById('btnSendNo').style.display = 'none';
                document.getElementById('btnSignOn').style.display = 'none';
                document.getElementById('btnSignOff').style.display = 'none';
                document.getElementById('btnRecallTransaction').style.display = 'none';
                document.getElementById('btnSendCodigoOperador').style.display = 'none';
                document.getElementById('btnSendCodigoAutorizador').style.display = 'none';
                document.getElementById('btnGetStatus').style.display = 'none';
                document.getElementById('btnFinishTransaction').style.display = 'none';
                document.getElementById('btnPreparePayment').style.display = 'none';
                document.getElementById('btnSendAddTender').style.display = 'none';

                isConnected = false;
            };

            var errorCallback = function (reason) {
                writeOnScreen('[ERROR] - Error during Disconnect from ' + host + ':' + callbackPort);

                document.getElementById('btnConnect').style.display = 'none';
                document.getElementById('btnDisconnect').style.display = '';

                isConnected = true;
            };

            // Disconnecting from 18002
            window.tlantic.plugins.socket.disconnect(successCallback, errorCallback, host, callbackPort);
        };

        var errorDisconnect = function (reason) {
            writeOnScreen('[ERROR] - Error during Disconnect from ' + host + ':' + port);

            document.getElementById('btnConnect').style.display = '';
            document.getElementById('btnDisconnect').style.display = 'none';
        };

        // Disconnecting from 18002
        window.tlantic.plugins.socket.disconnect(successDisconnect, errorDisconnect, host, port);
    }
}

/* ############## 18002 SEND MESSAGES ############## */
function getStatus() {
    'use strict';
    var jsonGetStatus = {
        "jsonrpc": "2.0",
        "method": "GetStatus",
        "id": parseInt(currentId + 1)
    }, successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Status was Get: ' + data);
    }, errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error Getting Status: ' + reason);
    };

    writeOnScreen('[INFO] - Trying to Get Status with ID: ' + (parseInt(currentId) + 1));
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, port, jsonGetStatus);
}

function signOn() {
    'use strict';
    var jsonSignon = {
        "jsonrpc": "2.0",
        "method": "SignOn",
        "name": "Maria",
        "password": "123456",
        "trainingMode": "false",
        "id": (parseInt(currentId) + 1)
    },
        successCallback = function (data) {
            writeOnScreen('[SUCCESS] - Successfuly Signed On:' + data);
            document.getElementById('btnSignon').style.display = 'none';
        },
        errorCallback = function (reason) {
            writeOnScreen('[ERROR] - Error during Sign On: ' + reason);
        };

    writeOnScreen('[INFO] - Trying to Sign On with ID: ' + (parseInt(currentId) + 1));
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, port, jsonSignon);
}

function signOff() {
    'use strict';
    var jsonSignoff = {
        "jsonrpc": "2.0",
        "method": "SignOff",
        "id": (parseInt(currentId) + 1)
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Successfuly Signed Off:' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during Sign Off: ' + reason);
    };

    writeOnScreen('[INFO] - Trying to Sign Off with ID: ' + (parseInt(currentId) + 1));
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, port, jsonSignoff);
}

function recallTransaction() {
    'use strict';
    var jsonRecallTransaction = {
        "jsonrpc": "2.0",
        "method": "RecallTransaction",
        "params": {
            "transactionId": transactionId
        },
        "id": (parseInt(currentId) + 1)
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Successfuly Recall Transaction:' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during Recall Transaction: ' + reason);
    };

    writeOnScreen('[INFO] - Trying to Recall Transaction with ID: ' + (parseInt(currentId) + 1));
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, port, jsonRecallTransaction);
}

function addTender() {
    'use strict';

    var jsonAddTender = {
        "jsonrpc": "2.0",
        "method": "AddTender",
        "params": {
            "tenderType": "cash",
            //"tenderType": "manual-visa",
            "amount": 35000
        },
        "id": (parseInt(currentId) + 1)
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Successfuly Add Tender:' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during Add Tender: ' + reason);
    };

    writeOnScreen('[INFO] - Trying to Add Tender with ID: ' + (parseInt(currentId) + 1));
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, port, jsonAddTender);
}

function preparePayment() {
    'use strict';

    var jsonPreparePayment = {
        'jsonrpc': '2.0',
        'method': 'PreparePayment',
        'id': 3
    };

    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Successfuly Prepare Payment:' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during Prepare Payment: ' + reason);
    };

    writeOnScreen('[INFO] - Trying to Prepare Payment with ID: ' + (parseInt(currentId) + 1));
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, port, jsonPreparePayment);
}

function finishTransaction() {
    'use strict';
    var jsonFinishTransaction = {
        "jsonrpc": "2.0",
        "method": "TransactionFinished",
        "id": (parseInt(currentId) + 1)
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Successfuly Finished the Transaction:' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during Finish Transaction: ' + reason);
    };

    writeOnScreen('[INFO] - Trying to Finish Transaction with ID: ' + (parseInt(currentId) + 1));
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, port, jsonFinishTransaction);
}

/* ############## 18004 SEND MESSAGES ############## */
function sendPreparePayment() {
    'use strict';
    var jsonPreparePayment = {
        "jsonrpc": "2.0",
        "method": "PreparePayment",
        "id": currentId
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - PreparePayment was sent :' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during PreparePayment send: ' + reason);
    };

    writeOnScreen('[INFO] - Sending PreparePayment with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonPreparePayment);
}


function sendSafeBag() {
    'use strict';
    var jsonSafeBag = {
        "jsonrpc": "2.0",
        "result": {
            "response": +safeBag,
            "entryMethod": "attendant keyed",
            "result": "IFC_OK"
        },
        "id": +currentId
    }, errorCallback, successCallback;

    successCallback = function (data) {
        writeOnScreen('[SUCCESS] - SafeBag was sent :' + data);
    };

    errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during SafeBag send: ' + reason);
    };

    writeOnScreen('[INFO] - Sending SafeBag: ' + safeBag + ' with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonSafeBag);
}


function sendPassword() {
    'use strict';
    var jsonPass = {
        "jsonrpc": "2.0",
        "result": {
            "response": 123789,
            "entryMethod": "attendant keyed",
            "result": "IFC_OK"
        },
        "id": +currentId
    }, successCallback, errorCallback;

    successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Password was sent :' + data);
    };

    errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during Password send: ' + reason);
    };

    writeOnScreen('[INFO] - Sending Password with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonPass);
}

function sendCodigoOperador() {
    'use strict';
    var jsonCodigoOperador = {
        "jsonrpc": "2.0",
        "result": {
            "response": "80830",
            "mrsData": "null",
            "entryMethod": "attendant keyed",
            "result": "IFC_OK"
        },
        "id": currentId
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Codigo Operador was Sent');
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Codigo Operador was not Sent');
    };

    writeOnScreen('[INFO] - Trying to send Codigo Operador with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonCodigoOperador);
}

function sendCodigoAutorizador() {
    'use strict';
    var jsonCodigoOperador = {
        "jsonrpc": "2.0",
        "result": {
            "response": "80830",
            "mrsData": "null",
            "entryMethod": "attendant keyed",
            "result": "IFC_OK"
        },
        "id": currentId
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Codigo Operador was Sent');
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Codigo Operador was not Sent');
    };

    writeOnScreen('[INFO] - Trying to send Codigo Operador with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonCodigoOperador);
}


function sendNull() {
    'use strict';
    var jsonNull = {
        "jsonrpc": "2.0",
        "result": {
            "result": "IFC_OK"
        },
        "id": +currentId
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - Null was sent :' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during Null send: ' + reason);
    };

    writeOnScreen('[INFO] - Sending Null with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonNull);
}

function sendYes() {
    'use strict';
    var jsonYes = {
        "error": null,
        "id": currentId,
        "jsonrpc": "2.0",
        "result": {
            "entryMethod": "",
            "failureReason": "",
            "posStatus": null,
            "response": "Sim",
            "result": "IFC_OK"
        }
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - YES was sent:' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during YES send: ' + reason);
    };

    writeOnScreen('[INFO] - Sending YES with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonYes);
}

function sendNo() {
    'use strict';
    var jsonNo = {
        "error": null,
        "id": currentId,
        "jsonrpc": "2.0",
        "result": {
            "entryMethod": "",
            "failureReason": "",
            "posStatus": null,
            "response": "Nao",
            "result": "IFC_OK"
        }
    };
    var successCallback = function (data) {
        writeOnScreen('[SUCCESS] - No was sent :' + data);
    };

    var errorCallback = function (reason) {
        writeOnScreen('[ERROR] - Error during No send: ' + reason);
    };

    writeOnScreen('[INFO] - Sending NO with ID: ' + currentId);
    window.tlantic.plugins.socket.send(successCallback, errorCallback, host, callbackPort, jsonNo);
}

/* ########### Treatment for UNIFO Requests ########### */
function treatMessage(msg) {
    'use strict';
    writeOnScreen('[INFO] - Treating Message <msg>' + msg + '</msg>');

    if (msg === 'OperatorSignedOff') {
        writeOnScreen('[INFO] - Waiting for Sign On');
        $('#btnSignOn').show();
        $('#btnSignOff').hide();
        $('#btnSendCodigoOperador').hide();
        $('#btnSendCodigoAutorizador').hide();
        $('#btnRecallTransaction').hide();
        $('#btnSendPassword').hide();
        $('#btnFinishTransaction').hide();
        $('btnPreparePayment').hide();
        $('#btnSendAddTender').hide();
    } else if (msg === 'OperatorSignedOn') {
        writeOnScreen('[INFO] - The user are Signed On');
        $('#btnRecallTransaction').show();
        $('#btnSignOff').show();
        $('#btnSendCodigoAutorizador').show();
        $('#btnSendCodigoAutorizador').hide();
        $('#btnSendCodigoOperador').hide();
        $('#btnSendPassword').hide();
    } else if (msg === 'Codigo Operador< ') {
        writeOnScreen('[INFO] - Waiting for Código Operador');
        $('#btnSendCodigoOperador').show();
        $('#btnSendCodigoAutorizador').hide();
        $('#btnSignOn').hide();
        $('#btnSignOff').hide();
        $('#btnSendPassword').hide();
    } else if (msg === 'Codigo Autorizador< ') {
        writeOnScreen('[INFO] - Waiting for Código Autorizador');
        $('#btnSendCodigoAutorizador').show();
        $('#btnSignOn').hide();
        $('#btnSendPassword').hide();
        $('#btnSendCodigoOperador').hide();
    } else if (msg === 'Password') {
        writeOnScreen('[INFO] - Waiting for Password');
        $('#btnSignOn').hide();
        $('#btnSendCodigoAutorizador').hide();
        $('#btnSendCodigoOperador').hide();
        $('#btnRecallTransaction').hide();
        $('#btnSendPassword').show();
    } else if (msg === 'TransactionActive') {
        writeOnScreen('[INFO] - Waiting for Add Tender');
        $('#btnSendAddTender').show();
        $('#btnSignOff').show();
        $('#btnRecallTransaction').hide();
        $('#btnFinishTransaction').show();
        $('#btnPreparePayment').show();
    } else if (msg === 'TransactionFinished') {
        alert('Transaction Finished with Success!');
        writeOnScreen('[SUCCESS] - Transaction Finished with Success');
        $('#btnSendAddTender').hide();
        $('#btnPreparePayment').show();
    } else if (msg === 'PreparePayment') {
        sendPreparePayment();
    } else if (msg === 'Numero SafeBag ') {
        sendSafeBag();
    } else if (msg === 'POS OFFLINE prima enter') {
        sendYes();
    } else if (msg === 'IngelinkP: Falha na carga da DLL') {
        sendYes();
    } else if (msg === 'Unifo II Vrs.1.0.3.0') {
        sendNo();
    } else if (msg === 'Transaccao nao encontrada') {
        sendYes();
    } else if (msg === 'Saida Operador') {
        sendYes();
    } else if (msg === 'Transaccao recuperada anteriormente') {
        sendYes();
    } else if (msg === 'Utilizar o saldo?') {
        sendYes();
    } else if (msg === 'OK') {
        writeOnScreen('[INFO] - Returned OK');
    } else {
        sendYes();
    }
}

function treatReturn(ev) {
    'use strict';
    if (ev.metadata) {
        var jsonResp = ev.metadata.data,
            msg;

        writeOnScreen('JSON Received from UNIFO: \n' + JSON.stringify(ev.metadata.data, undefined, 4));

        if (jsonResp) {
            setCurrentId(jsonResp);

            // RESULT - STATUS
            if (jsonResp.result) {
                if (jsonResp.result.posStatus) {
                    if (jsonResp.result.posStatus.status) {
                        treatMessage(jsonResp.result.posStatus.status);
                    } else if (jsonResp.result.result) {
                        treatMessage(jsonResp.result.result);
                    }
                }
                // METHOD - MESSAGE
            } else if (jsonResp.method) {
                writeOnScreen('[INFO] - Method found: ' + jsonResp.method.toString());
                if (jsonResp.params) {
                    msg = 'NULL';

                    if (jsonResp.params.inputDescriptor) {
                        msg = jsonResp.params.inputDescriptor.message;
                    } else if (jsonResp.params.confirmationDescriptor) {
                        msg = jsonResp.params.confirmationDescriptor.message;
                    } else if (jsonResp.params.message) {
                        msg = jsonResp.params.message;
                    }

                    treatMessage(msg);
                }
            }
        }
    }
}

document.addEventListener('SOCKET_RECEIVE_DATA_HOOK', function (ev) {
    'use strict';
    if (ev === undefined) {
        writeOnScreen('[ERROR] - Received a UNDEFINED objecet @ EventListener >> data: ' + ev);
        writeOnScreen('[ERROR] - Received a UNDEFINED objecet @ EventListener >> metadata?: ' + ev.metadata);
        writeOnScreen('[ERROR] - Received a UNDEFINED objecet @ EventListener >> metadata.data?: ' + ev.metadata.data);
        return false;
    }

    treatReturn(ev);
});