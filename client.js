'user strict';
<!-- lang: js -->

var onceMembers = _.once( function(data) {showLog('members in room: ', data); });

function Client(realtimeObj, roomId) {
  this.realtimeObj = realtimeObj;
  this.roomId = roomId;
  this.clientId = this.realtimeObj.clientId;
  this.msgs = {}; //help:"to keep time information of message sending and receiving"
  // this.room; // in onOpen()
  // this.members; // in onOpen()
  
  this.onOpen = () => {
    this.realtimeObj.on("open", () => { 
    
      this.realtimeObj.conv(this.roomId, (obj) => {
        if (obj) {
          this.room = obj;
          log('clientId: ', this.clientId);
          log(this.clientId, '- realtimeObj: ', this.realtimeObj);
          log(this.clientId, '- room: ', this.room);
          
          this.realtimeObj.on("reuse", (data) => {
            log("on('reuse'): ", data);
          });
          
          //////////////////////////////////
          // todo: update PrintWall: 连接成功
          showLog(this.clientId + " connection to service is ready!");
          this.list();
          this.receipt();
          
        } else {
          log('room does not exist: ', this.roomId);
          alert('room does not exist: ', this.roomId);
        }
      });
      
    }); // on("open", ())
  }; // this.onOpen assignment
  
  this.onMember = () => {
  
    this.realtimeObj.on("membersjoined", (data) => { 
      log(this.clientId, '- a user joined: ', data);
    }); // on("membersjoined", ())
    
    this.realtimeObj.on("membersleft", (data) => { 
      log(this.clientId, '- a user left: ', data);
    }); // on("membersleft", ())
    
    this.realtimeObj.on('invited', (data) => {
      log(this.clientId, '- me joined: ', data);
    }); // on("invited", ())
    
    this.realtimeObj.on('kicked', (data) => {
      log(this.clientId, '- me left: ', data);
    }); // on("kicked", ())
    
    /**/
    this.realtimeObj.on('message', (data) => { // 当前用户所在的组，有消息时触发
      log(this.clientId, '- message: ', data);
    }); // on("message", ())
    
    
  }; // this.onJoin assignment
  
  this.onOpen();
  this.onMember();
  
  ///////////////////////////////////////////////
  // realtime object method
  
  ///////////////////////////////////////////////
  // Client.whichRoom()
  this.whichRoom = () => {
    this.realtimeObj.query((data) => {
      this.members = data;
      log(this.clientId, '- in room: ', data); 
    });
  };
  
  ///////////////////////////////////////////////
  // room method
  
  ///////////////////////////////////////////////
  // Client.addMember(member);
  this.addMember = (member) => {
    this.room.add(member, (data) => {
      log(this.clientId, '- in addMember(): add a user: ', data);
    });
  };
  
  /////////////////////////////////////////
  // Client.removeMember(member)
  this.removeMember = (member) => {
    this.room.remove(member, (data) => {
      log(this.clientId, '- in removeMember(): remove a user: ', data);
    });
  };
  
  /////////////////////////////////////////
  // Client.join()
  this.join = () => {
    // 判断服务器是否存在这个 room
    if (this.room) {
        this.room.join( () => {
          log(this.clientId, ' - in join(): joined.');
        });
    } else {
      log(this.clientId, ' - in join(): conversation does not exist.');
    }
  };
  
  /////////////////////////////////////////
  // Client.leave()
  this.leave = () => {
    // 判断服务器是否存在这个 room
    if (this.room) {
        this.room.leave( () => {
          log(this.clientId, 'in leave(): left.');
        });
    } else {
      log(this.clientId, ' - in leave(): conversation does not exist.');
    }
  };
  
  ////////////////////////////////////
  // Client.list() 
  this.list = () => {
    this.room.list( (data) => {
      log(this.clientId, ' - members in room: ', data); 
      
      //////////////////////////////
      // todo: update PrintWall: 房间中的用户
      onceMembers(data);
      showLog('(' + formatTime(new Date().getTime()) + '): ', this.clientId + ' cyber-chat room is ready!');
    });
  };
  
  ////////////////////////////////////
  // Client.send(data)
  this.send = (message) => {
    var sendingStart = new Date().getTime();
    message = '' + message + ' [' + this.clientId + '&' + sendingStart +'] ';
    this.room.send( message, {receipt: true}, (ack) => {
      var sendingEnd = new Date().getTime();
      log(this.clientId, ' - in send(): server ack: ', ack); 
      this.msgs[ack.uid] = [message, sendingStart, sendingEnd, ack]; //[message, sending, sendingAck, pushing], need a pushingAck
    });
  };
  
  ////////////////////////////////////
  // Client.receipt()
  this.receipt = () => {
    this.room.receipt( (data) => {
      log(this.clientId, ' - in receipt(): receive ack: ', data); 
      this.msgs[data.id].push(data)
      log(this.msgs[data.id]); // ack.t, data.t: pushing, pushingEnd
      
      //////////////////////////////
      // todo: update PrintWall: 发送消息的信息
      var pre = '(' + formatTime(new Date().getTime()) + '): ' + this.msgs[data.id][0] + ': ';
      var time = 'sending - ' + (this.msgs[data.id][2]-this.msgs[data.id][1]) + '(ms), receiving - ' + (this.msgs[data.id][4].t-this.msgs[data.id][3].t) + '(ms)';
      showLog(pre, time);
    });
  };
  
  ////////////////////////////////////
  // Client.history()
  this.history = (options={}) => {
    this.room.log(options, (data) => {
      log(this.clientId, ' - in log(): message history: ', data); 
    });
  };
  
  /////////////////////////////////////
  // Client.report()
  this.report = () => {
    var number = 0;
    var sendTotal = 0;
    var receiveTotal = 0;
    
    var m = this.msgs;
    for(var k in m) {
      var m = this.msgs[k];
      sendTotal += (m[2]-m[1]);
      receiveTotal =+ (m[4].t-m[3].t);
      number++;
    }
    
    var sendAverage = sendTotal/number;
    var receiveAverage = receiveTotal/number;
    return {c: this.clientId, n: number, st: sendTotal, rt: receiveTotal, sa: sendAverage, ra: receiveAverage};
  };
  
}


