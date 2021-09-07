import 'nprogress/nprogress.css'; // progress bar style
import NProgress from 'nprogress'; // progress bar
import { $t } from '@/src/plugins/locale';
import getPageTitle from '@/src/utils/get-page-title';

export default (context, inject) => {
  const { app, store } = context;
  const { router } = app;

  NProgress.configure({ showSpinner: false }); // NProgress Configuration

  router.beforeEach(async (to, from, next) => {
    // start progress bar
    NProgress.start();
    // set page title
    document.title = getPageTitle($t(to.meta.title));
    // in the free login whitelist, go directly
    next();
  });

  router.afterEach(() => {
    // finish progress bar
    NProgress.done();
  });
};
