import { vueContext } from '@/src/plugins/vueContext';

export const getDailyOCRList = () => vueContext.app.$axios.get('/OCR/Order/GetDailyOCRList');