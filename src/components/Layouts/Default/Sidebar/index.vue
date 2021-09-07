<template lang="pug">
  div(:class="{'has-logo': sidebarLogo}")
    el-scrollbar(wrap-class='scrollbar-wrapper')
      el-menu(
        :default-active='activeMenu',
        :collapse='isCollapse',
        :background-color='variables.menuBg',
        :text-color='variables.menuText',
        :unique-opened='false',
        :active-text-color='variables.menuActiveText',
        :collapse-transition='false',
        mode='vertical'
      )
        sidebar-item(
          v-for='item in menuData',
          :key='item.path',
          :item='item',
          :base-path='item.path'
        )
</template>

<script>
import { mapState } from 'vuex';
import SidebarItem from './SidebarItem';
import variables from '@/src/assets/scss/variables.scss';

export default {
  components: { SidebarItem },
  computed: {
    ...mapState('permission', ['menuData']),
    ...mapState('app', ['sidebar']),
    ...mapState('settings', ['sidebarLogo']),
    // permission_routers() {
    //   return this.$store.state.permission.routers;
    // },
    // sidebar() {
    //   return this.$store.state.app.sidebar;
    // },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    // showLogo() {
    //   return this.$store.state.settings.sidebarLogo;
    // },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
  },
};
</script>
