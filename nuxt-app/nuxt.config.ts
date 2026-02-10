export default defineNuxtConfig({
  ssr: true,
  devServer: {
    port: 3000
  },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    exposeConfig: true
  }
})