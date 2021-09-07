import Vue from 'vue';
import VeeValidate, { Validator } from 'vee-validate';
import validateLocaleTw from 'vee-validate/dist/locale/zh_TW';
import dictionary from '@/src/utils/validator/translate';

const config = {
  fieldsBagName: 'veeFields',
};

Vue.use(VeeValidate, config);

Validator.localize('zh', {
  ...validateLocaleTw,
  messages: {
    ...validateLocaleTw.messages,
    ...dictionary,
  },
});

Validator.extend('includeAlpha_num', {
  validate: value => /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/.test(value),
});
