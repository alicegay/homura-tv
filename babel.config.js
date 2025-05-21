module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['babel-plugin-react-compiler', {}],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          api: './src/api',
          assets: './src/assets',
          components: './src/components',
          hooks: './src/hooks',
          screens: './src/screens',
          types: './src/types',
          lib: './src/lib',
        },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.ios.jsx',
          '.android.jsx',
          '.jsx',
          '.ios.js',
          '.android.js',
          '.js',
          '.json',
          '.svg',
        ],
      },
    ],
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
    ['wildcard', { exts: ['svg'], noModifyCase: true }],
    'react-native-reanimated/plugin',
  ],
}
