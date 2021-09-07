import { vueContext } from '@/src/plugins/vueContext';

const putUserPW = (oldPW, newPW, repeatPW) =>
  vueContext.app.$axios.put('/admin/operator/changePW', {
    oldPW,
    newPW,
    repeatPW
  });

export default putUserPW;
