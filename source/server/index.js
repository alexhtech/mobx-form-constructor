const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const proxy = require('http-proxy-middleware')
const webpackConfig = require('../webpack/webpack.config.development')

const { APP_PROXY_TARGET, APP_DEV_SERVER_PORT = 3000 } = require('../config')

const app = express()
const compiler = webpack(webpackConfig)

app.use(
    webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        hot: true,
        stats: {
            colors: true
        },
        noInfo: true
    })
)
app.use(webpackHotMiddleware(compiler))
app.use(
    '/api',
    proxy({
        target: APP_PROXY_TARGET,
        changeOrigin: true
    })
)

const wsProxy = proxy({
    target: APP_PROXY_TARGET,
    changeOrigin: true,
    ws: true,
    onProxyReqWs: proxyReq => {
        proxyReq.setHeader('Origin', APP_PROXY_TARGET)
    }
})

app.use('/ws', wsProxy)

app.use('/static', express.static('./public/static'))

app.use((req, res) => {
    res.send(`
    <!DOCTYPE html>
        <html>
        <body>
            <div id='react-root'></div>
            <script src="/dist/main.js"></script>
        </body>
        </html>
    `)
})

const server = app.listen(APP_DEV_SERVER_PORT, () => {
    console.log(`Page server is listening on port ${APP_DEV_SERVER_PORT}!`)
})

server.on('upgrade', wsProxy.upgrade)
