import './scss/toastr.scss'

class Ytoastr {
  constructor() {

    this.toastrMap = {};
    this.currentIndex = 0;
    this.defaultPamras = {
      type: 'info',
      align: 'left',
      title: '标题',
      auto: true,
      width: 230, // px
      timeout: 3000,
      postion: 'top-right'
    }
  }

  create(params = {}) {
    params = this.extendCopy(this.defaultPamras, params);
    let wrapperEle = document.createElement('div');
    let titleEle = document.createElement('h4');
    let desEle = document.createElement('p');
    wrapperEle.setAttribute('class', `ytoastr-wrapper toastr-animated ytoastr-${ params.type } ytoastr-align-${params.align} ytoastr-position-${params.postion}`);
    wrapperEle.setAttribute('style', `display: none; width: ${params.width}px`);

    // addClass
    this.addClass(titleEle, 'ytoastr-title');
    this.addClass(desEle, 'ytoastr-des');

    // addCont
    titleEle.innerHTML = params.title;
    desEle.innerHTML = params.des;

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
        this.show(tid, params.postion);
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
    this.show(tid, params.postion);
    params.auto && setTimeout(() => {
      this.remove(tid);
    }, params.timeout);
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
  show(tid, position) {
    let tObject = this.toastrMap[tid] || {};
    let element = tObject.ele;
    if (!element) return;
    element.style.display = 'block';
    const w = element.offsetWidth;
    const h = element.offsetHeight;
    if (position == 'center') {
      this.css(element, {
        'marginTop': `-${h/2}px`,
        'marginLeft': `-${w/2}px`
      })
    } else if (position == 'top' || position == 'bottom') {
      const diff = w - this.defaultPamras.width;
      this.css(element, {
        'marginLeft': `${ diff > 0 ? '-' : ''}${diff/2}px`
      })
    }
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
  }) {
    arg.type = 'info';
    this.create(arg)
  }
  // 成功
  success(arg = {
    title: '成功'
  }) {
    arg.type = 'success';
    this.create(arg);
  }

  // 成功
  warning(arg = {
    title: '警告',
  }) {
    arg.type = 'warning';
    this.create(arg);
  }

  // 成功
  error(arg = {
    title: '错误',
  }) {
    arg.type = 'error';
    this.create(arg);
  }

  message(arg = {
    title: '张怀若,你那里还好吗?',
  }) {
    arg.type = 'message';
    this.create(arg);
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

  css(element, css_type, value) {
    // 赋值
    if (typeof css_type == 'object') {
      for (let c in css_type) {
        element.style[c] = css_type[c];
      }
    } else {
      if (arguments.length == 2) {
        return this.getStyle(elements, css_type);
      }
      element.style[css_type] = value;
    }
    return element;
  }

  getStyle(element, attr) {
    if (typeof window.getComputedStyle != 'undefined') { // W3C
      return window.getComputedStyle(element, null)[attr];
    } else if (typeof element.currentStyle != 'underfined') { // IE
      return element.currentStyle[attr];
    }
  }

  // copy属性
  extendCopy(toobj = {}, pamras = {}) {
    let newobj = this.copy(toobj);
    for (let i in pamras) {
      newobj[i] = pamras[i];
    }
    return newobj;
  }

  copy(obj) {
    let newobj = {};
    for (let attr in obj) {
      newobj[attr] = obj[attr];
    }
    return newobj;
  }
}
// 实例
let _toastr = new Ytoastr();
const s = ['info', 'success', 'warning', 'error', 'message', 'clear', 'remove'];

let ytoastr = {
  config: (params) => {
    _toastr.extendCopy(_toastr, params)
  }
}

s.forEach((func) => {
  ytoastr[func] = (params) => {
    return _toastr[func](params)
  }
})

export {
  ytoastr
}
