import { getMenu, getPrivilege } from '@/src/api/auth';
import { vueContext } from '@/src/plugins/vueContext';
// import router, { constantRoutes } from '@/src/config/router';
// import Layout from '@/src/layout/default';

// const makeMenuToAsyncRouter = (asyncRouterMap) => {
//   asyncRouterMap.forEach((item) => {
//     item.component = Layout;
//     if (item.children && item.children.length > 0) {
//       item.redirect = 'noRedirect';
//       item.path = `/${item.path}`;
//       item.meta = {
//         title: `route.${item.name}`,
//         icon: item.icon,
//       };
//       item.children.forEach((child) => {
//         if (child.children && child.children.length > 0) {
//           makeMenuToAsyncRouter(child.children);
//         } else {
//           child.component = () => import(`@/views/${item.name}/${child.name}/index`);
//           child.meta = {
//             title: `route.${child.name}`,
//             icon: child.icon,
//           };
//           delete child.icon;
//         }
//       });
//     } else {
//       item.path = `/${item.path}`;
//       item.children = [{
//         path: 'index',
//         name: `${item.name}/index`,
//         component: () => import(`@/views/${item.name}/index`),
//         meta: {
//           title: `route.${item.name}`,
//           icon: item.icon,
//         },
//       }];
//     }
//     delete item.icon;
//   });
//   const lastRoute = {
//     path: '*',
//     redirect: '/404',
//     hidden: true,
//   };
//   asyncRouterMap.push(lastRoute);
//   return asyncRouterMap;
// };


/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */
const makeMenuData = (_menu) => {
  const router = vueContext.router;
  let menu = _menu.slice();
  let menuData = [];

  menu.forEach((item) => {
    let newItem = {};

    newItem.name = item.name;

    if (item.children && item.children.length > 0) {
      newItem.redirect = 'noRedirect';
      newItem.path = `/${item.path}`;
      newItem.meta = {
        title: item.name,
        icon: item.icon,
      };
      newItem.children = [];
      item.children.forEach((child, index) => {
        let childItem = {};
        if (child.children && child.children.length > 0) {
          childItem = makeMenuData(child.children);
        } else {
          Object.assign(childItem, {
            name: child.name,
            path: child.path,
            meta: {
              title: child.name,
              icon: child.icon,
            }
          });
        }
        newItem.children.push(childItem);
      });
    } else {
      newItem.path = `/${item.path}`;
      newItem.children = [{
        path: '',
        name: `${item.name}/index`,
        meta: {
          title: item.name,
          icon: item.icon,
        },
      }];
    }
    
    menuData.push(newItem);
  });
  return menuData;
};

const state = () => {
  return {
    // routers: constantRoutes,
    routers: [],
    menu: [],
    privileges: [],
    menuData: [],
  };
};

const actions = {
  // async generateRoutes({ commit }) {
  //   const asyncRouterMap = await getMenu();
  //   const accessedRouters = makeMenuToAsyncRouter(asyncRouterMap.data);
  //   router.addRoutes(accessedRouters);
  //   commit('SET_ROUTERS', accessedRouters);
  // },

  async getMenu({ commit }) {
    const res = await getMenu();
    const menu = res.data;
    const menuData = makeMenuData(menu);
    commit('SET_MENU', menu);
    commit('SET_MENUDATA', menuData);
  },

  async getPrivileges({ commit }) {
    const res = await getPrivilege();
    commit('SET_PVIVILEGES', res.data.privilegeName);
  },
};

const mutations = {
  // SET_ROUTERS: (state, routers) => {
  //   state.routers = constantRoutes.concat(routers);
  // },
  SET_MENUDATA: (state, paylod) => {
    state.menuData = paylod;
  },
  SET_MENU: (state, paylod) => {
    state.menu = paylod;
  },
  SET_PVIVILEGES: (state, paylod) => {
    state.privileges = paylod;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
