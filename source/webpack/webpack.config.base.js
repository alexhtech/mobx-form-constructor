const webpack = require('webpack')
const { resolve } = require('path')

module.exports.default = {
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@common': resolve(__dirname, './src/components/common/'),
            '@config': resolve(__dirname, './config/'),
            '@constants': resolve(__dirname, './src/constants/'),
            '@utils': resolve(__dirname, './src/utils/'),
            '@api': resolve(__dirname, './src/api/'),
            '@assets': resolve(__dirname, './assets/')
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /(node_modules)/,
                enforce: 'pre',
                loader: 'eslint-loader',
                options: {
                    quiet: true,
                    failOnError: false,
                    failOnWarning: false,
                    emitError: false,
                    emitWarning: false
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: process.env.NODE_ENV === 'development' ? '"development"' : '"production"'
            }
        })
    ]
}
