import defaultSettings from '@/src/config/settings';

const { showSettings, fixedHeader, sidebarLogo } = defaultSettings;

const state = () => {
  return {
    showSettings,
    fixedHeader,
    sidebarLogo,
  };
};

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data);
  }
};

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    const hasProperty = Object.prototype.hasOwnProperty.call(state, key);
    if (hasProperty) {
      state[key] = value;
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
