var socket = io.connect();

socket.on('login',function() {
  socket.emit('login',prompt('请输入你的姓名'));
});

socket.on('server msg', function (data) {
  var node = document.createElement('p');
  node.innerHTML = data;
  showMsg.appendChild(node);
});

socket.on('paint pts', function (pts) {
  var pts = JSON.parse(pts);
  if(!pts) return;
  ctl.drawPts(ctx, pts);
});

socket.on('paint path', function (paths) {
  var paths = JSON.parse(paths);
  paths.forEach(function (pts) {
    console.log(pts.tag);
    if (pts.tag === 'paint') {
      ctl.drawPts(ctx, pts);
    } else {
      new Rect(pts.x, pts.y, pts.w, pts.h).clearRT(ctx);
    }
  });
});

socket.on('erase', function (x,y,w,h) {
  new Rect(x,y,w,h).clearRT(ctx);
});