import { types, getEnv } from 'mobx-state-tree'
import { Location } from 'history'
import { ROUTER_INIT, ROUTER_LOCATION_CHANGE } from '../constants'
import LocationModel, { ILocation } from '../models/Location'

export default types
    .model('RouterStore', {
        location: types.maybe(LocationModel),
        state: types.maybe(types.enumeration('State', ['loading', 'loaded', 'fail']))
    })
    .actions(self => ({
        onStart: () => {
            self.state = 'loading'
        },
        onSuccess: () => {
            self.state = 'loaded'
        },
        onFail: () => {
            self.state = 'fail'
        },
        [ROUTER_INIT]: (location: Location) => {
            self.location = location as ILocation
        },
        push: (to: Location) => {
            const { history } = getEnv(self)
            history.push(to)
        },
        replace: (to: Location) => {
            const { history } = getEnv(self)
            history.replace(to)
        },
        [ROUTER_LOCATION_CHANGE]: (location: Location) => {
            self.location = location as ILocation
        }
    }))
