/**
 * 删除数组中的某个值
 * @param {number/string} val 数组中要删除的值
 */
Array.prototype._remove=function(val){
  let index = this.indexOf(val);
  if(index>-1){
    this.splice(index,1);
  }
}

/**
 * 扩展
 * @param {boolean} type 是否为深度克隆（不写为false）
 * @param {object} target 目标对象
 * @param {object} origin 源对象
 */
function _extend(type, target, origin){//es6 
  target = target || {};
  if(!arguments[2]){
    origin = target;
    target = typeof(type)==='object' ? type : {};
  }
  if(type){
      for(var prop in origin){
        if(origin.hasOwnProperty(prop)){
          if(typeof(origin[prop]) === "object" && origin[prop] !== null){
            if(Object.prototype.toString.call(origin[prop]) === "[object Array]"){
              target[prop] = [];
            }else{
              target[prop] = {};
            }
            _extend(true, target[prop], origin[prop]);
          }else{
            target[prop] = origin[prop];
          }
        }
      }
  }else{
    for(var prop in origin){
      target[prop] = origin[prop];
    }
  }
  return target; 
}

/**
 * 增加元素类名
 * @param {object} ele 元素节点
 * @param {string} classname 类名
 */
function _addClass(ele, classname) { //ie10+ 可用classList.add
  var classArr = ele.className.split(' ');
  if (!ele.className) {
    ele.className = classname;
    return;
  }
  for (var i = 0; i < classArr.length; i++) {
    if (classArr[i] === classname) return;
  }
  ele.className += ' ' + classname;
}

/**
 * 删除元素类名
 * @param {object} ele 元素
 * @param {string} classname 类名
 */
function _removeClass(ele, classname) { 
  var classArr = ele.className.split(' ');
  if (!ele.className) return;
  for (var i = 0; i < classArr.length; i++) {
    if (classArr[i] === classname) {
      classArr.splice(i, 1);
      ele.className = classArr.join(' ');
      break;
    }
  }
}