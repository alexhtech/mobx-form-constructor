const { resolve } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const { default: base } = require('./webpack.config.base')

module.exports = merge(base, {
    mode: 'development',
    entry: ['webpack-hot-middleware/client', './src/index'],
    output: {
        filename: '[name].js',
        publicPath: '/dist/',
        chunkFilename: '[name].chunk.js'
    },
    devtool: false,
    devServer: {
        hot: true,
        contentBase: resolve(__dirname, './public'),
        publicPath: '/'
    },
    optimization: {
        noEmitOnErrors: true
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: 'tsconfig.dev.json'
                        }
                    },
                    'babel-loader'
                ]
            }
        ]
    },
    plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin(), new ProgressBarPlugin()]
})
