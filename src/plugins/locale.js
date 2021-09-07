import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Cookies from 'js-cookie';
import elementENLocale from 'element-ui/lib/locale/lang/en'; // element-ui lang
import elementCNLocale from 'element-ui/lib/locale/lang/zh-CN';// element-ui lang
import elementTWLocale from 'element-ui/lib/locale/lang/zh-TW';// element-ui lang
import enLocale from '@/src/locale/lang/en';
import cnLocale from '@/src/locale/lang/zh-Hans';
import twLocale from '@/src/locale/lang/zh-Hant';

Vue.use(VueI18n);

const messages = {
  'en': {
    ...enLocale,
    ...elementENLocale,
  },
  'zh-Hans': {
    ...cnLocale,
    ...elementCNLocale,
  },
  'zh-Hant': {
    ...twLocale,
    ...elementTWLocale,
  },
};

const port = location.port;
const languageKey = `${port}-Language`;
const i18n = new VueI18n({
  locale: Cookies.get(languageKey) || 'zh-Hant', // set locale
  messages, // set locale messages
});

const _$t = i18n.t.bind(i18n);
Object.assign(Vue.prototype, { $t: _$t });

export default ({ app, store }) => {
  store.$t = _$t;
}

export const $i18n = i18n
export const $t = _$t;
