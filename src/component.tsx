import * as React from "react"
import * as ReactDOM from "react-dom"
import ElectronApp from './ElectronApp'

function App() {
  return <h1>Hello, react!</h1>
}

ReactDOM.render(<ElectronApp />, document.getElementById("app"))