let _vueContext = {};

export default (ctx) => {
  Object.assign(_vueContext, ctx);
}

export const vueContext = _vueContext;
