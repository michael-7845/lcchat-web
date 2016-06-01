'user strict';
<!-- lang: js -->

AV.initialize($.cookie("appid"), $.cookie("appkey"));

// html element
var searchBtn = $('#search-btn');
var saveBtn = $('#save-btn');
var clearBtn = $('#clear-btn');
var inputC = $('#input-c');
var radioCreate = $('[name=create]:radio');
var divRoom = $('#div-room form');

/////////////////////////////////////////////
// query tool function
function onPass(results) {
  log(results);
  for (index in results) {
    var r = results[index];
    var roomid = r.get("conversationId");
    var caster = r.get("caster").id;
    var createdAt = r.createdAt;
    var keyword = r.get("keyword");
    var s = "live '"+keyword+"' by "+caster+" @"+createdAt+": ";
    showLog('<input type="radio" name="room">'+s, data=roomid, true, divRoom);
  }
}

function onError(error) {
  log(error);
}

function live_by_username(username) {
  var uq = new AV.Query("_User");
  uq.equalTo("username", username);
  
  var lq = new AV.Query("Live");
  lq.matchesQuery("caster", uq);
  
  lq.find().then(onPass).catch(onError);
}

function live_by_sioeyeid(sioeyeid) {
  var uiq = new AV.Query("UserInfo");
  uiq.equalTo("sioeyeId", sioeyeid);
  
  var uq = new AV.Query("_User");
  uq.matchesQuery("sioeyeInfo", uiq);
  
  var lq = new AV.Query("Live");
  lq.matchesQuery("caster", uq);
  
  lq.find().then(onPass).catch(onError);
}

searchBtn.click(() => {
  if(radioCreate.filter(":checked").val() == "username") { //username
    live_by_username(inputC.val());
  } else { //sioeyeid
    live_by_sioeyeid(inputC.val());
  }
});

saveBtn.click(() => {
  var radioRoom = $('[name=room]:radio');
  var checked = radioRoom.filter(":checked");
  if (checked.length == 0) {
    alert("nothing checked");
    return;
  }
  var roomid = checked.parent("p").children("span").text();
  $.cookie("roomid", roomid);
  alert("saving cookie: " + roomid);
});

clearBtn.click(() => {
  divRoom.text("");
});
