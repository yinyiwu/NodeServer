import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'

const _6e8f7d5c = () => interopDefault(import('../src/pages/404.vue' /* webpackChunkName: "src/pages/404" */))
const _76c66964 = () => interopDefault(import('../src/pages/dailyOrder/index.vue' /* webpackChunkName: "src/pages/dailyOrder/index" */))
const _57f63274 = () => interopDefault(import('../src/pages/login/index.vue' /* webpackChunkName: "src/pages/login/index" */))
const _6948bebb = () => interopDefault(import('../src/pages/ocr/index.vue' /* webpackChunkName: "src/pages/ocr/index" */))
const _c13a2928 = () => interopDefault(import('../src/pages/index.vue' /* webpackChunkName: "src/pages/index" */))

Vue.use(Router)

const scrollBehavior = function(to, from, savedPosition) {
      return {
        x: 0,
        y: 0
      };
    }

export function createRouter() {
  return new Router({
    mode: 'history',
    base: decodeURI('/'),
    linkActiveClass: 'nuxt-link-active',
    linkExactActiveClass: 'nuxt-link-exact-active',
    scrollBehavior,

    routes: [{
      path: "/404",
      component: _6e8f7d5c,
      name: "404"
    }, {
      path: "/dailyOrder",
      component: _76c66964,
      name: "dailyOrder"
    }, {
      path: "/login",
      component: _57f63274,
      name: "login"
    }, {
      path: "/ocr",
      component: _6948bebb,
      name: "ocr"
    }, {
      path: "/",
      component: _c13a2928,
      name: "index"
    }],

    fallback: false
  })
}
