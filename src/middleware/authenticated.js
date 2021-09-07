export default async ({ store, redirect }) => {
  if (store.getters['auth/isLogin']) { return }
  return redirect(`${store.getters['locale/localePath']}`);
};
