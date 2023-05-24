require('@babel/polyfill');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = (env) => {
    console.log("API_BASE_URL: ", env.apiBaseUrl);

    return {
        devtool: false,
        entry: {
            bundle: [
                '@babel/polyfill',
            ],
            main: [
                './src/index.jsx',
                'antd/dist/antd.min.css',
                './src/assets/css/main.scss',
            ],
        },
        output: {
            filename: '[name].js',
        },
        devServer: {
            historyApiFallback: true,
            port: 3000,
            hot: true
        },
        module: {
            rules: [
                {
                    test: /\.(jsx?)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                            options: { sourceMap: true },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                postcssOptions: {
                                    plugins: [
                                        autoprefixer,
                                    ]
                                },
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: { sourceMap: true },
                        },
                    ],
                },
                {
                    test: /\.(ttf|eot|svg|png|jpg|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[path][name].[ext]',
                            },
                        },
                        'img-loader',
                    ],
                },
            ],
        },
        resolve: {
            // Allow require('./blah') to require blah.jsx
            extensions: ['*', '.js', '.jsx', '.tsx', '.ts', '.json']
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    devServer: true,
                },
                API_BASE_URL: env.apiBaseUrl,
            }),
            new webpack.ProvidePlugin({
                '__assign': ['@microsoft/applicationinsights-shims', '__assignFn'],
                '__extends': ['@microsoft/applicationinsights-shims', '__extendsFn']
                // '__assign': ['tslib', '__assign'],
                // '__extends': ['tslib', '__extends']
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'src/assets/images', to: 'images' },
                ]
            }),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map[query]',
                exclude: ['bundle.js'],
            }),
            new HtmlWebpackPlugin({
                filename: './index.html',
                template: './src/index.html',
            }),
        ],
    }
};