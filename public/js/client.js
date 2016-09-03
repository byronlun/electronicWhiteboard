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
    console.log(pts.tag);
    if (pts.tag === 'paint') {
      console.log('paint');
      ctl.drawPts(ctx, pts);
    } else if (pts.tag === 'erase') {
      console.log('erase');
      pts.eraseRects.forEach(function (rect) {
        new Rect(rect.x, rect.y, rect.w, rect.h).clearRT(ctx);
      });
    }
    
  });
});

socket.on('erase', function (eraseRects) {
  var eraseRects = JSON.parse(eraseRects);
  console.log(eraseRects);
  eraseRects.forEach(function (rect) {
    new Rect(rect.x, rect.y, rect.w, rect.h).clearRT(ctx);
  });
});

socket.on('clearAll', function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});


socket.on('uploadBg', function () {
  canvas.style.background = 'url(../images/background.png)';
});