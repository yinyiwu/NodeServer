const checkPrivillege = (privilege) => {
  const { vueContext } = require('@/src/plugins/vueContext');
  const { store } = vueContext;
  const items = store.state.permission.privileges;
  const privilegeArray = [];
  privilegeArray.push(privilege);
  let pass = false;
  items.forEach((item) => {
    if (privilegeArray.includes(item)) {
      pass = true;
    }
  });
  if (!pass) {
    return false;
  }
  return true;
};

export default checkPrivillege;
