console.time();
/**
 * 扫雷游戏（单体）
 * （原生js：使用es6 css3 建议使用最新谷歌浏览器进行查看）
 * @author: addFun
 */
var saoLeiGame = {
  //默认配置参数
  defaultOpts : {
    leiNum : 10,//雷的数量
    col : 10,//列
    row : 10,//行
    width : 30,//格子宽
    height : 30,//格子高
  },
  //切换关卡不变的节点参数
  $Wrap : document.getElementsByClassName('wrapper')[0],//游戏格子容器节点(只是格子)
  $leiNum : document.getElementsByClassName('lei-num')[0],//可能剩余雷的数目节点
  $alertBg : document.getElementsByClassName("alert-bg")[0],//弹窗背景
  $alertBox1 : document.getElementsByClassName("alert-box1")[0],//弹窗1
  $alertBox2 : document.getElementsByClassName("alert-box2")[0],//弹窗2
  $MTime : document.getElementsByClassName('m-time')[0],//弹窗分钟节点
  $STime : document.getElementsByClassName('s-time')[0],//弹窗秒钟节点
  $Minutes : document.getElementsByClassName('minutes')[0],//游戏上方分钟节点
  $Second : document.getElementsByClassName('second')[0],//游戏上方秒钟节点
  $OkBtn : document.getElementsByClassName('ok-btn'),//弹窗确定按钮
  $Again : document.getElementsByClassName('again')[0],//弹窗再来一局按钮
  $Next : document.getElementsByClassName('next')[0],//弹窗下一局按钮
  $Exit : document.getElementsByClassName('exit')[0],//游戏下方退出按钮
  $gameBeform : document.getElementsByClassName('game-beform')[0],//游戏开场难度选择容器
  $gameBox : document.getElementsByClassName('game-box')[0],//游戏容器（包括时间和数量）
  $OverAgain : document.getElementsByClassName('over-again')[0],//游戏下方重新开始按钮
  $gameStart : document.getElementsByClassName('game-start')[0],//开始游戏按钮
  $difficulty : document.getElementsByClassName('difficulty')[0].getElementsByTagName('div'),//难度选择按钮
  checkPoint : 0,//当前关卡
  
  //游戏开始的入口函数(开始游戏或重新开始的入口函数)
  start: function(options){
    _extend(1, options, this.defaultOpts);
    // 切换关卡要变的参数
    this.mapNum = this.defaultOpts.col * this.defaultOpts.row,//格子数量
    this.time = 0;//游戏时长
    this.timer = null;//计时器
    this.status = true;//游戏状态
    this.leiArr = [];//地雷数组(一维)
    this.safeEleArr = [];//已点击过安全的格子
    this.isLei = [];//右键点击可能是雷的格子
    //地图数组(形成二维数组)
    this.mapArr = [];
    for(var i=0;i<this.defaultOpts.row;i++){
      this.mapArr[i] = [];
    }
  
    this.createLei();
    this.createMap();
    this.render();
    this.addEvent();
    this.renderLeiNum();
    var _this = this;
    //在css3动画后，延时执行定时器
    setTimeout(function(){
      _this.timerFun();
    },500);
    // console.log(this.leiNum)
    // console.log(this.leiArr)
    // console.log(this.mapArr)
  },
  //生成地雷
  createLei: function(){
    var opts = this.defaultOpts;
    var optsCol = opts.col;
    for(var i=0,leiNum=opts.leiNum;i<leiNum;i++){
      var leiIndex = Math.floor(Math.random()*this.mapNum);
      if(this.mapArr[Math.floor(leiIndex/optsCol)][leiIndex%optsCol] == 'lei'){
        i--;
      }else{
        this.leiArr[i] = leiIndex;
        this.mapArr[Math.floor(leiIndex/optsCol)][leiIndex%optsCol] = 'lei';
      }
    }
  },
  //形成地图
  createMap: function(){
    for(var i=0,optsRow=this.defaultOpts.row;i<optsRow;i++){
      for(var j=0,optsCol=this.defaultOpts.col;j<optsCol;j++){
        var num=0;//此格子附近的雷数
        if(this.mapArr[i][j]!='lei'){
          if(this.mapArr[i][j+1]=='lei'){
            num++;
          }
          if(this.mapArr[i][j-1]=='lei'){
            num++;
          }
          if(this.mapArr[i+1] && this.mapArr[i+1][j]=='lei'){
            num++;
          }
          if(this.mapArr[i-1] && this.mapArr[i-1][j]=='lei'){
            num++;
          }
          if(this.mapArr[i+1] && this.mapArr[i+1][j+1]=='lei'){
            num++;
          }
          if(this.mapArr[i-1] && this.mapArr[i-1][j-1]=='lei'){
            num++;
          }
          if(this.mapArr[i-1] && this.mapArr[i-1][j+1]=='lei'){
            num++;
          }
          if(this.mapArr[i+1] && this.mapArr[i+1][j-1]=='lei'){
            num++;
          }
            this.mapArr[i][j]=num;
        }else{
          this.mapArr[i][j]='lei';
        }
      }
    }
  },
  //渲染数组地图
  render: function(){
    var opts = this.defaultOpts,
        optsCol = opts.col,
        optsRow = opts.row,
        optsWidth = opts.width,
        optsHeight = opts.height,
        html = '';
    for(var i=0;i<optsCol;i++){
      for(var j=0;j<optsRow;j++){
        html += '<div id='+(i*optsRow+j)+' style="width: '+optsWidth+'px; height: '+optsHeight+'px;"></div>';
      }
    }
    this.$Wrap.innerHTML = html;
    this.$Wrap.style.width = optsCol * optsWidth + 'px';
    this.$Wrap.style.height = optsRow * optsHeight + 'px';
    this.$Minutes.innerHTML = '00';
    this.$Second.innerHTML = '00';
  },

  //用来绑定初始各种按钮(不需要解绑的)(游戏页面入口)
  init: function(ops){
    this.addIntEvent();
  },
  //绑定事件函数(不需要解绑的)
  addIntEvent: function(){
    //取消右键默认菜单
    this.$Wrap.oncontextmenu = function(){
      return false;
    }
    this.$alertBg.oncontextmenu = function(){
      return false;
    }
    //绑定难度选择按钮（默认三个）
    for(var i=0,len=this.$difficulty.length;i<len;i++){
      this.$difficulty[i].addEventListener('click',this.diffcultChoose(i),false)
    }
    //绑定开始游戏按钮
    this.$gameStart.addEventListener('click', this.startFun.bind(this),false);
    
    var _this = this;
    //绑定游戏成功1或失败2的弹窗按钮确定事件
    this.$OkBtn[0].addEventListener('click', function(){
      _this.okBtn1Fun();
    }, false)
    this.$OkBtn[1].addEventListener('click', function(){
      _this.okBtn2Fun();
    }, false)
    //绑定退出当前游戏按钮
    this.$Exit.addEventListener('click',this.exitFun.bind(this),false);
    //绑定重开当前游戏按钮
    this.$OverAgain.addEventListener('click',this.againFun.bind(this),false);
    //绑定弹窗再来一局按钮
    this.$Again.addEventListener('click',this.againBoxFun.bind(this),false);
    //绑定弹窗下一局按钮
    this.$Next.addEventListener('click',this.nextBoxFun.bind(this),false);
  },
  //绑定游戏格子点击(鼠标抬起)事件(需要解绑的)
  addEvent: function(){
    //保存bind返回的函数(以便解绑)
    this.binMouseUp = this.mouseUp.bind(this);
    this.$Wrap.addEventListener('mouseup',this.binMouseUp, false);
  },
  //移除事件/定时器
  removeEvent: function(){
    //清除定时器和游戏格子鼠标事件
    clearInterval(this.timer);
    this.$Wrap.removeEventListener('mouseup', this.binMouseUp);
  },
  //开始按钮
  startFun: function(e){
    var _this = this;
    e.stopPropagation();
    this.start(diffArr[this.checkPoint]);//初始化不同难度游戏
    //隐藏难度选择页
    _addClass(this.$gameBeform, 'game-beform-clicked');
    setTimeout(function(){
      _this.$gameBeform.style.display = 'none';
    },500)
    //展现游戏页
    this.$gameBox.style.display = 'block';
    var _this = this;
    setTimeout(function(){
      _addClass(_this.$gameBox, 'game-box-clicked');
    },0)
  },
  //难度选择
  diffcultChoose: function(i){
    var _this = this;
    return function(){
      _this.checkPoint = i;
      for (var j = 0, len = _this.$difficulty.length;j<len;j++){
        _removeClass(_this.$difficulty[j],'clicked');
      }
      _addClass(_this.$difficulty[_this.checkPoint],'clicked');
    }
  },
  //弹窗下一关按钮(通过这一关下一关难度提升,最后一关通过时返回主页)
  nextBoxFun: function(){
    var _this = this;
    _this.removeEvent();
    _this.okBtn2Fun();
    _this.checkPoint++;
    //判断是否为最后一关
    if(_this.checkPoint >= diffArr.length){
      new PopupWindow().confirm({
        title: '游戏提示：',
        content: '真厉害，您已经通关了！',
        confirmFn: function(){
          _this.backBeform();
        }
      })
    }else{
      _this.start(diffArr[_this.checkPoint]);
      //同时改变首页难度的默认选择渲染
      for(var j=0,len=_this.$difficulty.length;j<len;j++){
        _removeClass(_this.$difficulty[j],'clicked');
      }
      _addClass(_this.$difficulty[_this.checkPoint],'clicked');
    }
  },
  //弹窗再来一次按钮
  againBoxFun: function(e){
    this.okBtn1Fun();
    this.removeEvent();
    this.start(diffArr[this.checkPoint]);
  },
  //弹窗确定按钮
  okBtn1Fun: function(){
    var _this = this;
    _removeClass(this.$alertBox1, 'active');
    setTimeout(function(){
      _removeClass(_this.$alertBg, 'active');
    },300)
  },
  okBtn2Fun: function(){
    var _this = this;
    _removeClass(this.$alertBox2, 'active');
    setTimeout(function(){
      _removeClass(_this.$alertBg, 'active');
    },300)
  },
  //重新开始
  againFun: function(e){
    var _this = this;
    if(this.status){
      new PopupWindow().confirm({
        title: '游戏提示：',
        content: '游戏还没结束，你确定要重开吗？',
        confirmFn: function(){
          _this.removeEvent();
          _this.start(diffArr[this.checkPoint]);
        }
      })
    }else{
      this.removeEvent();
      this.start(diffArr[this.checkPoint]);
    }
  },
  //退出游戏
  exitFun: function(e){
    e.stopPropagation();
    var _this = this;
    if(this.status){
      new PopupWindow().confirm({
        title: '游戏提示：',
        content: '游戏还没结束，你确定要退出吗？',
        confirmFn: function(){
          _this.backBeform();
        }
      })
    }else{
      this.backBeform();
    }
  },
  //回到难度选择页
  backBeform: function(){
    var _this = this;
    _removeClass(this.$gameBox, 'game-box-clicked');
    setTimeout(function(){
      _this.$gameBox.style.display = 'none';
    },500)
  
    this.$gameBeform.style.display = 'block';
    setTimeout(function(){
      _removeClass(_this.$gameBeform, 'game-beform-clicked');
    },0)
    this.removeEvent();
  },
  //鼠标抬起事件
  mouseUp: function(e){
    e.stopPropagation();
    if(e.which == 1){
      this.leftClick(e);
    }else if(e.which == 3){
      this.rightClick(e)
    }  
  },
  //鼠标左键
  leftClick: function(e){
    var targetClass = e.target.className;
    //判断不为已点击的格子
    if(targetClass != 'clicked'&&targetClass != 'wrapper'){            
      var leftFlag=true;
      //判断此格子是不是为可能是雷的安全格子中(绿色)
      this.isLei.forEach(function(ele){
        if(ele==e.target.id){
          leftFlag=false;
        }
      })
      //在安全的(绿色)格子中不会触发下面事件
      if(leftFlag){
        var optsCol = this.defaultOpts.col;
        var x = Math.floor(e.target.id / optsCol);
        var y = e.target.id % optsCol;
        //判断此格子的位置在地图数组中是否为雷
        if(this.mapArr[x][y]==='lei'){
          //是雷，显示雷样式 结束游戏 解除事件绑定 弹出over弹窗
          e.target.className ='clicked-lei';
          for(var i=0,leiNum=this.defaultOpts.leiNum;i<leiNum;i++){
            document.getElementById(this.leiArr[i]).className='clicked-lei'
          }
          clearTimeout(this.timer);
          this.$Wrap.removeEventListener('mouseup', this.binMouseUp)
          this.alertErrorFun();
          this.status = false;
        }else{
          //不是雷，安全显示格子 并进行递归传递
          this.showSafe(x,y)
        }
      }
      this.renderLeiNum();
    }
  },
  //鼠标右键
  rightClick: function(e){
    var isLeiNum=Number(e.target.id),
        rightFlag = true,
        _this = this
        $IsLei = document.getElementById(isLeiNum);
    //判断该格子是否已经在安全的格子数组中(是否为绿色)
    if(this.safeEleArr.indexOf(isLeiNum)==-1){
      for(var i=0,len=this.isLei.length;i<len;i++){
        if(isLeiNum == this.isLei[i]){
          rightFlag = false;
        }
      }
      //不是安全格子，使之变成安全格子；否则，取消安全
      if(rightFlag){
        this.isLei.push(isLeiNum);
        $IsLei.className='right-click';
      }else{
        this.isLei._remove(isLeiNum);
        $IsLei.className='';
      }
      //重新渲染游戏上方提示： (可能还存在雷的个数)
      this.renderLeiNum();
    }
    //判断是否完成（胜利）(每次右键点击都会进行判断)
    if(this.leiArr.length===this.isLei.length){//雷的数量和可能是雷的数量是否相等
      var isSuccess = true;
      this.leiArr.forEach(function(ele){//雷和可能是雷的值是否不同
        if (_this.isLei.indexOf(ele)===-1){
          isSuccess = false;//有不同说明不对
        }
      })
      //雷数组和可能是雷的数组相同，表明成功
      if(isSuccess){
        //显示未显示的格子
        var remainArr = [];
        for(var i=0,len=this.mapNum;i<len;i++){
          remainArr[i]=i;
        }
        var downArr = this.safeEleArr.concat(this.isLei)
        for(var j=0,lenJ=downArr.length;j<lenJ;j++){
          remainArr.splice(remainArr.indexOf(downArr[j]),1)
        }
        // console.log(remainArr);
        for(var j=0,lenJ=remainArr.length;j<lenJ;j++){
          var safeEle = document.getElementById(remainArr[j]);
          var optsCol = this.defaultOpts.col;
          var x = Math.floor(remainArr[j] / optsCol),
              y = remainArr[j] % optsCol;
          safeEle.className = 'clicked-no';
          safeEle.innerText = this.mapArr[x][y] || '';
        }
        //移除事件绑定 弹出成功弹窗
        this.$Wrap.removeEventListener('mouseup', this.binMouseUp)
        clearTimeout(this.timer);
        this.alertSuccFun();
        this.status = false;
      }
    }
  },
  //点击附近无雷时展开地图安全数组的函数(传递)(x,y指该格子的坐标位置)
  showSafe: function(x,y){
    var optsCol = this.defaultOpts.col;
    //判断使x,y有意义
    if(y < optsCol && y > -1 && x < this.defaultOpts.row && x > -1){
      var s = x * optsCol + y;
      var safeEle = document.getElementById(s);
      safeEle.className='clicked-no'
      safeEle.innerText = this.mapArr[x][y] || '';
      //在展开过程中，被右键点击的安全区域也可被扩展开(不是雷的话)
      for(var i=0,len=this.safeEleArr.length;i<len;i++){
        if(s === this.safeEleArr[i]){
            return;
        }
      }
      this.safeEleArr.push(s);
      this.isLei._remove(s);
      if(this.mapArr[x][y]===0){
        //向该位置八个不同的方向扩展
        this.showSafe(x, y+1);
        this.showSafe(x, y-1);
        this.showSafe(x+1, y);
        this.showSafe(x+1, y+1);
        this.showSafe(x+1, y-1);
        this.showSafe(x-1, y);
        this.showSafe(x-1, y-1);
        this.showSafe(x-1, y+1);
      }
    }
  },
  //计时器
  timerFun: function(){
    var _this = this
    this.timer = setInterval(function(){
      _this.time += 1;
      _this.renderTime();
    },1000);
  },
  //渲染倒计时数字
  renderTime: function(){
    this.$Minutes.innerHTML = parseInt(this.time/60)>9?parseInt(this.time/60):'0'+parseInt(this.time/60);
    this.$Second.innerHTML = parseInt(this.time%60)>9?parseInt(this.time%60):'0'+parseInt(this.time%60);
  },
  //渲染雷还可能存在的数量
  renderLeiNum: function(){
    this.$leiNum.innerHTML = this.defaultOpts.leiNum - this.isLei.length;
  },
  //失败弹窗函数
  alertErrorFun: function(){
    var _this = this;
    setTimeout(function(){
      _addClass(_this.$alertBox1,'active');
    },0)
    this.$alertBox1.style.display='block';
    this.$alertBox2.style.display='none';
    _addClass(this.$alertBg,'active');
  },
  //成功弹窗函数
  alertSuccFun: function(){
    var _this = this
    this.$MTime.innerHTML = parseInt(this.time/60);
    this.$STime.innerHTML = parseInt(this.time%60);
    setTimeout(function(){
      _addClass(_this.$alertBox2,'active');
    },300)
    this.$alertBox1.style.display='none';
    this.$alertBox2.style.display='block';
    _addClass(this.$alertBg,'active');
  },
}


saoLeiGame.init();
console.timeEnd();

//关卡难度数组(默认3关，多了会出现隐藏关卡) （雷的数量,地图列数,行数）
var diffArr = [{
    leiNum : 10,
    col : 10,
    row : 10
  },
  {
    leiNum : 20,
    col : 12,
    row : 12
  },
  {
    leiNum : 35,
    col : 15,
    row : 15
}];
