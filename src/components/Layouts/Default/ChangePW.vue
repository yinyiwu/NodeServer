<template lang="pug">
  #changePW_outer
    el-dialog(
      :title="$t('user.updatePw')",
      :visible.sync='dialogFormVisible',
      @closed='resetInPut(resetInPutParameter.close)'
    )
      el-form(:model='form')
        el-form-item(:label="$t('user.oldPw')", :label-width='formLabelWidth')
          el-input(
            v-validate="'required'",
            name='oldPW',
            :data-vv-as="$t('user.oldPw')",
            v-model='form.oldPW',
            autoComplete='off'
          )
          span.err-msg {{ errors.first('oldPW') }}
        el-form-item(:label="$t('user.inputPw')", :label-width='formLabelWidth')
          el-input(
            v-validate="'required|min:6|max:12|includeAlpha_num'",
            name='newPW',
            :data-vv-as="$t('user.inputPw')",
            v-model='form.newPW',
            autoComplete='off',
            ref='newPW'
          )
          span.err-msg {{ errors.first('newPW') }}
        el-form-item(:label="$t('user.updatePw')", :label-width='formLabelWidth')
          el-input(
            v-validate="'required|min:6|max:12|includeAlpha_num|confirmed:newPW'",
            name='repeatPW',
            :data-vv-as="$t('user.updatePw')",
            v-model='form.repeatPW',
            autoComplete='off'
          )
          span.err-msg {{ errors.first('repeatPW') }}
      .dialog-footer(slot='footer')
        el-button(type='danger', @click='resetInPut(resetInPutParameter.close)') {{$t('common.close')}}
        div
          el-button(type='info', @click='resetInPut()') {{$t('common.reset')}}
          el-button(type='primary', @click='changePW') {{$t('common.save')}}
</template>

<script>
import putUserPW from '@/src/api/changePW';

export default {
  name: 'ChangePW',
  data() {
    return {
      form: {
        oldPW: '',
        newPW: '',
        repeatPW: '',
      },
      resetInPutParameter: {
        close: 'close',
      },
      dialogFormVisible: false,
      formLabelWidth: '150px',
    };
  },
  methods: {
    async changePW() {
      const isValid = await this.$validator.validateAll();
      if (isValid) {
        const oldPW = this.form.oldPW;
        const newPW = this.form.newPW;
        const repeatPW = this.form.repeatPW;
        const putUserPWRes = await putUserPW(oldPW, newPW, repeatPW);
        if (putUserPWRes === '') {
          this.$notify({
            title: this.$t('common.success'),
            message: this.$t('common.putPwSuccess'),
            type: 'success',
          });
          this.resetInPut(this.resetInPutParameter.close);
        }
      }
    },
    resetInPut(action) {
      this.form.oldPW = '';
      this.form.newPW = '';
      this.form.repeatPW = '';
      if (action === 'close') {
        this.$validator.reset();
        this.dialogFormVisible = false;
      }
    },
  },
};
</script>

<style lang="scss">
#changePW_outer{
  .el-dialog__header{
    padding:12px 20px;
    background-color: #304156;
    .el-dialog__title{
      color: white;
    }
  }
  .el-dialog__headerbtn{
    display: none;
  }
  .el-form-item{
    margin-bottom: 0;
  }
  .el-form-item__content{
    margin-left: 90px;
  }
  .err-msg{
    display: block;
    padding: 3px 0 6px;
    line-height: 1.6;
  }
}
</style>
