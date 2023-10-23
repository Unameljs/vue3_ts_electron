import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {ElectronDevPlugin} from './plugins/vite.electron.dev'
import {ElectronBuildPlugin} from './plugins/vite.electron.build'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  base:"./",
  plugins: [
    vue(),
    ElectronDevPlugin(),
    ElectronBuildPlugin(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
