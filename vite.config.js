import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
    plugins: command === 'serve' ? [vue(), tailwindcss()] : [vue()],
    resolve: {
        dedupe: ['vue', 'pinia']
    },
    build: {
        lib: {
            entry: './src/index.js',
            name: 'ShTailwind',
            formats: ['es', 'cjs'],
            fileName: (format) => `sh-tailwind.${format}.js`
        },
        rollupOptions: {
            external: ['vue', 'pinia', 'vue-router', '@iankibetsh/sh-core'],
            output: {
                globals: {
                    vue: 'Vue',
                    pinia: 'Pinia',
                    '@iankibetsh/sh-core': 'ShCore'
                }
            }
        }
    }
}))
