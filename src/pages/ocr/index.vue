<template lang="pug">
.app-container
  el-upload(
    multiple,
    action='/service/Ocr/Order/UploadImages',
    :before-remove='beforeRemove',
    :limit='20',
    :on-exceed='handleExceed',
    :file-list='fileList',
    list-type='picture-card'
  )
    el-button(size='small', type='primary') Click to upload
      .el-upload__tip(slot='tip') jpg/png files with a size less than 500kb
  el-form(label-position='top')
    el-row(:gutter='20')
      el-table(
        :data='ocrList',
        style='width: 100%',
        :default-sort='{ prop: "label", order: "descending" }'
      )
        el-table-column(prop='key', label='時間', width='180', sortable)
        el-table-column(prop='fileName', label='下載', width='180')
          span(slot-scope='scope')
            a( style='color:red' :href='`service/photosFinish/${scope.row.fileName}`')  下載
</template>

<script>
import { getDailyOCRList } from '@/src/api/ocr';
import _ from 'lodash';

export default {
  data() {
    return {
      fileList:[],
      ocrList:[]
    }
  },
  computed: {

  },
  async mounted() {
    const {
      data,
    } = await getDailyOCRList();
    this.ocrList = data;
  },
  methods: {
      handleExceed(files, fileList){
        this.$message.warning(`The limit is 20, you selected ${files.length} files this time, add up to ${files.length + fileList.length} totally`);
      },
      beforeRemove(file, fileList){
        return this.$confirm(`Cancel the transfert of ${ file.name } ?`);
      }
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
