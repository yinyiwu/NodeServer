<template lang="pug">
  #app
    .app-wrapper(:class='classObj')
      .drawer-bg(v-if="device === 'mobile' && sidebar.opened", @click='handleClickOutside')
      sidebar.sidebar-container
      .main-container
        div(:class="{'fixed-header':fixedHeader}")
          navbar
        app-main
</template>

<script>
import { Navbar, Sidebar, AppMain } from '@/src/components/Layouts/Default';
import ResizeMixin from '@/src/mixins/Layouts/Default/ResizeHandler';

export default {
  name: 'DefaultLayout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar;
    },
    device() {
      return this.$store.state.app.device;
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader;
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile',
      };
    },
  },
  async mounted() {
    // FIXME
    // await store.dispatch('permission/generateRoutes');
    await this.$store.dispatch('auth/checkLogin');
    await this.$store.dispatch('permission/getMenu');
    // await this.$store.dispatch('permission/getPrivileges');
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('CloseSideBar', { withoutAnimation: false });
    },
  },
};
</script>

<style lang="scss" scoped>
  @import "@/src/assets/scss/mixin.scss";
  @import "@/src/assets/scss/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar{
      position: fixed;
      top: 0;
    }
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>
