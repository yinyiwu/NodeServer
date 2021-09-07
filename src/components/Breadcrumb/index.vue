<template lang="pug">
  el-breadcrumb.app-breadcrumb(separator='/')
    transition-group(name='breadcrumb')
      el-breadcrumb-item(v-for='(item,index) in levelList', :key='item.path')
        //- span.no-redirect(v-if="item.redirect === 'noRedirect' || index == levelList.length - 1") {{ $t(item.meta.title) }}
        //- a(v-else='', @click.prevent='handleLink(item)') {{ $t(item.meta.title) }}
        span.no-redirect {{ $t(item.meta.title) }}
</template>

<script>
import { mapState } from 'vuex';
import pathToRegexp from 'path-to-regexp';

export default {
  data() {
    return {
      levelList: null,
      nullCount: 0,
    };
  },
  computed: {
    ...mapState('permission', ['menuData'])
  },
  watch: {
    $route() {
      this.getBreadcrumb();
    },
    menuData() {
      this.getBreadcrumb();
    }
  },
  created() {
    this.getBreadcrumb();
  },
  methods: {
    getNullCount() {
      return this.nullCount += 1;
    },
    getBreadcrumb() {
      let menuData = this.menuData.slice();
      let pathArray = this.$route.path.split('/');
      let findMenuData = menuData;
      let levelList = [];

      pathArray.splice(0,1);
      pathArray.forEach((path, index) => {
        let findMenuItem = this.$find(findMenuData, (item) => item.path.includes(path) ) || { meta: {}, path: `null_${this.getNullCount()}` };
        findMenuData = findMenuItem.children || [];

        if (findMenuData.length === 1 && index === 0) {
          findMenuItem.meta = findMenuItem.children[0].meta;
        }

        levelList.push(findMenuItem);
      });

      this.levelList = levelList;
    },
    // pathCompile(path) {
    //   // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
    //   const { params } = this.$route;
    //   const toPath = pathToRegexp.compile(path);
    //   return toPath(params);
    // },
    // handleLink(item) {
    //   const { redirect, path } = item;
    //   if (redirect) {
    //     this.$router.push(redirect);
    //     return;
    //   }
    //   this.$router.push(this.pathCompile(path));
    // },
  },
};
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
