module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          assets: './src/assets',
          components: './src/components',
          hooks: './src/hooks',
          screens: './src/screens',
          services: './src/services',
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
    'module:react-native-dotenv',
    'react-native-reanimated/plugin',
  ],
}
