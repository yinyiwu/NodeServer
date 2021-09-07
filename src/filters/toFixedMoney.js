import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { vueContext } from '@/src/plugins/vueContext';

Vue.filter('toFixedMoney', function (value) {
  const { store } = vueContext;
  let newValue = Number(value);
  let parseValue;
  let fixedNum;

  if (isNaN(newValue)) {
    newValue = value;
  } else {
    parseValue = new BigNumber(value);
    fixedNum = store.getters.getSystemConfig('system.config.currency.clientDecimalPlaces');
    newValue = parseValue.toFixed(fixedNum, BigNumber.ROUND_DOWN);
  }

  return newValue;
});
