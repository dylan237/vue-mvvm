class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm
    // 1. 將根元素內所有元素放入fragement(記憶體)，減少頁面重繪造成的效能瓶頸
    const fragment = this.node2Fragment(this.el)
    // 2. 編譯模板，directive (v-???) 和 {{ }}
    this.compile(fragment)
    // 3. 將編譯完成的fragment，插入到綁定的根元素上
    this.el.appendChild(fragment)
  }
  compile(fragment) {
    // 1. 獲取子元素
    const childNodes = fragment.childNodes
    Array.from(childNodes).forEach(child => {
      if (this.isElementNode(child)) {
        // 是元素
        this.compileElement(child)
      } else {
        // 是 {{}}
        this.compileMustache(child)
      }

      // 如果元素中還有子元素、再進行遞歸編譯
      if (child.childNodes && child.childNodes.length) {
        this.compile(child)
      }
    })
  }
  compileElement(node) {
    const attrs = node.attributes
    Array.from(attrs).forEach(attr => {
      const {
        name,
        value
      } = attr // attr -> v-model="person.name"
      if (this.isDirective(name)) { // name -> v-model v-on:click...
        const [, directiveName] = name.split('-') // directiveName -> model on:click...
        const [newDirectiveName, eventName] = directiveName.split(':') // 處理 on:click 字串，newDirectiveName ->  model on , eventName -> click
        compileUtil[newDirectiveName](node, value, this.vm, eventName) // 根據不同的 directive 進行個別處理
        // 刪除 HTML 標籤上的 directive 符號
        node.removeAttribute('v-' + directiveName)
      } else if (this.isEventAlias(name)) { // 處理事件綁定alias @click
        let [, eventName] = name.split('@')
        compileUtil['on'](node, value, this.vm, eventName)
      }
    })
  }
  compileMustache(node) {
    const nodeContent = node.textContent
    const regexp = /\{\{(.+?)\}\}/g // 驗證是否是 {{ }} 語法
    if (regexp.test(nodeContent)) {
      compileUtil['text'](node, nodeContent, this.vm)
    }
  }
  node2Fragment(el) {
    let fragment = document.createDocumentFragment()
    let firstChild
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild)
    }
    return fragment
  }
  // 判斷元素內的 attributes 是否包含 @ 關鍵字
  isEventAlias(attrName) {
    return attrName.includes('@')
  }
  // 判斷元素內的 attributes 是否包含 v- 關鍵字
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  // 判斷是鬍鬚還是元素，是元素則回傳 true
  isElementNode(node) {
    return node.nodeType === 1
  }
}

const compileUtil = {
  getContentVal(expr, vm) {
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      const content = args[1].trim()
      return this.epxrHandler.getVal(content, vm)
    })
  },
  text(node, expr, vm) { // node: 綁定 directive 的元素 expr: v-text="這裏的值" vm: 實例，用來取得 expr 對應的 $data 內的資料
    let value
    if (expr.includes('{{')) {
      value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
        const content = args[1].trim()
        new Watcher(vm, content, (newVal) => {
          this.updater.textUpdater(node, this.getContentVal(expr, vm))
        })
        return this.epxrHandler.getVal(content, vm)
      })
    } else {
      value = this.epxrHandler.getVal(expr, vm)
      new Watcher(vm, expr, (newVal) => {
        this.updater.textUpdater(node, newVal)
      })
    }
    this.updater.textUpdater(node, value)
  },
  html(node, expr, vm) {
    const value = this.epxrHandler.getVal(expr, vm)
    new Watcher(vm, expr, (newVal) => {
      this.updater.htmlUpdater(node, newVal)
    })
    this.updater.htmlUpdater(node, value)
  },
  model(node, expr, vm) {
    const value = this.epxrHandler.getVal(expr, vm)
    new Watcher(vm, expr, (newVal) => {
      this.updater.modelUpdater(node, newVal)
    })
    node.addEventListener('input', (e) => {
      const newValue = e.target.value;
      this.epxrHandler.setVal(expr, vm, newValue)
    })
    this.updater.modelUpdater(node, value)
  },
  on(node, expr, vm, eventName) {
    const callback = vm.$options && vm.$options.methods[expr]
    node.addEventListener(eventName, callback.bind(vm), false) // 需重新指向this為vm，否則this指向為綁定事件的dom元素
  },
  epxrHandler: {
    // 有時可能會有 v-model="person.name" 這種物件的形式，若不做處理，this.$data['person.name'] 是沒辦法取到物件內的值的
    getVal(expr, vm) {
      console.log(expr);
      // input: expr -> person.name, output -> 'Dylan'
      return expr.split('.').reduce((data, currentValue) => {
        return data[currentValue]
      }, vm.$data)
    },
    setVal(expr, vm, inputVal) {
      return expr.split('.').reduce((prev, next, currentIndex) => {
        console.log(next);
        if (currentIndex === expr.split('.').length - 1) {
          return prev[next] = inputVal;
        }
        return prev[next];
      }, vm.$data)
    }
  },
  // 更新方法
  updater: {
    textUpdater(node, value) {
      node.textContent = value
    },
    htmlUpdater(node, html) {
      node.innerHTML = html
    },
    modelUpdater(node, value) {
      node.value = value
    },
  }
}

class Mvue {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    this.$options = options

    if (this.$el) {
      // 1. 實現一個觀察者 observe
      new Observe(this.$data)
      // 2. 實現一個指令解析器 compiler
      new Compile(this.$el, this)
      this.proxyData(this.$data)
    }
  }
  proxyData(data) {
    for (const key in data) {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newVal) {
          data[key] = newVal
        }
      })
    }
  }
}