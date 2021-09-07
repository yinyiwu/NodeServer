import { vueContext } from '@/src/plugins/vueContext';

export const getDailyOrder = () => vueContext.app.$axios.get('/Customer/Daily/Key');
