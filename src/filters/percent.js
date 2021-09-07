import Vue from 'vue';

Vue.filter('percent', (value) => {
  let str;

  value = value || 0;

  if (value < 1) {
    str = `${value * 100}%`;
  } else {
    str = `${value}%`;
  }

  return str;
});
