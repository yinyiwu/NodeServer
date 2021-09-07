import Vue from 'vue'
import { $t } from '@/src/plugins/locale'

Vue.filter('translate', (value) => {
  return $t(value);
});
