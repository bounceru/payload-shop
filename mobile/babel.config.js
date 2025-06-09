module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    // overrides: [
    //   {
    //     test: /node_modules/,
    //     presets: [],
    //     plugins: [],
    //   },
    // ],
  }
}
