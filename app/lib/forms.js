// form validation imports
import * as yup from 'yup';

export const broadcastSchema = yup.object({
  name: yup.string().required(),
  welcomeMessage: yup.string().required(),
  description: yup.string().required(),
  safetyTips: yup.string(),
  faq: yup.string(),
});

export const esimSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  privacyPolicy: yup.string().required(),
  activationInstructions: yup.string(),
  helpInstructions: yup.string(),
  locations: yup.string().required(),
});