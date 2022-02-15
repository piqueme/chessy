// This Babel config is used ONLY for helping Jest strip Typescript types.
// We defer transpilation largely to other build tools like ESBuild.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react'],
    '@babel/preset-typescript',
    '@emotion/babel-preset-css-prop',
  ],
  plugins: [
    "@emotion",
    "babel-plugin-transform-import-meta",
  ]
};
