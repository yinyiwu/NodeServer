<template lang="pug">
  .navbar
    Hamburger.hamburger-container(:is-active='sidebar.opened', @toggleclick='toggleSideBar')
    Breadcrumb.breadcrumb-container
    .right-menu
      el-dropdown.avatar-container(trigger='click')
        .avatar-wrapper
          span {{name}}
          i.el-icon-caret-bottom
        el-dropdown-menu.user-dropdown(slot='dropdown')
          el-dropdown-item
            span(style='display:block;', @click='logout') {{$t('navbar.logOut')}}
    ChangePW(ref='ChangePW')
</template>

<script>
import { mapState } from 'vuex';
import Breadcrumb from '@/src/components/Breadcrumb';
import Hamburger from '@/src/components/Hamburger';
import ChangePW from '@/src/components/Layouts/Default/ChangePW';

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ChangePW,
  },
  computed: {
    ...mapState('app', ['sidebar']),
    ...mapState('auth', ['name'])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar');
    },
    async logout() {
      await this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
