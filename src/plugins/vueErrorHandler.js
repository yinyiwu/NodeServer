import Vue from 'vue';

export default ({ app, store }) => {
  // vue-element-admin
  // Vue.config.errorHandler = function errorHandle(err, vm, info) {
  //   // Don't ask me why I use Vue.nextTick, it just a hack.
  //   // detail see https://forum.vuejs.org/t/dispatch-in-vue-config-errorhandler-has-some-problem/23500
  //   Vue.nextTick(() => {
  //     store.dispatch('errorLogaddErrorLog', {
  //       err,
  //       vm,
  //       info,
  //       url: window.location.href,
  //     });
  //     console.error(err, info);
  //   });
  // };

  let defaultErrorHandler = Vue.config.errorHandler;

  Vue.config.errorHandler = function errorHandle(err, vm, info) {
    Vue.nextTick(() => {
      if (err.response) {
        console.error(err, info);
      } else {
        defaultErrorHandler(err, vm, info);
      }
    });
  };
}
