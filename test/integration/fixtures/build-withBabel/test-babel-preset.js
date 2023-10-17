// a simple babel preset to ensure presets are merged and applied
module.exports = () => ({
  plugins: [
    ['replace-identifiers', { sum: 'replacedSum' }],
    ['babel-plugin-styled-components'],
  ],
});
