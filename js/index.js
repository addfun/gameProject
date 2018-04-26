
/**
 * 扫雷游戏（单体）
 * （原生js：使用es6 css3 建议使用最新谷歌浏览器进行查看）
 * @author: addFun
 */
const saoLeiGame = {
  //默认配置参数
  defaultOpts : {
    leiNum : 10,//雷的数量
    col : 10,//列
    row : 10,//行
    width : 30,//格子宽
    height : 30,//格子高
  },
  
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
  
  //游戏开始的出口函数
  init(options){
    _extend(1, this.defaultOpts, options);

    this.mapNum = this.defaultOpts.col * this.defaultOpts.row,//格子数量
    this.time = 0;//游戏时长
    this.timer = null;//计时器
    this.status = true;//游戏状态
    this.leiArr = [];//地雷数组(一维)
    this.safeEleArr = [];//已点击过安全的格子
    this.isLei = [];//右键点击可能是雷的格子
    this.remainArr = [];//剩余没点击过的格子(暂未用，可用以优化)
    this.mapArr = [];//地图数组(二维数组)
    for(let i=0;i<this.defaultOpts.row;i++){
      this.mapArr[i] = [];
    }
  
    //生成地雷
    for(let i=0;i<this.defaultOpts.leiNum;i++){
      let leiIndex = Math.floor(Math.random()*this.mapNum);
      if(this.mapArr[Math.floor(leiIndex/this.defaultOpts.col)][leiIndex%this.defaultOpts.col] == 'lei'){
        i--;
      }else{
        this.leiArr[i] = leiIndex;
        this.mapArr[Math.floor(leiIndex/this.defaultOpts.col)][leiIndex%this.defaultOpts.col] = 'lei';
      }
    }
    //形成地图
    for(let i=0;i<this.defaultOpts.row;i++){
      for(let j=0;j<this.defaultOpts.col;j++){
        let num=0;
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
    this.render();
    this.addEvent();
    this.renderLeiNum();
    setTimeout(()=>{
      this.timerFun();
    },500);
    // console.log(this.leiNum)
    // console.log(this.leiArr)
    // console.log(this.mapArr)
  },
  //渲染数组地图
  render(){
    let html = '';
    for(let i=0;i<this.defaultOpts.col;i++){
      for(let j=0;j<this.defaultOpts.row;j++){
        html += `<div id=${i*this.defaultOpts.row+j} style="width: ${this.defaultOpts.width}px; height: ${this.defaultOpts.height}px;"></div>`;
      }
    }
    this.$Wrap.innerHTML = html;
    this.$Wrap.style.width = this.defaultOpts.col * this.defaultOpts.width + 'px';
    this.$Wrap.style.height = this.defaultOpts.row * this.defaultOpts.height + 'px';
    this.$Minutes.innerHTML = '00';
    this.$Second.innerHTML = '00';
  },
  //用来绑定初始各种按钮(不需要解绑的)
  subInit(ops){
    this.addIntEvent();
  },
  //绑定事件函数(不需要解绑的)
  addIntEvent(){
    //取消右键默认菜单
    this.$Wrap.oncontextmenu = ()=>{
      return false;
    }
    this.$alertBg.oncontextmenu = ()=>{
      return false;
    }
    //绑定难度选择按钮（默认三个）
    for(let i=0;i<this.$difficulty.length;i++){
      this.$difficulty[i].addEventListener('click',this.diffcultChoose(i),false)
    }
    //绑定开始游戏按钮
    this.$gameStart.addEventListener('click', this.startFun.bind(this),false);
    
    //绑定游戏成功或失败的弹窗按钮确定事件
    this.$OkBtn[0].addEventListener('click',()=>{
      this.okBtn1Fun();
    }, false)
    this.$OkBtn[1].addEventListener('click',()=>{
      this.okBtn2Fun();
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
  addEvent(){
    this.binMouseUp = this.mouseUp.bind(this);
    this.$Wrap.addEventListener('mouseup',this.binMouseUp, false);
  },
  //移除事件/定时器
  removeEvent(){
    //清除定时器和游戏格子鼠标事件
    clearInterval(this.timer);
    this.$Wrap.removeEventListener('mouseup', this.binMouseUp);
  },
  //开始按钮
  startFun(e){
    e.stopPropagation();
    this.init(diffArr[this.checkPoint]);//初始化不同难度游戏
    _addClass(this.$gameBeform, 'game-beform-clicked');
    setTimeout(()=>{
      this.$gameBeform.style.display = 'none';
    },500)

    this.$gameBox.style.display = 'block';
    setTimeout(()=>{
      _addClass(this.$gameBox, 'game-box-clicked');
    },0)
  },
  //难度选择
  diffcultChoose(i){
    return ()=>{
      this.checkPoint = i;
      for(let j=0;j<this.$difficulty.length;j++){
        _removeClass(this.$difficulty[j],'clicked');
      }
      _addClass(this.$difficulty[this.checkPoint],'clicked');
    }
  },
  //弹窗下一关按钮(通过这一关下一关难度提升,最后一关通过时返回主页)
  nextBoxFun(){
    this.removeEvent();
    this.okBtn2Fun();
    this.checkPoint++;
    if(this.checkPoint >= diffArr.length){
      alert('真厉害，您已经通关了！')
      this.backBeform();
    }else{
      this.init(diffArr[this.checkPoint]);
      //同时改变首页难度的默认选择渲染
      for(let j=0;j<this.$difficulty.length;j++){
        _removeClass(this.$difficulty[j],'clicked');
      }
      _addClass(this.$difficulty[this.checkPoint],'clicked');
    }
  },
  //弹窗再来一次按钮
  againBoxFun(e){
    this.okBtn1Fun();
    this.removeEvent();
    this.init(diffArr[this.checkPoint]);
  },
  //弹窗确定按钮
  okBtn1Fun(){
    _removeClass(this.$alertBox1, 'active');
    setTimeout(()=>{
      _removeClass(this.$alertBg, 'active');
    },300)
  },
  okBtn2Fun(){
    _removeClass(this.$alertBox2, 'active');
    setTimeout(()=>{
      _removeClass(this.$alertBg, 'active');
    },300)
  },
  //重新开始
  againFun(e){
    if(this.status){
      let flog = confirm('游戏还没结束，你确定要重新开始吗？');
      if(flog){
        this.removeEvent();
        this.init(diffArr[this.checkPoint]);
      }
    }else{
      this.removeEvent();
      this.init(diffArr[this.checkPoint]);
    }
  },
  //退出游戏
  exitFun(e){
    e.stopPropagation();
    
    if(this.status){
      let flog = confirm('游戏还没结束，你确定要退出吗？');
      if(flog){
        this.backBeform();
      }
    }else{
      this.backBeform();
    }
  },
  //回到首页
  backBeform(){
    _removeClass(this.$gameBox, 'game-box-clicked');
    setTimeout(()=>{
      this.$gameBox.style.display = 'none';
    },500)
  
    this.$gameBeform.style.display = 'block';
    setTimeout(()=>{
      _removeClass(this.$gameBeform, 'game-beform-clicked');
    },0)
    this.removeEvent();
  },
  //鼠标抬起事件
  mouseUp(e){
    e.stopPropagation();
    if(e.which == 1){
      this.leftClick(e);
    }else if(e.which == 3){
      this.rightClick(e)
    }  
  },
  //鼠标左键
  leftClick(e){
    if(e.target.className != 'clicked'&&e.target.className != 'wrapper'){            
      let leftFlag=true;
      this.isLei.forEach((ele)=>{
        if(ele==e.target.id){
          leftFlag=false;
        }
      })
      if(leftFlag){
        let x = Math.floor(e.target.id / this.defaultOpts.col);
        let y = e.target.id % this.defaultOpts.col;
        if(this.mapArr[x][y]==='lei'){
          e.target.className ='clicked-lei';
          for(let i=0;i<this.defaultOpts.leiNum;i++){
            document.getElementById(this.leiArr[i]).className='clicked-lei'
          }
          clearTimeout(this.timer);
          this.$Wrap.removeEventListener('mouseup', this.binMouseUp)
          this.alertErrorFun();
          this.status = false;
        }else{
          this.showSafe(x,y)
        }
      }
      this.renderLeiNum();
    }
  },
  //鼠标右键
  rightClick(e){
    let isLeiNum=Number(e.target.id)
    let rightFlag = true;
    if(this.safeEleArr.indexOf(isLeiNum)==-1){
      for(let i=0,len=this.isLei.length;i<len;i++){
        if(isLeiNum == this.isLei[i]){
          rightFlag = false;
        }
      }
      if(rightFlag){
        this.isLei.push(isLeiNum);
        document.getElementById(isLeiNum).className='right-click';
      }else{
        this.isLei._remove(isLeiNum);
        document.getElementById(isLeiNum).className='';
      }
      this.renderLeiNum();
    }
    //判断是否完成（胜利）
    if(this.leiArr.length===this.isLei.length){
      let isSuccess = true;
      this.leiArr.forEach((ele)=>{
        if(this.isLei.indexOf(ele)===-1){
          isSuccess = false;
        }
      })
      if(isSuccess){
        this.$Wrap.removeEventListener('mouseup', this.binMouseUp)
        clearTimeout(this.timer);
        this.alertSuccFun();
        this.status = false;
      }
    }
  },
  //点击附近无雷时展开地图安全数组的函数（递归）
  showSafe(x,y){
    if(y < this.defaultOpts.col && y > -1 && x < this.defaultOpts.row && x > -1){
      var s = x * this.defaultOpts.col+y;
      let safeEle = document.getElementById(s);
      safeEle.className='clicked-no'
      safeEle.innerText = this.mapArr[x][y] || '';
  
      for(let i=0,len=this.safeEleArr.length;i<len;i++){
        if(s === this.safeEleArr[i]){
            return;
        }
      }
      this.safeEleArr.push(s);
      this.isLei._remove(s);
      if(this.mapArr[x][y]===0){
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
  timerFun(){
    this.timer = setInterval(()=>{
      this.time += 1;
      this.renderTime();
    },1000);
  },
  //渲染倒计时数字
  renderTime(){
    this.$Minutes.innerHTML = parseInt(this.time/60)>9?parseInt(this.time/60):'0'+parseInt(this.time/60);
    this.$Second.innerHTML = parseInt(this.time%60)>9?parseInt(this.time%60):'0'+parseInt(this.time%60);
  },
  //渲染雷还可能存在的数量
  renderLeiNum(){
    this.$leiNum.innerHTML = this.defaultOpts.leiNum - this.isLei.length;
  },
  //失败弹窗函数
  alertErrorFun(){
    setTimeout(()=>{
      _addClass(this.$alertBox1,'active');
    },0)
    this.$alertBox1.style.display='block';
    this.$alertBox2.style.display='none';
    _addClass(this.$alertBg,'active');
  },
  //成功弹窗函数
  alertSuccFun(){
    this.$MTime.innerHTML = parseInt(this.time/60);
    this.$STime.innerHTML = parseInt(this.time%60);
    setTimeout(()=>{
      _addClass(this.$alertBox2,'active');
    },0)
    this.$alertBox1.style.display='none';
    this.$alertBox2.style.display='block';
    _addClass(this.$alertBg,'active');
  },
}

saoLeiGame.subInit();

//难度选项数组
let diffArr = [{
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




