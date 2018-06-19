//Widgit封装（事件绑定与触发）
;(function(root){
  
  function Widgit(){
    this.handlers = {}
  }

  Widgit.prototype.on = function(type, handler){
    if(this.handlers[type]===undefined){
      this.handlers[type] = []
    }
    this.handlers[type].push(handler)
    return this
  }
  Widgit.prototype.fire = function(type, options){
    var handlerItems = this.handlers[type]
    if(Object.prototype.toString.call(handlerItems) === '[object Array]'){
      for(var i=0,len=handlerItems.length;i<len;i++){
        handlerItems[i](options);
      }
    }
  }

  root.Widgit = Widgit

})(window);