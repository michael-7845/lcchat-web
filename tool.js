'user strict';
<!-- lang: js -->

///////////////////////////////////////
// debug
var log = _.bind(console.log, console);

///////////////////////////////////////
// setting
$("#switch-btn").click(() => {
  $.cookie("appid",$("#input-appid").val());
  $.cookie("appkey",$("#input-appkey").val());
  AV.initialize($.cookie("appid"), $.cookie("appkey"));
  
  alert("LeanCloud SDK initialized now. To active new setting, connect the server again!");
});

$("#ut03-btn").click(() => {
  alert("Not provide ut03 default setting now. Input appid/appkey and click switch.");
});

$("#other-btn").click(() => {
  alert("No other defined environment now");
});

$("#ut03-btn").click(); //缺省行为: 提醒填写appid和appkey

/*************************************
* tool function
*************************************/

/////////////////////////////////////////////////
// message
function encodeHTML(source) {
  return String(source)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g,'&#92;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function formatTime(time) {
  var date = new Date(time);
  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var currentDate = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return date.getFullYear() + '-' + month + '-' + currentDate + ' ' + hh + ':' + mm + ':' + ss;
}

function showLog(msg, data="", isBefore=true, parent=printWall) {
  var message;
  if (data) {
    msg = msg + '<span class="strong">' + data + '</span>';
  }
  var p = document.createElement('p');
  p.innerHTML = msg; 
  if (isBefore) {
    parent.append(p);
  } else {
    parent.prepend(p);
  }
}
