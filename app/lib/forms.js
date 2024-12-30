// form validation imports
import * as yup from 'yup';

export const broadcastSchema = yup.object({
  name: yup.string().required(),
  welcomeMessage: yup.string().required(),
  description: yup.string().required(),
  safetyTips: yup.string(),
  faq: yup.string(),
});