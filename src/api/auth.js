import { vueContext } from '@/src/plugins/vueContext';

// export const login = (username, password) => vueContext.app.$axios.post('/admin/operator/auth/login', {
//   username,
//   password
// });

export const checkLogin = () => ({
  "code":"common.success",
  "data":{
    "username":"yangyiwu",
    "password":"*****",
    "ip":"127.0.0.1",
    "account":"吳洋毅"
  }
});

// export const logout = () => vueContext.app.$axios.post('/admin/operator/auth/logout');

export const getMenu = () => ({
  "code": "common.success",
  "data": [{
    "id": "1",
    "name": "OCR",
    "path": "ocr"
  }, {
    "id": "2",
    "name": "抄單",
    "path": "dailyOrder"
  }]
});

// export const getPrivilege = () => vueContext.app.$axios.post('/admin/operator/auth/privilege');
