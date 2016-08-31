var showMsg = document.getElementById('showMsg'),
    sendBtn = document.getElementById('sendBtn'),
    msgInput = document.getElementById('msgInput'),
    paintCanvas = document.getElementById('paintCanvas'),
    effects = document.getElementById('effects'),
    canvas = document.getElementsByTagName('canvas')[0],
    ctx = canvas.getContext('2d');

var range = document.querySelector('input[type=range]'),
    colorInput = document.querySelector('input[type=color]');

window.addEventListener('load', function() {
  canvas.width = canvas.parentNode.offsetWidth;
  this.addEventListener('resize', function (e) {
    canvas.width = canvas.parentNode.offsetWidth;
    canvas.paths = [];
    canvas.pts = [];
    socket.emit('repaint');
  });
  
  console.log('load');
  ctl.init();
  
});

//canvas添加鼠标事件
canvas.addEventListener('mousedown', function (e) {
  if (effects.states === 'pen') {
    var x = e.offsetX, y = e.offsetY;
    ctl.clearPos();
    ctl.addPos(x, y);
  } else if (effects.states === 'erase') {
    var w=20,h=20;
    var rect = new Rect(x-(w>>>1),y-(h>>>1),w,h);
    rect.clearRT(ctx);
    socket.emit('erase',rect.x,rect.y,rect.w,rect.h);
  }
});
canvas.addEventListener('mousemove', function (e) {
  if(e.buttons === 1) {
    var x = e.offsetX, y = e.offsetY;
    if (effects.states === 'pen') {
      ctl.addPos(x, y);
      ctl.drawPts(ctx, this.pts);
      socket.emit('paint', JSON.stringify({data: new Path(this.pts), status: 'drawing'}));
    } else if(effects.states === 'erase') {
      var w=20,h=20;
      var rect = new Rect(x-(w>>>1),y-(h>>>1),w,h);
      rect.clearRT(ctx);
      socket.emit('erase',rect.x,rect.y,rect.w,rect.h);
    }
  }
});
canvas.addEventListener('mouseup', function (e) {
  if(effects.states === 'erase') {
    return ;
  } else if (effects.states === 'pen') {
    var x = e.offsetX, y = e.offsetY;
    ctl.addPos(x, y);
    ctl.addPath(this.pts);
    socket.emit('paint', JSON.stringify({data: new Path(this.pts), status: 'drawed'}));
    ctl.clearPos();
  }
});

//颜色变化
colorInput.addEventListener('change', function () {
  canvas.color = colorInput.value;
});

//线条变化的
range.addEventListener('change', function() {
  document.querySelector('#rangeValue').innerText = range.value;
  canvas.lw = range.value;
});

// 点击发送按钮，发送信息
sendBtn.addEventListener('click', function() {
  if(msgInput.value) {
    socket.emit('client msg', msgInput.value);
  } else {
    console.log('输入为空');
  }
});

//功能按钮
effects.addEventListener('click', function (event) {
  // if(event.target.className.indexOf('selected') !== -1) {
  //   var classString = event.target.className.replace(' selected', '');
  //   event.target.className = classString;
  // } else {
  //   var nodeArray = event.target.parentNode.childNodes;
  //   for (var i = 0; i < nodeArray.length; i++) {
  //     if(nodeArray[i].className.indexOf('selected') !== -1) {
  //       var classString = nodeArray[i].className.replace(' selected', '');
  //       nodeArray[i].className = classString;
  //     }
  //   }
  //   event.target.className += ' selected';
  // }
  
  //吊吊吊,竟然不知道有classList以及这些方法
  var target = event.target;
  //用来保存当前按钮的功能状态
  effects.states = '';

  if(target.classList.contains('btn')) {
    if(this.preBtn) {
      this.preBtn.classList.remove('selected');
      if (this.preBtn === target) {
        effects.on = false;
        this.preBtn = '';
      } else {
        target.classList.add('selected');
        effects.on = true;
        this.preBtn = target;
      }
    } else {
      target.classList.add('selected');
      effects.on = true;
      this.preBtn = target;
    }
  }
  if (effects.on) {
    switch (target.id) {
      case 'pen':
        effects.states = 'pen';
        break;
      case 'erase':
        effects.states = 'erase';
        break;
      case 'clearAll':
        effects.states = 'clearAll';
        //清除所有客户端画布内容
        console.log('clearAll');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.paths = [];
        ctx.pts = [];
        socket.emit('clearAll');
        break;
      case 'undo':
        effects.states = 'undo';
        break;
      case 'redo':
        effects.states = 'undo';
        break;
      case 'download':
        effects.states = 'download';
        break;
      default:
        effects.states = '';
        break;
    }
  }
  
});


//controller
var ctl = {
  init: function () {
    canvas.pts = [];    //点数组
    canvas.paths = [];  //路径数组
    canvas.lw = 1;
    canvas.color = 'black';
  },

  drawPts: function (ctx, pts) {
    if(pts instanceof Path || pts.pts){
      var color = pts.color, lw = pts.lw, pts = pts.pts;
    }
    var point1 = pts[0];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    pts.slice(1).forEach(function (pt) {
      ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineWidth = lw || canvas.lw;
    ctx.strokeStyle = color || canvas.color;
    ctx.stroke();
    ctx.restore();
  },

  addPos: function (x, y) {
    canvas.pts.push(new Point(x, y));
  },

  clearPos: function () {
    canvas.pts = [];
  },

  addPath: function (pts) {
    canvas.paths.push(new Path(pts, canvas.lw, canvas.color));
  }
};


//model
function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Path(pts, lw, color) {
  this.pts = pts;
  this.lw = lw || canvas.lw;
  this.color = color || canvas.color;
}

function Rect(x, y, h, w) {
  this.x = x;
  this.y = y;
  this.h = h;
  this.w = w;
}

Rect.prototype.clearRT = function (ctx) {
  ctx.clearRect(this.x,this.y,this.w,this.h);
}