import Vue from 'vue';
import isUndefined from 'lodash/fp/isUndefined';

Vue.filter('currencySymbol', (value) => {
  let newString = value;

  if (!isUndefined(value)) { newString = `${Vue.options.filters.translate('common.currencySymbol')} ${value}` }

  return newString;
});
