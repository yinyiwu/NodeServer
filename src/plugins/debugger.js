import Vue from 'vue';
import isFunction from 'lodash/fp/isFunction';
import isObject from 'lodash/fp/isObject';

export default (context, inject) => {
  const { app, store } = context;
  (() => {
    let vms = {};
    // extend Vue
    Vue.use((Vue) => {
      Vue.mixin({
        // 建立 vue 實體到 stack
        created() {
          let cmp = this;

          vms[cmp.uuid] = cmp;
        },
        // 新增 vue html attributes
        updated() {
          let cmp = this;

          if (isFunction(cmp.$el.setAttribute)) {
            cmp.$el.setAttribute('data_vue_id', cmp.uuid);
            if (cmp.$vnode && isObject(cmp.$vnode.componentOptions)) {
              cmp.$el.setAttribute('data_vue_tag', cmp.$vnode.componentOptions.tag);
            }
          }
        },
        destroyed() {
          let cmp = this;

          delete vms[cmp.uuid];
        }
      });
    });

    // export to window
    window.vueDebug = {
      context,
      getByUUID(uuid) {
        return vms[uuid];
      }
    };
  })();
};
