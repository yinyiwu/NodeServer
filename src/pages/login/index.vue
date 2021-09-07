<template lang="pug">
  .login-container
    el-form.login-form(:model='loginForm', label-position='left')
      .title-container
        h3.title {{$t('login.title')}}
      el-form-item(prop='username')
        span.svg-container
          svg-icon(icon-class='user')
        el-input(v-model='loginForm.username', :name="$t('login.userName')", v-validate="'required'") | ""
      p.err-msg {{errors.first($t('login.userName'))}}
      el-form-item(prop='password')
        span.svg-container
          svg-icon(icon-class='password')
        el-input(
          :key='passwordType',
          v-model='loginForm.password',
          :type='passwordType',
          :name="$t('login.password')",
          v-validate="'required'",
          @keyup.enter.native='handleLogin'
        )
          span.show-pwd(@click='showPwd')
            svg-icon(:icon-class="passwordType === 'password' ? 'eye' : 'eye-open'")
      p.err-msg {{errors.first($t('login.password'))}}
      el-button(:loading.sync='loading', type='primary', style='width:100%;margin-bottom:30px;', @click.native.prevent='handleLogin') {{$t('login.logIn')}}
</template>

<script>
export default {
  name: 'Login',
  layout: 'empty',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = '';
      } else {
        this.passwordType = 'password';
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    async handleLogin() {
      if (await this.$validator.validate()) {
        this.loading = true;
        try {
          await this.$store.dispatch('auth/login', this.loginForm);
          // this.$router.push({ path: this.redirect || '/' });
          window.location = '/';
          this.loading = false;
        } catch (e) {
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
