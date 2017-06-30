import Vue from 'vue';
import VueI18n from 'vue-i18n';
import VueResource from 'vue-resource';


//init
Vue.use(VueI18n);
Vue.use(VueResource);

// i18n
import en from './i18n/en.json'; // 存放英文翻譯
import tw from './i18n/tw.json'; // 存放繁體中文翻譯


import App from './components/app.vue'
import Grid from './components/grid.vue'

const i18n = new VueI18n({
    locale: 'tw',
    messages: {
        en: en,
        tw: tw,
    }
});

new Vue({
    i18n,
    el: '#app',
    components: {
        App,
        Grid
    }
})
