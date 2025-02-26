// form validation imports
import * as yup from 'yup';

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
//handle parenthesis

export const schema = yup.object({
  // botType: yup.string().required('Choose a bot type'),
  botName: yup.string().required('Bot name is required'),
  phone: yup.string().required().matches(phoneRegExp, 'Phone number is not valid'),
  countryCode: yup.string().required('Country code is required '),
  name: yup.string().required("Name is required"),
  description: yup.string().when("botType", {
    is: "broadcast" || "esim" || "vpn",
    then: () => yup.string().required("Description is required"),
  }),
  about: yup.string().when("botType", {
    is: "broadcast",
    then: () => yup.string().optional(),
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
          question: yup.string().required("Question is required"),
          answer: yup.string().required("Answer is required"),
        })
      )
      .optional(),
  }),
  privacyPolicy: yup.string().when("botType", {
    is: "esim" || "helpdesk" || "tipline",
    then: () => yup.string().required("Privacy policy is required"),
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
          place: yup.string().required("A location is required"),
        })
      )
      .optional(),
  }),
  plans: yup.array().when("botType", {
    is: "esim" || "vpn",
    then: () => yup.array()
      .of(
        yup.object({
          amount: yup.string().required("An amount is required"),
          length: yup.string().required("A length of time is required"),
        })
      )
      .optional(),
  }),
  referral: yup.string().when("botType", {
    is: "helpdesk",
    then: () => yup.string().required("A referral person or place is required"),
  }),
  // storageTime: yup.number("Enter a number").when("botType", {
  //   is: "helpdesk" || "vpn",
  //   then: () => yup.number("Enter a number").required("Enter a length of time, in hours."),
  // }),
  storageAccess: yup.string().when("botType", {
    is: "helpdesk",
    then: () => yup.string().optional(),
  }),
  problems: yup.array().when("botType", {
    is: "helpdesk",
    then: () => yup.array()
      .of(
        yup.object({
          problem: yup.string().required("A problem is required"),
          solution: yup.string().required("A solution is required"),
        })
      )
      .optional(),
  }),
  vpnName: yup.string().when("botType", {
    is: "vpn",
    then: () => yup.string().required('Name of the VPN service is required'),
  }),
});
