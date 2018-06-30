import * as React from 'react'
import { hot } from 'react-hot-loader'
import { renderRoutes } from 'react-router-config'
import Resolver from 'react-router-resolver'
import { Router } from 'react-router'
import { Provider } from 'mobx-react'
import { History } from 'history'
import { IRootStore } from '../stores'
import routes from '../routes'
import { ROUTER_INIT, ROUTER_LOCATION_CHANGE } from '../constants'

interface IApp {
    history: History
    store: IRootStore
}

const enum Status {
    loading = 0,
    loaded,
    fail
}

interface State {
    status: Status
}

class App extends React.Component<IApp, State> {
    state = {
        status: 0
    }
    resolver: Resolver

    createResolver = () => {
        const { history, store } = this.props
        this.resolver = new Resolver({
            helpers: {
                store
            },
            history,
            routes,
            actions: store.router
        })
    }

    render() {
        const { history, store } = this.props
        if (this.state.status === 0) {
            if (!this.resolver) this.createResolver()
            this.resolver.routes = routes
            try {
                this.resolver.init(history.location).then(() => {
                    history.listen(store.router[ROUTER_LOCATION_CHANGE])
                    store.router[ROUTER_INIT](history.location)
                    this.setState({ status: 1 })
                })
            } catch (e) {
                console.error(e)
                this.setState({ status: 2 })
            }
        }

        if (this.state.status === 2) return 'Error'

        return (
            <Provider {...store}>
                <Router history={history}>{renderRoutes(routes)}</Router>
            </Provider>
        )
    }
}

export default hot(module)(App)
