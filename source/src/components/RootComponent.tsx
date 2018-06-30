import * as React from 'react'
import { Link } from 'react-router-dom'
import { renderRoutes, RouteConfigComponentProps } from 'react-router-config'

export default ({ route }: RouteConfigComponentProps<{}>) => (
    <div>
        <Link to="/counter">counter</Link>
        {renderRoutes(route && route.routes)}
    </div>
)
