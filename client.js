const choo = require('choo')
const html = require('choo/html')
const sf = require('sheetify')
const evm2wasm = require('evm2wasm')
const ethUtil = require('ethereumjs-util')
const sparser = require('s-expression')
const app = choo()

// add css
sf('./client.css', { global: true })

const demoEVMcode = '0x60606040526000357c010000000000000000000000000000000000000000000000000000000090048063771602F7146037576035565b005b60546004808035906020019091908035906020019091905050606A565b6040518082815260200191505060405180910390f35b6000818301905080505b9291505056'
const demoWastCode = compileEVM(demoEVMcode)

app.model({
  state: {
    wastCode: demoWastCode
  },
  reducers: {
    compile: (data, state) => ({
      wastCode: compileEVM(data)
    })
  }
})

const mainView = (state, prev, send) => html`
  <main>
    <h1>EVM 2 EWASM</h1>  transcompiles EVM bytecode to ewasm <br> <br>
    <textarea 
      rows="50"
      cols="50"
      onkeypress=${(e) => send('compile', e.target.value)}
    >${demoEVMcode}</textarea>
    <div>
      <code>${state.wastCode}</code>
    </div>
  </main>`

app.router((route) => [
  route('/', mainView)
])

const tree = app.start()
document.body.appendChild(tree)

function compileEVM (evm) {
  return format(
    sparser(
      evm2wasm.compileEVM(
        ethUtil.toBuffer(
          evm), false, false).replace(/[^\x20-\x7E]/gmi, '')))
}

function format (sexp, depth = 0) {
  depth++
  let string = '('
  sexp.forEach((i) => {
    if (Array.isArray(i)) {
      string += '\n' + ' '.repeat(depth * 2) + format(i, depth)
    } else {
      string += i + ' '
    }
  })
  string = string.slice(0, -1)
  return string + ')'
}
