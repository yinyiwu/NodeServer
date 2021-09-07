<template lang="pug">
  .menu-wrapper(v-if='!item.hidden')
    template(v-if='hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren) && !item.alwaysShow')
      app-link(v-if='onlyOneChild.meta', :to='resolvePath(onlyOneChild.path)')
        el-menu-item(:index='resolvePath(onlyOneChild.path)', :class="{'submenu-title-noDropdown': !isNest}")
          item(:icon='onlyOneChild.meta.icon || (item.meta && item.meta.icon)', :title='$t(onlyOneChild.meta.title)')
    el-submenu(v-else='', ref='subMenu', :index='resolvePath(item.path)', popper-append-to-body='')
      template(slot='title')
        item(v-if='item.meta', :icon='item.meta && item.meta.icon', :title='$t(item.meta.title)')
      sidebar-item.nest-menu(
        v-for='child in item.children',
        :key='child.path',
        :is-nest='true',
        :item='child',
        :base-path='resolvePath(child.path)'
      )
</template>

<script>
import path from 'path';
import Item from '@/src/components/Layouts/Default/Sidebar/Item';
import AppLink from '@/src/components/Layouts/Default/Sidebar/Link';
import FixiOSBug from '@/src/mixins/Layouts/Default/Sidebar/FixiOSBug';

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: '',
    },
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null;
    return {};
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter((item) => {
        if (item.hidden) {
          return false;
        }
        // Temp set(will be used if only has one showing child)
        this.onlyOneChild = item;
        return true;
      });

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true;
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true };
        return true;
      }

      return false;
    },
    resolvePath(routePath) {
      return path.resolve(this.basePath, routePath);
    },
  },
};
</script>
