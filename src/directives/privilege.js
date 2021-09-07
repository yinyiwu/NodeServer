import Vue from 'vue';
import includes from 'lodash/includes';

const checkPrivilege = (el, binding) => {
  const { vueContext } = require('@/src/plugins/vueContext');
  const { store } = vueContext;
  const privilegeMap = store.state.permission.privileges;
  const privilegeKey = binding.value;
  if (!includes(privilegeMap, privilegeKey)) {
    if (el.parentNode === null) { return; }
    el.parentNode.removeChild(el);
  }
};

Vue.directive('privilege', {
  bind: checkPrivilege,
  inserted: checkPrivilege,
  update: checkPrivilege,
});
