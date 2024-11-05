const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/js/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new Dotenv()
    ],
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.resolve(__dirname, 'src/')
        }
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '/'),
        },
        compress: true,
        port: 9000,
        hot: true
    }
};