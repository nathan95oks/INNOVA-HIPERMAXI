import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      'react':                'preact/compat',
      'react-dom':            'preact/compat',
      'react/jsx-runtime':    'preact/jsx-runtime',
      'react/jsx-dev-runtime':'preact/jsx-runtime',
    },
  },
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'HXWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'widget.[ext]',
      },
    },
    minify: true,
    outDir: 'dist',
  },
})
