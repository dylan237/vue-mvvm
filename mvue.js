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
    Array.from(childNodes).forEach( child => {

      if (this.isElementNode(child)) {
        // 是元素
        this.compileElement(child)
      } else {
        // 是 {{}}
        this.compileText(child)
      }

      // 如果元素中還有子元素、再進行遞歸編譯
      if (child.childNodes && child.childNodes.length) {
        this.compile(child)
      }
    })
  }
  compileElement(node) {
    const attrs = node.attributes
    Array.from(attrs).forEach( attr => {
      const { name, value } = attr // attr -> v-model="person.name"
      if (this.isDirective(name)) { // name -> v-model v-on:click...
        const [, directiveName] = name.split('-') // directiveName -> model on:click...
        const [newDirectiveName, eventName] = directiveName.split(':') // 處理 on:click 字串，newDirectiveName ->  model on , eventName -> click
        compileUtil[newDirectiveName](node, value, this.vm, eventName) // 根據不同的 directive 進行個別處理
        // 刪除 HTML 標籤上的 directive 符號
        node.removeAttribute('v-' + directiveName)
      }
    })
  }
  compileText(node) {
    
  }
  node2Fragment (el) {
    let fragment = document.createDocumentFragment()
    let firstChild
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild)
    }
    return fragment
  }
  // 判斷元素內的 attributes 是否包含 v- 關鍵字
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }
  // 判斷是鬍鬚還是元素，是元素則回傳 true
  isElementNode (node) {
    return node.nodeType === 1
  }
}

const compileUtil = {
  text(node, expr, vm) { // node: 綁定 directive 的元素; expr: v-text="這裏的值"; vm: 實例，用來取得 expr 對應的 $data 內的資料
    const value = this.epxrHandler.getVal(expr, vm.$data)
    this.updater.textUpdater(node, value)
  },
  html(node, expr, vm) {
    const value = this.epxrHandler.getVal(expr, vm.$data)
    this.updater.htmlUpdater(node, value)
  },
  model(node, expr, vm) {
    const value = this.epxrHandler.getVal(expr, vm.$data)
    this.updater.modelUpdater(node, value)
  },
  on(node, expr, vm, eventName) {
    const callback = this.epxrHandler.getVal(expr, vm.$methods)
    node.addEventListener(eventName, callback)
  },
  epxrHandler: {
    // 有時可能會有 v-model="person.name" 這種物件的形式，若不做處理，this.$data['person.name'] 是沒辦法取到物件內的值的
    getVal(expr, vmTarget) {
      // input: expr -> person.name, output -> 'Dylan'
      return expr.split('.').reduce((vmTarget, currentValue) => {
        return vmTarget[currentValue]
      }, vmTarget);
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
    this.$methods = options.methods
    this.$options = options

    if (this.$el) {
      // 1. 實現一個觀察者 observe

      // 2. 實現一個指令解析器 compiler
      new Compile(this.$el, this)
    }
  }
  
}