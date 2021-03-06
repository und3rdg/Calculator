// I don't see a reason to use jquery here and make js heavier

// jshint -W061
/* exported calculator */
/* global dbg, testSelectors, fontSize, multiEventListener */
var calculator = {
  init: function(){
    'use strict'
    dbg('calculator.init()')

    this.createEvents()
    // I can forEach it, but with only 2 elements readability is better.
    testSelectors(this.elements.btn)
    testSelectors(this.elements.display)
  },


  elements: {
    btn: {
      // Selecting elements by [class] or [id] is risky.
      // Someone can remove it while working with css and html
      // [data] is a signal that JS have to do some work here
      // Plus [data] can have a [value], what is super useful
      numbers   : document.querySelectorAll('[data-num]'),
      operators : document.querySelectorAll('[data-operator]'),
      equal     : document.querySelector('[data-equal]'),
      ac        : document.querySelector('[data-ac]'),
      save      : document.querySelector('[data-save]')
    },
    display:{
      top    : document.querySelectorAll('[data-display="top"]'),
      bottom : document.querySelectorAll('[data-display="bottom"]')
    },
  },


  storage: {
    calculationArr: [],
    calculationStr: '',
    equal: '',
    lastOperation: '',
  },


  createEvents: function(){
    'use strict'
    var that = this // little bit ugly but from time to time it's ok 
    function createBtnsArr(arr, item){
      arr.push(item)
      return arr
    }

    // A little bit not DRY, maybe refactor it later
    var numArr = Object.values(this.elements.btn.numbers).reduce(createBtnsArr, [])
    numArr.forEach(function(item){
      var value = item.dataset.num
      multiEventListener(item, 'click touchend', function(e){
        e.preventDefault()
        that.renderDisplay(value, 'number')
      })
    })

    var operatorsArr = Object.values(this.elements.btn.operators).reduce(createBtnsArr, [])
    operatorsArr.forEach(function(item){
      var value = item.dataset.operator
      multiEventListener(item, 'click touchend', function(e){
        e.preventDefault()
        that.renderDisplay(value, 'operator')
      })
    })

    multiEventListener(this.elements.btn.equal, 'click touchend', function(e){
      e.preventDefault()
      that.equal()
    })
      
    multiEventListener(this.elements.btn.ac, 'click touchend', function(e){
      e.preventDefault()
      that.clear()
    })
      
    multiEventListener(this.elements.btn.save, 'click touchend', function(e){
      if(!that.storage.calculationStr || that.storage.lastOperation === 'operator'){ 
        e.preventDefault()
        return 
      }
      that.equal()
    })
  },


  updateCalcArr: function(calcArr, value, type){
    'use strict'
    dbg('type:', type)
    dbg('val:', value)
    var lastIdx = calcArr.length - 1

    // only one dot in number string
    if(String(calcArr[lastIdx]).indexOf('.') !== -1 && value === '.'){
      return    // I like to break function as fast as it is possible
                // this way i can reduce nesting if's and remove else's
                // on top of that JS engine have less work
    }

    if(type === 'operator'){
      // first character should by digit or minus
      if(calcArr.length === 0 && value !== '-'){
        this.storage.lastOperation = type
        return
      }
      value = " " + value + " "
      // replace last operator with new one
      if(this.storage.lastOperation === type){
        this.storage.lastOperation = type
        calcArr[lastIdx] = value
        return
      }
      this.storage.lastOperation = type
      calcArr.push(value)
      return
    }

    // append digit, create number
    if(type === 'number'){
      if(this.storage.lastOperation === type){
        calcArr[lastIdx] += value
        this.storage.lastOperation = type
        return
      }
      // prepend 0 before dot
      value = value === '.' ? '0.' : value

      // append dot after 0
      value = calcArr && value === '0' ? '0.' : value

      calcArr.push(value)
      this.storage.lastOperation = type
      return
    }

  },


  calcArrToStr: function(arr){
    'use strict'
    var str = arr.join('')
    return str
  },
  

  renderDisplay: function(value, type){
    'use strict'

    this.updateCalcArr(this.storage.calculationArr, value, type)

    this.storage.calculationStr = this.calcArrToStr(this.storage.calculationArr)
    this.elements.display.top[0].textContent = this.storage.calculationStr
    this.elements.display.top[1].value = this.storage.calculationStr

    this.elements.display.bottom[0].textContent = ''
    this.elements.display.bottom[1].value = ''

    fontSize.init()
  },


  equal: function(){
    'use strict'
    dbg('equal()')
    if(!this.storage.calculationStr){ return }
    var equal = String(eval(this.storage.calculationStr))

    this.elements.display.top[0].textContent += ' ='
    this.elements.display.bottom[0].textContent = equal
    this.elements.display.bottom[1].value = equal

    fontSize.init()
  },


  clear: function(){
    "use strict"
    this.storage.calculationArr = []
    this.storage.calculationStr = ''
    this.storage.equal = ''
    this.storage.lastOperation = ''

    this.elements.display.top[0].textContent = ''
    this.elements.display.top[1].value = ''
    this.elements.display.bottom[0].textContent = ''
    this.elements.display.bottom[1].value = ''
  }

}
