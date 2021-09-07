import Vue from 'vue';
import $template from 'lodash/template';
import isUndefined from 'lodash/isUndefined';
import { $t } from '@/src/plugins/locale';

let ajaxId = 0;

const isFloat = (n) => {
  return n === n && n !== (n | 0);
};

const customerHeader = {
  'AutoErrorPrint': true, // 自動處理錯誤訊息
  'AutoLoading': true, // 自動開啟 loading 頁面
  'OriRes': false // 取得原始 response
};

// 取得客制 Header 狀態
const getCustomerHeaderStatus = (httpHeaders) => {
  const status = Object.keys(customerHeader).reduce((acc, headerName) => {
    acc[headerName] = isUndefined(httpHeaders[headerName]) ? customerHeader[headerName] : JSON.parse(httpHeaders[headerName]);
    return acc;
  }, {});

  return status;
};

const axiosEvents = {
  // request 攔截
  onRequest: {
    // 新增 ajaxId 到 stack
    addAjaxStack({ $axios, route, redirect, store }) {
      return (config) => {
        if (process.server) { return config }

        const headerStatus = getCustomerHeaderStatus(config.headers);
        let interceptorStatus = headerStatus.AutoLoading;

        if (interceptorStatus) {
          ajaxId += 1;
          config.ajaxId = ajaxId;
          store.dispatch('ajax/start', ajaxId, { root: true });
        }

        return config;
      };
    }
  },
  // response 攔截
  onResponse: {
    // 移除 ajaxId 從 stack
    removeAjaxStack({ $axios, route, redirect, store }) {
      return (response) => {
        if (process.server) { return response }

        const config = response.config;
        const headerStatus = getCustomerHeaderStatus(config.headers);
        let interceptorStatus = headerStatus.AutoLoading;

        if (interceptorStatus) {
          store.dispatch('ajax/success', config.ajaxId);
        }

        return response;
      };
    },
    // FIXME, 因return 不是原本response, 需放在最後處理, 不然onResponse event接收的參數會是此event處理完的結果
    getData({ $axios, route, redirect, store }) {
      return (response) => {
        let result;
        let config = response.config;
        const headerStatus = getCustomerHeaderStatus(config.headers);

        if (headerStatus.OriRes) {
          result = response;
        } else {
          result = response.data;
        }

        return result;
      };
    }

  },
  // error 攔截
  onError: {
    // 移除 ajaxId 從 stack
    removeAjaxStack({ $axios, route, redirect, store }) {
      return (e) => {
        if (process.server) { return e }

        const { response: error } = e;
        try {
          const config = e.config;
          const headerStatus = getCustomerHeaderStatus(config.headers);
          let interceptorStatus = headerStatus.AutoLoading;

          if (interceptorStatus) {
            store.dispatch('ajax/fail', config.ajaxId, { root: true });
          }
        } catch (error) {
          console.error(new Error('The response mask interceptor is fail.'));
        }

        return Promise.reject(e);
      };
    },
    // 處理客製化 ajax error
    errorProcess({ app, axios, route, redirect, store }) {
      // BA-1613
      let axiosErrorCodeProcess = {
        'member.rank.notEnough': () => {
          store.dispatch('modal/openModal', {
            type: 'MemRankTip'
          });
        }
      };

      return (e) => {
        if (process.server) { return e }

        const { response: error } = e;
        try {
          let status = error.status ? error.status.toString() : undefined;
          let queryUrl = error.config.url;
          let processStatus = ['400', '403'];
          const headerStatus = getCustomerHeaderStatus(error.config.headers);
          let interceptorStatus = headerStatus.AutoErrorPrint;
          let isProcessStatus = processStatus.includes(status);
          let errorCodeFn;

          // 處理 401
          if (status === '401') {
            redirect('/login');
          }

          if (isProcessStatus && interceptorStatus) {
            if (error.data && error.data.code) {
              let msg = $t(error.data.code);
              let msgData = error.data.data || [];
              let parseValue;

              errorCodeFn = axiosErrorCodeProcess[error.data.code];

              // OCMS-595 小數六位調整, 錯誤訊息有符點數則調整
              Object.entries(msgData).forEach(([key, value], index) => {
                if (['number', 'string'].includes(typeof value)) {
                  parseValue = Number(value);

                  if (!isNaN(parseValue) && isFloat(parseValue)) {
                    msgData[key] = Vue.options.filters.toFixedMoney(value);
                  }
                }
              });

              if (msgData && msgData.field && msgData.field.length > 0) {
                // 欄位資料存在，組合欄位做顯示
                let msgField = $t(`common.${msgData.field}`);
                msg = `${msg}: ${msgField}`;
              } else if (/{{([\s\S]+?)}}/g.test(msg)) {
                // 有參數需要轉換
                msg = $template(msg, { interpolate: /{{([\s\S]+?)}}/g })(msgData);
              }

              app.$notify.error({
                title: $t('common.title'),
                message: msg
              });

              if (app.$isFunction(errorCodeFn)) {
                errorCodeFn();
              }
            } else {
              app.$notify.error({
                title: $t('common.title'),
                message: $t('common.error')
              });
            }
          }

          if (isUndefined(status)) {
            app.$notify.error({
              title: $t('common.title'),
              message: $t('common.error')
            });
          }
        } catch (error) {
          console.error(new Error('The response error interceptor is fail.'));
        }

        return Promise.reject(e);
      };
    }
  }
};

export default (ctx) => {
  const { $axios } = ctx;

  Object.entries(axiosEvents).forEach(([eventKey, value]) => {
    Object.entries(axiosEvents[eventKey]).forEach(([eventFnKey, eventFn]) => {
      $axios[eventKey](eventFn(ctx));
    });
  });
};
