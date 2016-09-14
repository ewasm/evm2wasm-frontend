const choo = require('choo')
const html = require('choo/html')
const sf = require('sheetify')
const evm2wasm = require('evm2wasm')
const app = choo()

// add global css
sf('./client.css', { global: true })

const scroll = sf`
  :host {
    overflow: scroll;
    width: 70%;
  }`

const demoEVMcode = '0x60606040526000357c010000000000000000000000000000000000000000000000000000000090048063771602F7146037576035565b005b60546004808035906020019091908035906020019091905050606A565b6040518082815260200191505060405180910390f35b6000818301905080505b9291505056'
const demoWastCode = compileEVM(demoEVMcode, true, true)

app.model({
  state: {
    evmCode: demoEVMcode,
    wastCode: demoWastCode,
    inlineOps: true,
    pprint: true
  },
  reducers: {
    compile: (data, state) => ({
      evmCode: data,
      wastCode: compileEVM(data, state.inlineOps, state.pprint)
    }),
    toggle: (data, state) => {
      const update = {}
      update[data] = !state[data]
      return update
    }
  }
})

const header = html`
  <header>
    <h1>EVM 2 EWASM</h1>
  </header>`

const footer = html`
  <footer>
   transcompiles EVM bytecode to <a href='https://github.com/ewasm/design'>ewasm</a> with <a href='https://github.com/ewasm/evm2wasm/'>evm2wasm</a> | <a href="https://github.com/ewasm/evm2wasm-frontend">source</a> | <a href="https://github.com/ewasm/evm2wasm-frontend/issues">issues</a>
  </footer>`

const mainView = (state, prev, send) => html `
  <main>
    <div>
      <textarea rows="30"cols="50" onchange=${(e) => send('compile', e.target.value)}>${demoEVMcode}</textarea>
      <br>
      <input type="checkbox" checked=${state.inlineOps} onchange=${(e) => {
        send('toggle', 'inlineOps')
        send('compile', state.evmCode)
      }}></input>inline EVM opcodes
      <input type="checkbox" checked=${state.pprint} onchange=${(e) => {
        send('toggle', 'pprint')
        send('compile', state.evmCode)
      }}></input>pretty print
    </div>
    <div class=${scroll}>
      <code>${state.wastCode}</code>
    </div>
  </main>`

app.router((route) => [
  route('/', mainView)
])

const tree = app.start()
document.body.appendChild(header)
document.body.appendChild(tree)
document.body.appendChild(footer)

function compileEVM (evm, inlineOps, pprint) {
  console.log(evm);
  return evm2wasm.evm2wast(new Buffer(evm.slice(2), 'hex'), {
    inlineOps: inlineOps,
    pprint: pprint
  })
}
