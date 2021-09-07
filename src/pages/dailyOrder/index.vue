<template lang="pug">
.app-container
  el-form(label-position='top')
    el-row
      el-table(:data='dailyOrder.filter(data => !search || data.key.toLowerCase().includes(search.toLowerCase()))', style='width: 100%', :default-sort = "{prop: 'label', order: 'descending'}")
        el-table-column(prop='key', label='日期', width='180',sortable)
        el-table-column(prop='Download', label='下載')
          template(slot="header" slot-scope="scope")
            el-input(
              v-model="search"
              size="mini"
              placeholder="Type to search"
            )
          span(slot-scope="scope")
            a( style='color:red' :href='(()=>`service/Customer/Order/XLSX/${scope.row.start}/${scope.row.end}`)()') {{ `${scope.row.Download}` }}
</template>

<script>
import { getDailyOrder } from '@/src/api/customer';
import _ from 'lodash';

export default {
  name: 'Platform',
  data() {
    return {
      search:'',
      dailyOrder :[],
    }
  },
  computed: {

  },
  async mounted() {
    const data = await getDailyOrder();
    this.dailyOrder = data;
    setInterval(()=>{
      const data = await getDailyOrder();
      this.dailyOrder = data;
    },30000);
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-table .warning-row {
    background: rgb(236, 250, 38);
  }

/deep/ .el-table .success-row {
    background: rgb(255, 255, 255);
  }
.app-container {
  .el-select {
    width: 100%;
  }
  .err-msg {
    height: 20px;
    padding-left: 16px;
    text-align: left;
  }

}
</style>
