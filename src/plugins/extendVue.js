import Vue from 'vue';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/fp/isFunction';
import isEmpty from 'lodash/fp/isEmpty';
import isUndefined from 'lodash/fp/isUndefined';
import isNull from 'lodash/fp/isNull';
import isString from 'lodash/fp/isString';
import isBoolean from 'lodash/fp/isBoolean';
import isNumber from 'lodash/fp/isNumber';
import cloneDeep from 'lodash/fp/cloneDeep';
import at from 'lodash/at';
import set from 'lodash/set';
import find from 'lodash/find';

// Set unique id
Vue.use((Vue) => {
  // Assign a unique id to each component
  let uuid = 0;
  Vue.mixin({
    beforeCreate() {
      this.uuid = `vue_${uuid}`;
      uuid += 1;
    },
  });
});

export default ({ app, store }, inject) => {
  const noop = () => {};

  inject('noop', noop);
  inject('isObject', isObject);
  inject('isFunction', isFunction);
  inject('isEmpty', isEmpty);
  inject('isUndefined', isUndefined);
  inject('isString', isString);
  inject('isBoolean', isBoolean);
  inject('isNull', isNull);
  inject('at', at);
  inject('set', set);
  inject('cloneDeep', cloneDeep);
  inject('isNumber', isNumber);
  inject('find', find);

  Object.assign(Vue.prototype, {
    // set filter to instance
    $filters: Vue.options.filters,
    // set isVueComponent 識別是否為vue object
    isVueComponent: true,
    // filterItems is Array, ex: [{name: 'fileterName', params: [params1, params2, ....] },{....}] or ['translate', 'time']
    processFilter(filterItems, value) {
      let cmp = this;
      let newValue = value;

      if (Array.isArray(filterItems)) {
        newValue = filterItems.reduce((acc, curr) => {
          try {
            let filterName = curr.name || curr;
            let filterValue = curr.params || [];
            let filter = cmp.$options.filters[filterName] || cmp.$filters[filterName];
            return filter ? filter(acc, ...filterValue) : acc;
          } catch (e) {
            throw new Error(`The processFilter is failed, please check filter params!`);
          }
        }, value)
      }

      return newValue;
    }
  });
}
