import { login, logout, checkLogin } from '@/src/api/auth';

const state = () => {
  return {
    name: '',
  };
};

const mutations = {
  SET_NAME: (state, name) => {
    state.name = name;
  },
};

const actions = {
  // user login
  async login({ commit }, userInfo) {
    const { username, password } = userInfo;

    const res = await login(username, password);
    // FIXME 資料格式不對
    commit('SET_NAME', res.account);
  },

  async checkLogin({ commit }) {
    const res = await checkLogin();
    commit('SET_NAME', res.data.account);
  },

  // user logout
  async logout({ commit }) {
    await logout();
    commit('SET_NAME', '');
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
