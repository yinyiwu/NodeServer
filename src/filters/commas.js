import Vue from 'vue';

Vue.filter('commas', (value) => {
  let aIntNum = value.toString().split('.');
  let iIntPart = aIntNum[0];
  let iFlootPart = aIntNum.length > 1 ? `.${aIntNum[1]}` : '';
  const rgx = /(\d+)(\d{3})/;

  if (iIntPart.length >= 4) {
    while (rgx.test(iIntPart)) { iIntPart = iIntPart.replace(rgx, `$1,$2`) }
  }

  return iIntPart + iFlootPart;
});
