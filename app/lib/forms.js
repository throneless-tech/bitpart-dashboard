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
  faq: yup.string(),
});