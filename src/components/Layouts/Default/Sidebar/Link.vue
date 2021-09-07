<template lang="pug">
  //- eslint-disable vue/require-component-is
  router-link(:to='to')
    slot
</template>

<script>
export default {
  props: {
    to: {
      type: String,
      required: true,
    },
  },
};
</script>
