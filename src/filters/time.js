import Vue from 'vue';
import format from 'date-fns/format';

Vue.filter('time', (value, formatStr) => {
  let result = '';

  if (value) {
    result = format(value, formatStr || 'YYYY/MM/DD HH:mm:ss');
  }

  return result;
});
