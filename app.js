var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3030);

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'jade');
app.get('/', function(req, res) {
  res.render('index');
});


var paths = [];
var count = 0;

io.sockets.on('connection', function (socket) {
  count++;
  console.log(count);
  socket.on('login', function(name) {
    this.name = name || '无名氏';
    this.emit('server msg', '欢迎　' + this.name + '　的参与！');
    this.broadcast.emit('server msg', '欢迎　' + this.name + '　的参与！');
    //当客户端连接时,如果白板已有内容,渲染出来
    if(paths.length) {
      this.emit('paint path', JSON.stringify(paths));
    }
    // 客户端发言
    this.on('client msg', function(data) {
      // 向每一个socket广播
      var date = new Date().format('yyyy-MM-dd hh:mm:ss');
      data = date + '</br>' + this.name + '说: ' + data
      this.emit('server msg', data);
      this.broadcast.emit('server msg', data);
    });

    //画图时
    this.on('paint', function(data) {
      data = JSON.parse(data);
      var pts = data.data;
      switch (data.status) {
        case 'drawing': 
          this.broadcast.emit('paint pts', JSON.stringify(pts));
          break;
        case 'drawed': 
          this.broadcast.emit('paint pts', JSON.stringify(pts));
          pts.tag = 'paint';
          paths.push(pts);
          break;
      }
    });

    this.on('repaint', function () {
      this.emit('paint path', JSON.stringify(paths));
    });

    //橡皮擦时
    this.on('erase',function (x,y,w,h) {
      paths.push({tag:'erase',x:x,y:y,w:w,h:h});
      this.broadcast.emit('erase',x,y,w,h);
    });

    this.on('disconnect', function () {
      count--;
      if(!count) {
        paths = [];
      }
      console.log(count);
    });
  });
  socket.emit('login');
});



Date.prototype.format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
