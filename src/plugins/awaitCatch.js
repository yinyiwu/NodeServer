export default ({ app, store }, inject) => {
  // 自動處理 await catch
  const awaitCatch = async (promise, catchFn = app.$noop) => {
    let result = true;

    try {
      await promise();
    } catch (e) {
      result = false;
      const { response } = e;
      const hasResponse = !!response;

      // 是否為 response error
      if (!hasResponse) { console.error(e); }
      catchFn(e, hasResponse);
    }

    return result;
  }

  inject('awaitCatch', awaitCatch);
}
