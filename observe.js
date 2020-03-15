class Observe {
  constructor(data) {
    this.observe(data)
  }

/**
* 判斷資料是否為物件，是的話透過Object.keys 分別取出key 和key 的值
* 
* @method observe
* @param {Object} data
*/
  // 觀察者模式綁定
  observe(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        // console.log(key);
        this.defineReactive(data, key, data[key])
      })
    }
  }
  /**
  * 透過 ES6 語法 Object.defineProperty 為 $data 值增添 getter及 setter
  *
  * @method defineReactive
  * @param {Object} data vm.$data
  * @param {String} key vm.$data 內的 key 值
  * @param {Any} keyValue key 的值
  */
  defineReactive(data, key, keyValue) {
    const that = this
    // 如果內部值是依然是物件時再次進行遍歷(遞歸)
    this.observe(keyValue)
    // 劫持數據(添加 getter setter)
    Object.defineProperty(data, key, {
      enumerable: true,    // 是否可遍歷
      configurable: false, // 是否可更改
      get() {
        return keyValue
      },
      set(newVal) {
        // 避免資料重新assign 成一個新物件時造成監聽失效，如：vm.$data.xxxx = {a: 1}，因此重新賦值時要在做一次監聽
        that.observe(newVal)
        // 新舊值比對，若不同則自動更新
        if (newVal !== keyValue) {
          keyValue = newVal
        }
      }
    })
  }
}