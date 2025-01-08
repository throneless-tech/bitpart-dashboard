// form validation imports
import * as yup from 'yup';

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

export const basicsSchema = yup.object({
  botName: yup.string().required(),
  phone: yup.string().required().matches(phoneRegExp, 'Phone number is not valid')
});

export const broadcastSchema = yup.object({
  name: yup.string().required(),
  about: yup.string().required(),
  description: yup.string().required(),
  safetyTips: yup.string(),
  faq: yup.array()
    .of(
      yup.object({
        question: yup.string(),
        checked: yup.boolean(),
      })
    ),
});

export const esimSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  privacyPolicy: yup.string().required(),
  activationInstructions: yup.string(),
  helpInstructions: yup.string(),
  locations: yup.string().required(),
});

export const helpdeskSchema = yup.object({
  name: yup.string().required(),
  referral: yup.string().required(),
  storageTime: yup.number().required(),
  storageAccess: yup.string(),
  privacyPolicy: yup.string().required(),
  problems: yup.string(),
});

export const tiplineSchema = yup.object({
  name: yup.string().required(),
  privacyPolicy: yup.string().required(),
});

export const vpnSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  storageTime: yup.number().required(),
  vpnName: yup.string().required(),
  activationInstructions: yup.string(),
  locations: yup.string().required(),
  plans: yup.string().required(),
  faq: yup.string(),
});