const state = () => ({
  ajaxStack: [], // 存放 ajaxId
  ajaxLoading: false // 顯示 ajaxLoading
})

const actions = {
  // ajax start, 將 ajaxId 放到 ajaxStack 並改變 ajaxLoading 狀態
  start({ commit }, ajaxId) {
    commit('ADDAJAXSTACK', ajaxId);
    commit('SWITCHLOADING', true);
  },
  // ajax success, 將 ajaxId 從 ajaxStack 移除並改變 ajaxLoading 狀態
  success({ commit }, ajaxId) {
    commit('REMOVEAJAXSTACK', ajaxId);
    commit('SWITCHLOADING', false);
  },
  // ajax fail, 將 ajaxId 從 ajaxStack 移除並改變 ajaxLoading 狀態
  fail({ commit }, ajaxId) {
    commit('REMOVEAJAXSTACK', ajaxId);
    commit('SWITCHLOADING', false);
  },
  // 清除 ajaxStack data
  clear: ({ commit }) => {
    commit('CLEARAJAXSTACK');
  },
}

const mutations = {
  ADDAJAXSTACK: (state, payload) => {
    state.ajaxStack.push(payload);
  },
  REMOVEAJAXSTACK: (state, payload) => {
    state.ajaxStack.splice(state.ajaxStack.indexOf(payload), 1);
  },
  SWITCHLOADING: (state, payload) => {
    if (payload) {
      state.ajaxLoading = true;
    } else if (state.ajaxStack.length < 1) {
      state.ajaxLoading = false;
    }
  },
  CLEARAJAXSTACK: (state, payload) => {
    state.ajaxStack = [];
    state.ajaxLoading = false;
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
