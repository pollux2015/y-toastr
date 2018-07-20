import './scss/toastr.scss'

class Ytoastr {
  constructor() {

    this.toastrMap = {};
    this.currentIndex = 0;
    this.timer = 3000; // 停留时长
    this.defaultPamras = {
      type: 'info',
      align: 'left',
      title: '标题',
      auto: true,
      postion: 'top-right'
    }
  }

  create(params = {}, timer) {
    params = this.extendCopy(this.defaultPamras, params);
    let wrapperEle = document.createElement('div');
    let titleEle = document.createElement('h4');
    let desEle = document.createElement('p');
    wrapperEle.setAttribute('class', `ytoastr-wrapper toastr-animated ytoastr-${ params.type } ytoastr-align-${params.align}`);
    wrapperEle.setAttribute('style', 'display: none');

    // addClass
    this.addClass(titleEle, 'ytoastr-title');
    this.addClass(desEle, 'ytoastr-des');

    // addCont
    titleEle.appendChild(document.createTextNode(params.title));
    desEle.appendChild(document.createTextNode(params.des));

    wrapperEle.appendChild(titleEle);
    params.des && wrapperEle.appendChild(desEle);

    const postionWraperId = `toastr-list-${params.postion}`;
    let listEle = document.getElementById(postionWraperId);
    if (!listEle) {
      listEle = document.createElement('div');
      listEle.setAttribute('id', postionWraperId);
      document.body.appendChild(listEle)
    }

    listEle.appendChild(wrapperEle);
    document.body.appendChild(listEle);

    const tid = 't-' + this.currentIndex;
    const toastrObj = {
      tid,
      ele: wrapperEle,
      show: () => {
        this.show(tid);
      },
      remove: () => {
        this.remove(tid);
      }
    };

    wrapperEle.setAttribute('tid', tid);

    // store
    this.toastrMap[tid] = toastrObj;
    this.currentIndex++;

    // bindEvent
    this.bindEvent(toastrObj);
    this.animateStartClass = 'toastr-fadein-down';
    this.animateEndClass = 'toastr-fadeout-up';
    this.show(tid);
    params.auto && setTimeout(() => {
      this.remove(tid);
    }, timer || this.timer);
  }

  bindEvent(toastrObj) {
    toastrObj.ele.onclick = () => {
      toastrObj.remove();
    }
  }

  // 清除所有toastr
  clear() {
    let map = this.toastrMap
    for (let i in map) {
      map[i].remove && map[i].remove();
    }
  }

  // 显示toastr
  show(tid) {
    let tObject = this.toastrMap[tid] || {};
    let element = tObject.ele;
    if (!element) return;
    element.setAttribute('style', 'display: block');
    this.animateStartClass && this.addClass(element, this.animateStartClass);
  }

  // 移除toastr
  remove(tid) {
    let tObject = this.toastrMap[tid] || {};
    let element = tObject.ele;
    if (!element || tObject.removed) return;

    tObject.removed = true;
    this.removeClass(element, this.animateStartClass);
    if (this.hasAnimateEnd()) {
      this.addClass(element, this.animateEndClass);
      const animateEvents = ['webkitAnimationEnd', 'mozAnimationEnd', 'MSAnimationEnd', 'oanimationend', 'animationend'];
      animateEvents.forEach((event) => {
        element.addEventListener(event, () => {
          this.removeClass(element, this.animateEndClass);
          this.destroyedData(tid);
        }, false);
      })
    } else {
      this.destroyedData(tid);
    }
  }

  // 销毁toastr, 移除节点并从map上移除
  destroyedData(tid) {
    let tObject = this.toastrMap[tid] || {};
    let element = tObject.ele;
    if (!element) return;
    element.parentNode.removeChild(element);
    delete this.toastrMap[tid];
  }

  // 判断是否支持CSS3animation动画, TODO
  hasAnimateEnd() {
    const re = /^on[a-zA-z]*?[aA]nimation/
    for (let i in window) {
      if (re.test(i)) {
        return true;
      }
    }
  }

  // 成功
  info(arg = {
    title: '成功'
  }, timer) {
    arg.type = 'info';
    this.create(arg, timer)
  }
  // 成功
  success(arg = {
    title: '成功'
  }, timer) {
    arg.type = 'success';
    this.create(arg, timer);
  }

  // 成功
  warning(arg = {
    title: '警告',
  }, timer) {
    arg.type = 'warning';
    this.create(arg, timer);
  }

  // 成功
  error(arg = {
    title: '错误',
  }, timer) {
    arg.type = 'error';
    this.create(arg, timer);
  }

  message(arg = {
    title: '张怀若,你那里还好吗?',
  }, timer) {
    arg.type = 'message';
    this.create(arg, timer);
  }

  // 添加class
  addClass(element, className) {
    if (!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))) {
      element.className += ' ' + className;
    }
    return element;
  }

  // 移除class
  removeClass(element, className) {
    if (element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))) {
      element.className = element.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), '')
    }
    return element;
  }

  // copy属性
  extendCopy(toobj = {}, pamras = {}) {
    for (let i in pamras) {　　　　　　
      toobj[i] = pamras[i];　　　　
    }
    return toobj;　　
  }
}
// 实例
let ytoaster = new Ytoastr();
const s = ['info', 'success', 'warning', 'error', 'message', 'clear', 'remove'];

let toastr = {
  config: (params) => {
    ytoaster.extendCopy(ytoaster, params)
  }
}

s.forEach((func) => {
  toastr[func] = (params) => {
    return ytoaster[func](params)
  }
})

export {
  toastr
};
