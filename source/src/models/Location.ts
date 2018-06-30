import { types } from 'mobx-state-tree'

const Location = types.model('Location', {
    pathname: types.string,
    search: types.maybe(types.string),
    key: types.maybe(types.string),
    hash: types.maybe(types.string)
})

export type ILocation = typeof Location.Type
export default Location
