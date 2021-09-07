import Vue from 'vue';
import SvgIcon from '@/src/components/SvgIcon';// svg component
import '@/src/utils/validator';
import 'normalize.css/normalize.css'; // A modern alternative to CSS resets
import '@/src/assets/scss/index.scss'; // global css
import '@/src/directives';
import '@/src/filters';

Vue.config.productionTip = false;

// register globally
Vue.component('svg-icon', SvgIcon);
const req = require.context('@/src/assets/icons/svg', false, /\.svg$/);
const requireAll = requireContext => requireContext.keys().map(requireContext);
requireAll(req);

export default (context, inject) => {
  const { app, store } = context;
};
