const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development', // Dodaj tryb
    entry: './src/js/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Czyści folder dist przed każdym buildem
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true // Włącz cache dla szybszego budowania
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
        new Dotenv({
            systemvars: true,
            safe: true
        })
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
        hot: true,
        open: true, // Automatycznie otwiera przeglądarkę
        historyApiFallback: true, // Wsparcie dla routingu po stronie klienta
    },
    // Dodaj source maps dla trybu development
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
};