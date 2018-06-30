import * as React from 'react'
import { render } from 'react-dom'
import createBrowserHistory from 'history/createBrowserHistory'
import App from './components/App'
import RootStore from './stores'

const history = createBrowserHistory()
const store = RootStore.create({}, { history })

if (process.env.NODE_ENV !== 'production') {
    require('mst-middlewares').connectReduxDevtools(require('remotedev'), store)
}

render(<App history={history} store={store} />, document.getElementById('react-root'))
