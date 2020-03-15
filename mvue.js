class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    this.vm = vm
    // 1. 獲取文檔碎片，放入記憶體，減少頁面重繪造成的效能瓶頸
    const fragment = this.node2Fragment(this.el)
    // 2. 編譯模板，directive (v-???) 和 {{ }}
    
    // 3. 將編譯完成的fragment，插入到綁定的根元素上
    this.el.appendChild(fragment)
  }
  node2Fragment (el) {
    let fragment = document.createDocumentFragment()
    let firstChild
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild)
    }
    return fragment
  }
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