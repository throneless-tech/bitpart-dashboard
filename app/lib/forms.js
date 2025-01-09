// form validation imports
import * as yup from 'yup';

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

export const schema = yup.object({
  botType: yup.string().required('must choose which bot type'),
  botName: yup.string().required('name is required'),
  phone: yup.string().required().matches(phoneRegExp, 'phone number is not valid'),
  name: yup.string().required(),
  description: yup.string().when("botType", {
    is: "broadcast" || "esim" || "vpn",
    then: () => yup.string().required(),
  }),
  about: yup.string().when("botType", {
    is: "broadcast",
    then: () => yup.string().required(),
  }),
  safetyTips: yup.string().when("botType", {
    is: "broadcast",
    then: () => yup.string().optional(),
  }),
  faq: yup.array().when("botType", {
    is: "broadcast" || "vpn",
    then: () => yup.array()
      .of(
        yup.object({
          question: yup.string().required(),
          answer: yup.boolean().required(),
        })
      )
      .optional(),
  }),
  privacyPolicy: yup.string().when("botType", {
    is: "esim" || "helpdesk" || "tipline",
    then: () => yup.string().required(),
  }),
  activationInstructions: yup.string().when("botType", {
    is: "esim" || "vpn",
    then: () => yup.string().optional(),
  }),
  helpInstructions: yup.string().when("botType", {
    is: "esim",
    then: () => yup.string().optional(),
  }),
  locations: yup.array().when("botType", {
    is: "esim" || "vpn",
    then: () => yup.array()
      .of(
        yup.object({
          place: yup.string().required(),
        })
      )
      .optional(),
  }),
  plans: yup.array().when("botType", {
    is: "esim" || "vpn",
    then: () => yup.array()
      .of(
        yup.object({
          amount: yup.string().required(),
          length: yup.boolean().required(),
        })
      )
      .optional(),
  }),
  referral: yup.string().when("botType", {
    is: "helpdesk",
    then: () => yup.string().required(),
  }),
  storageTime: yup.number().when("botType", {
    is: "helpdesk" || "vpn",
    then: () => yup.number().required(),
  }),
  storageAccess: yup.string().when("botType", {
    is: "helpdesk",
    then: () => yup.string().optional(),
  }),
  problems: yup.string().when("botType", {
    is: "helpdesk",
    then: () => yup.string().optional(),
  }),
  vpnName: yup.string().when("botType", {
    is: "vpn",
    then: () => yup.string().required('name of the VPN service is required'),
  }),
});
