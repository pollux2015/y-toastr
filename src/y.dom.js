class Ydom {
  constructor(args) {
    this.elements = [];
    if (typeof args == 'string') {
      // 传进来的 字符串 有包含空格 ydom('.cp span')
      if (args.indexOf(' ') != -1) {
        let ele = args.split(' ');
        let childElements = [];
        let node = [];
        for (let i = 0; i < ele.length; i++) {
          if (node.length == 0)
            node.push(document);
          switch (ele[i].charAt(0)) {
            case '#':
              childElements = [];
              childElements.push(this.getId(ele[i].substring(1)));
              node = childElements;
              break;
            case '.':
              childElements = [];
              for (let j = 0; j < node.length; j++) {
                let temps = this.getClassName(ele[i].substring(1), node[j]);
                for (let k = 0; k < temps.length; k++) {
                  childElements.push(temps[k]);
                }
              }
              node = childElements;
              break;
            default:
              childElements = [];
              for (let j = 0; j < node.length; j++) {
                // 这里的 node 是上一次的子节点，在这一次变成了父节点来为这次的子节点做遍历！！！
                let temps = this.getTagName(ele[i], node[j]);
                for (let k = 0; k < temps.length; k++) {
                  childElements.push(temps[k]);
                }
              }
              // 遍历的子节点变成父节点，供给下一次子节点的子节点用。
              node = childElements;
          }
        }
        this.elements = childElements;
      } else {
        // find 模拟  如  $('.cp')find('span').css('color','red');
        switch (args.charAt(0)) {
          case '#':
            this.elements.push(this.getId(args.substring(1)));
            break;
          case '.':
            this.elements = this.getClassName(args.substring(1))
            break;
          default:
            this.elements = this.getTagName(args);
        }
      }
    } else if (typeof args == 'object') {
      // args 是一个对象，对象不存在就是 undefined ，而不是 ‘undefined’，带引号的是对象的类型，
      if (args != undefined) {
        this.elements[0] = args;
      }
    }
  }

  // 通过获取ID
  getId(id) {
    return document.getElementById(id);
  }

  // 通过名称获取
  getName(name) {
    const tags = document.getElementsByName(name);
    for (let i = 0; i < tags.length; i++) {
      this.elements.push(tags[i]);
    }
  }

  // 通过标签名获取
  getTagName(tagName, parentNode) {
    let temps = [];
    let node = parentNode ? parentNode : document;
    let tags = node.getElementsByTagName(tagName);
    for (let t = 0; t < tags.length; t++) {
      temps.push(tags[t]);
    }
    return temps;
  }

  // 通过ClassName获取
  getClassName(className, parentNode) {
    let temps = [];
    let node = parentNode ? parentNode : document;
    let tags = node.getElementsByClassName(className);
    for (let t = 0; t < tags.length; t++) {
      if ((new RegExp('(\\s|^)' + className + '(\\s|$)')).test(tags[t].className)) {
        temps.push(tags[t]);
      }
    }
    return temps;
  }

  // 添加class
  addClass(className) {
    for (let i = 0; i < this.elements.length; i++) {
      // 利用正则表达式 判断 添加的 classname 是否已经存在；
      // (\\s|^) 表示 空格或重第一个开始判断， (\\s|$) 表示 空格或 结束
      if (!this.elements[i].className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))) {
        this.elements[i].className += ' ' + className;
      }
    }
    return this;
  }

  removeClass(className) {
    for (let i = 0; i < this.elements.length; i++) {
      // 先做个正则表达式 判断 是否存在 要替换的 class name ，
      if (this.elements[i].className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))) {
        // 如果存在，将 要替换的 name  = 空；再付给 elements[i]
        this.elements[i].className = this.elements[i].className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), '')
      }
    }
    return this;
  }


  arrt(attr, value) {
    for (let i = 0; i < this.elements.length; i++) {
      if (arguments.length == 1) {
        return this.elements[i].getAttribute(attr);
      } else if (arguments.length == 2) {
        return this.elements[i].setAttribute(attr, value);
      }
    }
    return this;
  }


  css(css_type, value) {
    //  js 调用属性有 两种方法 ，xx.xx 或 xx[xx] ，这里传进的是一个字符串，所以用  xx[xx]
    let tags = this.elements.length;
    for (let t = 0; t < tags; t++) {
      /*// 当只传进一个参数时，css_type，说明目的是为获取css样式，而不是设置，所以返回css 样式
       // 但这种方法有局限性，只能获取 行内 的 css 样式    <div id="div_id" style="color:red">  div_id  </div>
       if(arguments.length == 1){
       return this.elements[t].style[css_type];
       }*/
      if (typeof css_type == 'object') {
        for (let c in css_type) {
          this.elements[t].style[c] = css_type[c];
        }
      } else {
        //  接下来用第二中方法
        if (arguments.length == 1) {
          return this.getStyle(this.elements[t], css_type);
        }
        this.elements[t].style[css_type] = value;
      }
    }
    return this;
  }

  /**
   * 获取节点元素的 样式 的 值
   * @param element 节点
   * @param attr  样式
   * @returns {*} 样式的值
   */
  getStyle(element, attr) {
    if (typeof window.getComputedStyle != 'undefined') { // W3C
      return window.getComputedStyle(element, null)[attr];
    } else if (typeof element.currentStyle != 'underfined') { // IE
      return element.currentStyle[attr];
    }
  }

  html(str) {

    for (let t = 0; t < this.elements.length; t++) {

      // 当不传参数 直接 调用 .html（） 时，就 将原本的 innerHTML 返回，而不是设置 innerHTML；
      // 如  $().getTagName("p").html() ；
      if (arguments.length == 0) {
        return this.elements[t].innerHTML;
      }
      // 当有参数时 设置  innerHTML = str;
      this.elements[t].innerHTML = str;
    }
    return this;
  }


  append(element, str) {
    element.innerHTML += str;
  }

  click(fun) {
    for (let t = 0; t < this.elements.length; t++) {
      this.elements[t].onclick = fun;
    }
    return this;
  }

  /**
   * 鼠标的 移入 移出 事件
   * @param over
   * @param out
   * @returns {Zbase}
   */
  hover(over, out) {
    for (let t = 0; t < this.elements.length; t++) {
      this.elements[t].onmouseover = over;
      this.elements[t].onmouseout = out;
    }
    return this;
  }



}

const ydom = (args) => {
  return new Ydom(args);
}

export default ydom;
