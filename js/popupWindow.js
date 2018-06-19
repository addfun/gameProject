/*自定义confirm弹窗*/
;(function(root, factory){
  factory(root)
})(window, function(root){
  //默认配置
  var def = {
    title: '弹窗提示主题：',
    content: '弹窗确定提示信息？',
    confirmFn: null,
    cancelFn: null
  }
  //弹窗构造函数
  function PopupWindow(){
    this.def = def
    //实现构造函数模板继承
    root.Widgit.call(this)
  }
  
  //实现原型继承
  _inherit(root.Widgit, PopupWindow)
  PopupWindow.prototype.confirm = function(options){
      var _this = this
      var conf = root._extend(options, _this.def)
      var $box = document.createElement('div')
      $box.className = 'myAlert-box'
      var $content =  '<div class="myAlert-mask"></div>'+
                      '<div class="myAlert-wrapper">'+
                        '<div class="myAlert-title">'+conf.title+'</div>'+
                        '<div class="myAlert-content">'+conf.content+'</div>'+
                        '<div class="myAlert-btns">'+
                          '<button class="myAlert-confirmBtn">确定</button>'+
                          '<button class="myAlert-cancelBtn">取消</button>'+
                        '</div>'+
                      '</div>'
      
      $box.innerHTML = $content
      document.body.appendChild($box);
      var $confirmBtn = $box.getElementsByClassName('myAlert-confirmBtn')[0]
      var $cancelBtn = $box.getElementsByClassName('myAlert-cancelBtn')[0]
      var $title = $box.getElementsByClassName('myAlert-title')[0]
      var $wrapper = $box.getElementsByClassName('myAlert-wrapper')[0]
      _this.wrapDom = $wrapper
      $confirmBtn.onclick = function(e){
        e.stopPropagation();
        console.dir(e.target)
        _this.fire('confirm')
        //关闭弹窗
        $confirmBtn.onclick = null
        $cancelBtn.onclick = null
        $box.remove()
      }
      $cancelBtn.onclick = function(e){
        e.stopPropagation();
        _this.fire('cancel')
        //关闭弹窗
        $confirmBtn.onclick = null
        $cancelBtn.onclick = null
        $box.remove()
      }
      if(conf.confirmFn){
        console.log(_this)
        _this.on('confirm', conf.confirmFn)
      }
      if(conf.cancelFn){
        _this.on('cancel', conf.cancelFn)
      }
      this.addDragEvent($title, $wrapper)
      return this
    },
    PopupWindow.prototype.addDragEvent = function(ele, wrapDom){
      this.bindMouseDown = this.mouseDown.bind(this)
      ele.addEventListener('mousedown', this.bindMouseDown)
    },
    PopupWindow.prototype.mouseDown = function(e){
      var wrapDom = this.wrapDom,
          mouseX = e.clientX,
          mouseY = e.clientY,
          wrapDomH = wrapDom.offsetHeight,
          wrapDomW = wrapDom.offsetWidth,
          wrapDomX = wrapDom.offsetLeft-wrapDomW/2,
          wrapDomY = wrapDom.offsetTop-wrapDomH/2;
      this.disX = mouseX-wrapDomX
      this.disY = mouseY-wrapDomY
      this.wrapDomH = wrapDomH
      this.wrapDomW = wrapDomW
      this.windowH = document.documentElement.clientHeight
      this.windowW = document.documentElement.clientWidth
      this.callMouseMove = this.mouseMove.call(this)//不用bind 就要在函数中return一层匿名函数
      this.bindMouseUp = this.mouseUp.bind(this)
      document.addEventListener('mousemove', this.callMouseMove)
      document.addEventListener('mouseup', this.bindMouseUp)
    },
    PopupWindow.prototype.mouseMove = function(){
      var _this = this
      return function(e){
        e.preventDefault();
        var wrapDom = _this.wrapDom,
            mouseX = e.clientX,
            mouseY = e.clientY;
        if(mouseX<_this.disX){
          wrapDom.style.left = _this.wrapDomW/2+'px'
        }else if(mouseX>_this.windowW-_this.wrapDomW+_this.disX){
          wrapDom.style.left = _this.windowW-(_this.wrapDomW/2)+'px'
        }else{
          wrapDom.style.left = mouseX-_this.disX+(_this.wrapDomW/2)+'px'
        }
        if(mouseY<_this.disY){
          wrapDom.style.top = _this.wrapDomH/2+'px'
        }else if(mouseY>_this.windowH-_this.wrapDomH+_this.disY){
          wrapDom.style.top = _this.windowH-(_this.wrapDomH/2)+'px'
        }else{
          wrapDom.style.top = mouseY-_this.disY+(_this.wrapDomH/2)+'px'
        }
      }
    },
    PopupWindow.prototype.mouseUp = function(e){
      document.removeEventListener('mousemove',this.callMouseMove)
      document.removeEventListener('mouseup',this.bindMouseUp)
    }

  //继承
  function _inherit(origin, target){
    function F(){};
    F.prototype = origin.prototype;
    target.prototype = new F();
    console.log(target.prototype)
    target.prototype.constractor = target;
  }
  root.PopupWindow = PopupWindow
});