import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5178,
    proxy: {
      '^/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api/, () => {
            console.log('进入了proxy-api')
            return ''
          })
      }
    }
  },
  // css: {
  //   preprocessorOptions: {
  //     less: {
  //       additionalData: `@import '@/assets/css/base.less';`
  //     }
  //   }
  // }
})
