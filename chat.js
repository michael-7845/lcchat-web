'user strict';
<!-- lang: js -->

var roomId; // room id
var clientIds = []; // client id
var clients = []; // Client object
var realtimes = []; // realtime object
var messageIterator;

// html element
var getBtn = $('#get-btn');
var userBtn = $('#user-btn');
var openBtn = $('#open-btn');
var joinBtn = $('#join-btn');
var exitBtn = $('#exit-btn');
var addBtn = $('#add-btn');
var removeBtn = $('#remove-btn');
var sendBtn = $('#send-btn');
var clearprintBtn = $('#clearprint-btn');
var reportBtn = $('#report-btn');
var clearreportBtn = $('#clearreport-btn');

var radioUser = $('[name=user]:radio');

var inputRoom = $('#input-roomid');
var inputName = $('#input-name');
var inputAdduser = $('#input-adduser');
var inputSend = $('#input-send');
var inputNumber = $('#input2-number');
var inputInterval = $('#input2-interval');

var printWall = $('#print-wall');
var reportArea = $('#report-area');

/////////////////////////////////////////////////
// event function

// room id
getBtn.click(() => {
  if (! $.cookie("roomid")) {
    alert("no roomid cookie");
    return;
  }
  
  inputRoom.val($.cookie("roomid"));
});

// user oid
function onPass(results) {
  var res = results.map((x) => (x.id));
  inputName.val(res.join(","));
}

function onError(error) {
  log(error);
}

function uid_by_username(usernames) {
  var uq = new AV.Query("_User");
  uq.containedIn("username", usernames.split(","));
  uq.find().then(onPass).catch(onError);
}

function uid_by_sioeyeid(sioeyeids) {
  var uiq = new AV.Query("UserInfo");
  uiq.containedIn("sioeyeId", sioeyeids.split(","));
  var uq = new AV.Query("_User");
  uq.matchesQuery("sioeyeInfo", uiq);
  uq.find().then(onPass).catch(onError);
}

function getUser() {
  if(radioUser.filter(":checked").val() == "username") { //username
    uid_by_username(inputName.val());
  } else { //sioeyeid
    uid_by_sioeyeid(inputName.val());
  }
}

userBtn.click(() => {
  getUser();
});

// connect
function validateUser(uidsArr) {
  var uq = new AV.Query("_User");
  uq.containedIn("objectId", uidsArr);
  uq.find().then((results) => {
    log("in validateUser()", results);
    if (results.length != uidsArr.length) {
      alert("validating user information failed!");
      return;
    };
    log("in validateUser() 2");
  }).catch((error) => {
    alert("validating user information error!", error);
  });
}

openBtn.click(() => {
  
  roomId = inputRoom.val().trim();
  var clientIdField = inputName.val().trim();
  if ((roomId.length==0) || (clientIdField.length==0)) {
    alert("no roomId or clientId!");
    return;
  }
  
  clientIds = clientIdField.split(',');
  clients = []; 
  realtimes = []; 
  validateUser(clientIds);
  
  //log($.cookie("appid"));
  
  _.map(clientIds, (value) => {
    var realtime = AV.realtime({
      appId: 'usYhGBBKDMiypaKFV8fc3kE4', //$.cookie("appid"),
      clientId: value.trim()
    });
    if (!realtime) {
      alert("connecting to the server failed!");
      return;
    }
    realtimes.push(realtime);
    
    showLog(value + " is connecting the service, please wait ...");
    var client = new Client(realtime, roomId);
    clients.push(client);
  });
  
  log(realtimes);
  log(clients);
  
});

joinBtn.click(() => {
  _.map(clients, (value) => {
    value.join();
  });
});

exitBtn.click(() => {
  _.map(clients, (value) => {
    value.leave();
  });
});

////////////////////////////////////////
// messaging

sendBtn.click(() => {
  _.map(clients, (value) => {
    var message = inputSend.val().trim();
    var number = + inputNumber.val();
    var interval = + inputInterval.val();
    var send = _.bind(value.send, value);
    for (i=0;i<number;i++) {
      _.delay(send, interval*i, message);
    };
  });
});

clearprintBtn.click(() => {
  printWall.text("");
});

////////////////////////////////////////
// report

function ajaxLog(s) {
  reportArea.val(reportArea.val() + '\n' + s);
}

reportBtn.click(() => {
  ajaxLog(formatTime(new Date().getTime()) + " >>>");
  ajaxLog("---------------------------------");
  ajaxLog("per client statistics");
  
  var keeper = [];
  _.map(clients, (value) => {
    var r = value.report();
    ajaxLog(r.c + "[" + r.n + "]: send ave. - " + r.sa + " ms, rec ave. - " + r.ra + " ms");
    keeper.push(r);
  });
  
  var i, send, rec, num;
  for (var i=0, send=0, rec=0, num=0; i<keeper.length; i++) {
    send += keeper[i].st;
    rec += keeper[i].rt;
    num += keeper[i].n;
  }
  
  ajaxLog("---------------------------------");
  ajaxLog("send ave. - " + (send/num) + " ms, rec ave. - " + (rec/num) + " ms");
  ajaxLog("");
  
});

clearreportBtn.click(() => {
  reportArea.val('');
});
