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
  // 判斷是鬍鬚還是元素
  isElementNode (node) {
    return node.nodeType === 1
  }
}

class Mvue {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    this.$options = options

    if (this.$el) {
      // 1. 實現一個觀察者 observe

      // 2. 實現一個指令解析器 compiler
      new Compile(this.$el, this)
    }
  }
  
}