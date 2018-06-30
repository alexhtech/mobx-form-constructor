const merge = require('webpack-merge')
const { resolve } = require('path')
const { default: base } = require('./webpack.config.base')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const { ENTRY, OUTPUT_PATH = '../../dist', PUBLIC_PATH = '/dist/', INDEX_PATH = '../../index.html' } = process.env

module.exports = merge(base, {
    mode: 'production',
    entry: ENTRY ? `./src/components/App/${ENTRY}` : './src/index',
    output: {
        filename: '[name].[hash].js',
        path: resolve(__dirname, OUTPUT_PATH),
        publicPath: PUBLIC_PATH,
        chunkFilename: '[name].[hash].chunk.js'
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'awesome-typescript-loader',
                    options: {
                        configFileName: 'tsconfig.prod.json'
                    }
                }
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            sourceMap: true
        }),
        new HtmlWebpackPlugin({
            title: 'Powered by react',
            hash: true,
            template: resolve(__dirname, '../src/index.ejs'),
            filename: resolve(__dirname, INDEX_PATH),
            chunks: ['main'],
            chunksSortMode: 'none'
        })
    ]
})
