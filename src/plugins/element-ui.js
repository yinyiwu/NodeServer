import Vue from 'vue';
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import locale from 'element-ui/lib/locale/lang/en';

Vue.use(Element, { locale });

export default ({ app, store }, inject) => {
  inject('notify', Element.Notification);
  inject('msgbox', Element.MessageBox);
  inject('alert', Element.MessageBox.alert);
  inject('confirm', Element.MessageBox.confirm);
  inject('prompt', Element.MessageBox.prompt);
}