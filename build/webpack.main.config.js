const path = require('path');
const nodeExternals = require('webpack-node-externals');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

module.exports = function(env) {
    return {
        target: 'electron-main',
        entry: {
            background: "./src/background.js",
        },
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, "../app"),
        },
        mode: env === "production" ? "production" : "development",
        node: {
        __dirname: false,
        __filename: false
        },
            
        externals: [nodeExternals({
            allowlist: [
                '@babel/runtime',
                'query-string',
                'decode-uri-component',
                'split-on-first',
                'filter-obj'
            ]
        })],

        resolve: {
            extensions: ['.js', '.json'],
            mainFields: ["main"],
            alias: {
                env: path.resolve(__dirname, `../config/env_${env}.json`),
                '~': path.resolve(__dirname, '../src/')
            }
        },

        devtool: "source-map",
        
        module: {
            rules: [
                {
                    test: /node_modules[/\\](bytebuffer)[/\\].+/,
                    resolve: {
                        aliasFields: ["main"]
                    }
                },
                {
                    test: /node_modules[/\\](lzma)[/\\].+/,
                    resolve: {
                        aliasFields: ["main"]
                    }
                }
            ]
        },
  
        plugins: [
            new FriendlyErrorsWebpackPlugin({
                clearConsole: env === "development",
                onErrors: function (severity, errors) {
                    console.log({severity, errors})
                },
            })
        ]
    };
};
