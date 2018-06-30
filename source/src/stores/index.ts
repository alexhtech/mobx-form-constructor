import { types } from 'mobx-state-tree'
import Router from './Router'

const RootStore = types.model('RootStore', {
    app: '',
    router: types.optional(Router, {
        location: {
            pathname: window.location.pathname,
            search: window.location.search
        }
    })
})

export type IRootStore = typeof RootStore.Type
export default RootStore
