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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paths.forEach(function (pts) {
    ctl.drawPts(ctx, pts);
  });
});

socket.on('clearAll', function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});