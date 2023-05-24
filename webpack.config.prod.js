require('@babel/polyfill');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ImageMinPlugin = require('imagemin-webpack-plugin').default;
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
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
            path: path.join(__dirname, 'dist'),
            filename: '[name].[fullhash].js',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
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
            new webpack.SourceMapDevToolPlugin({
                filename: '[name].js.map',
                exclude: ['bundle.js'],
            }),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].[fullhash].css',
                chunkFilename: '[id].[fullhash].css',
            }),
            new HtmlWebpackPlugin({
                filename: './index.html',
                template: './src/index.html',
            }),
        ],
        optimization: {
            minimizer: [
                new UglifyJSPlugin({ sourceMap: true }),
                new ImageMinPlugin({
                    test: /\.(png|jpe?g|gif|svg)$/,
                }),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: { sourceMap: true },
                }),
            ],
        },
    }
};