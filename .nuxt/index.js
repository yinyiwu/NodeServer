import Vue from 'vue'
import Meta from 'vue-meta'
import { createRouter } from './router.js'
import NoSsr from './components/no-ssr.js'
import NuxtChild from './components/nuxt-child.js'
import NuxtError from './components/nuxt-error.vue'
import Nuxt from './components/nuxt.js'
import App from './App.js'
import { setContext, getLocation, getRouteData, normalizeError } from './utils'
import { createStore } from './store.js'

/* Plugins */

import nuxt_plugin_axios_6a701f27 from 'nuxt_plugin_axios_6a701f27' // Source: ./axios.js (mode: 'all')
import nuxt_plugin_vueErrorHandler_a6ff1910 from 'nuxt_plugin_vueErrorHandler_a6ff1910' // Source: ../src/plugins/vueErrorHandler (mode: 'client')
import nuxt_plugin_vueContext_c90f6ece from 'nuxt_plugin_vueContext_c90f6ece' // Source: ../src/plugins/vueContext (mode: 'client')
import nuxt_plugin_extendVue_d2fa1a88 from 'nuxt_plugin_extendVue_d2fa1a88' // Source: ../src/plugins/extendVue (mode: 'client')
import nuxt_plugin_awaitCatch_0a765b56 from 'nuxt_plugin_awaitCatch_0a765b56' // Source: ../src/plugins/awaitCatch (mode: 'client')
import nuxt_plugin_axios_7f8259b4 from 'nuxt_plugin_axios_7f8259b4' // Source: ../src/plugins/axios (mode: 'client')
import nuxt_plugin_locale_59df1daa from 'nuxt_plugin_locale_59df1daa' // Source: ../src/plugins/locale (mode: 'client')
import nuxt_plugin_preInit_8a6545fa from 'nuxt_plugin_preInit_8a6545fa' // Source: ../src/plugins/preInit (mode: 'client')
import nuxt_plugin_init_fbd3ef40 from 'nuxt_plugin_init_fbd3ef40' // Source: ../src/plugins/init (mode: 'client')
import nuxt_plugin_elementui_6e376356 from 'nuxt_plugin_elementui_6e376356' // Source: ../src/plugins/element-ui (mode: 'client')
import nuxt_plugin_debugger_0de96f71 from 'nuxt_plugin_debugger_0de96f71' // Source: ../src/plugins/debugger (mode: 'client')

// Component: <NoSsr>
Vue.component(NoSsr.name, NoSsr)

// Component: <NuxtChild>
Vue.component(NuxtChild.name, NuxtChild)
Vue.component('NChild', NuxtChild)

// Component NuxtLink is imported in server.js or client.js

// Component: <Nuxt>`
Vue.component(Nuxt.name, Nuxt)

// vue-meta configuration
Vue.use(Meta, {
  keyName: 'head', // the component option name that vue-meta looks for meta info on.
  attribute: 'data-n-head', // the attribute name vue-meta adds to the tags it observes
  ssrAttribute: 'data-n-head-ssr', // the attribute name that lets vue-meta know that meta info has already been server-rendered
  tagIDKeyName: 'hid' // the property name that vue-meta uses to determine whether to overwrite or append a tag
})

const defaultTransition = {"name":"page","mode":"out-in","appear":true,"appearClass":"appear","appearActiveClass":"appear-active","appearToClass":"appear-to"}

async function createApp(ssrContext) {
  const router = await createRouter(ssrContext)

  const store = createStore(ssrContext)
  // Add this.$router into store actions/mutations
  store.$router = router

  // Create Root instance

  // here we inject the router and store to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = {
    router,
    store,
    nuxt: {
      defaultTransition,
      transitions: [ defaultTransition ],
      setTransitions(transitions) {
        if (!Array.isArray(transitions)) {
          transitions = [ transitions ]
        }
        transitions = transitions.map((transition) => {
          if (!transition) {
            transition = defaultTransition
          } else if (typeof transition === 'string') {
            transition = Object.assign({}, defaultTransition, { name: transition })
          } else {
            transition = Object.assign({}, defaultTransition, transition)
          }
          return transition
        })
        this.$options.nuxt.transitions = transitions
        return transitions
      },
      err: null,
      dateErr: null,
      error(err) {
        err = err || null
        app.context._errored = Boolean(err)
        err = err ? normalizeError(err) : null
        const nuxt = this.nuxt || this.$options.nuxt
        nuxt.dateErr = Date.now()
        nuxt.err = err
        // Used in src/server.js
        if (ssrContext) ssrContext.nuxt.error = err
        return err
      }
    },
    ...App
  }

  // Make app available into store via this.app
  store.app = app

  const next = ssrContext ? ssrContext.next : location => app.router.push(location)
  // Resolve route
  let route
  if (ssrContext) {
    route = router.resolve(ssrContext.url).route
  } else {
    const path = getLocation(router.options.base)
    route = router.resolve(path).route
  }

  // Set context to app.context
  await setContext(app, {
    route,
    next,
    error: app.nuxt.error.bind(app),
    store,
    payload: ssrContext ? ssrContext.payload : undefined,
    req: ssrContext ? ssrContext.req : undefined,
    res: ssrContext ? ssrContext.res : undefined,
    beforeRenderFns: ssrContext ? ssrContext.beforeRenderFns : undefined,
    ssrContext
  })

  const inject = function (key, value) {
    if (!key) throw new Error('inject(key, value) has no key provided')
    if (typeof value === 'undefined') throw new Error('inject(key, value) has no value provided')
    key = '$' + key
    // Add into app
    app[key] = value

    // Add into store
    store[key] = app[key]

    // Check if plugin not already installed
    const installKey = '__nuxt_' + key + '_installed__'
    if (Vue[installKey]) return
    Vue[installKey] = true
    // Call Vue.use() to install the plugin into vm
    Vue.use(() => {
      if (!Vue.prototype.hasOwnProperty(key)) {
        Object.defineProperty(Vue.prototype, key, {
          get() {
            return this.$root.$options[key]
          }
        })
      }
    })
  }

  if (process.client) {
    // Replace store state before plugins execution
    if (window.__NUXT__ && window.__NUXT__.state) {
      store.replaceState(window.__NUXT__.state)
    }
  }

  // Plugin execution

  if (typeof nuxt_plugin_axios_6a701f27 === 'function') {
    await nuxt_plugin_axios_6a701f27(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_vueErrorHandler_a6ff1910 === 'function') {
    await nuxt_plugin_vueErrorHandler_a6ff1910(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_vueContext_c90f6ece === 'function') {
    await nuxt_plugin_vueContext_c90f6ece(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_extendVue_d2fa1a88 === 'function') {
    await nuxt_plugin_extendVue_d2fa1a88(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_awaitCatch_0a765b56 === 'function') {
    await nuxt_plugin_awaitCatch_0a765b56(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_axios_7f8259b4 === 'function') {
    await nuxt_plugin_axios_7f8259b4(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_locale_59df1daa === 'function') {
    await nuxt_plugin_locale_59df1daa(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_preInit_8a6545fa === 'function') {
    await nuxt_plugin_preInit_8a6545fa(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_init_fbd3ef40 === 'function') {
    await nuxt_plugin_init_fbd3ef40(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_elementui_6e376356 === 'function') {
    await nuxt_plugin_elementui_6e376356(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_debugger_0de96f71 === 'function') {
    await nuxt_plugin_debugger_0de96f71(app.context, inject)
  }

  // If server-side, wait for async component to be resolved first
  if (process.server && ssrContext && ssrContext.url) {
    await new Promise((resolve, reject) => {
      router.push(ssrContext.url, resolve, () => {
        // navigated to a different route in router guard
        const unregister = router.afterEach(async (to, from, next) => {
          ssrContext.url = to.fullPath
          app.context.route = await getRouteData(to)
          app.context.params = to.params || {}
          app.context.query = to.query || {}
          unregister()
          resolve()
        })
      })
    })
  }

  return {
    app,
    store,
    router
  }
}

export { createApp, NuxtError }
