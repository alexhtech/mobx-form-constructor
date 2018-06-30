import { RouteConfig } from 'react-router-resolver'
import RootComponent from '../components/RootComponent'
import Counter from '../components/Counter'

const routes: RouteConfig[] = [
    {
        path: '/',
        component: RootComponent,
        routes: [
            {
                path: '/counter',
                component: Counter
            }
        ]
    }
]

export default routes
