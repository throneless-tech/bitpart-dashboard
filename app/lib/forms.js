// form validation imports
import * as yup from "yup";

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export const schema = yup.object({
  botType: yup.string().required("Choose a bot type"),
  botName: yup.string().required("Bot name is required"),
  phone: yup.string().matches(phoneRegExp, {
    message: "Phone number is not valid",
    excludeEmptyString: true,
  }),
  countryCode: yup.string().optional(),
  name: yup.string().required("Name is required"),
  description: yup.string().when("botType", {
    is: "broadcast" || "helpdesk" || "esim" || "vpn",
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
  // adminPhones: yup.array().when("botType", {
  //   is: "broadcast" || "tipline" || "helpdesk" || "esim" || "vpn",
  //   then: () => yup.array()
  //     .of(
  //       yup.object({
  //         code: yup.string(),
  //         number: yup.string(),
  //       })
  //     )
  // }),
  faq: yup.array().when("botType", {
    is: "broadcast",
    then: () =>
      yup
        .array()
        .of(
          yup.object({
            question: yup.string().required("Question is required"),
            answer: yup.string().required("Answer is required"),
          }),
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
    then: () =>
      yup
        .array()
        .of(
          yup.object({
            place: yup.string().required("A location is required"),
          }),
        )
        .optional(),
  }),
  plans: yup.array().when("botType", {
    is: "esim" || "vpn",
    then: () =>
      yup
        .array()
        .of(
          yup.object({
            amount: yup.string().required("An amount is required"),
            length: yup.string().required("A length of time is required"),
          }),
        )
        .optional(),
  }),
  referral: yup.string().when("botType", {
    is: "helpdesk" || "broadcast",
    then: () =>
      yup
        .string()
        .required(
          "A referral or emergency contact person or place is required",
        ),
  }),
  storageTime: yup.number("Enter a number").when("botType", {
    is: "helpdesk" || "vpn",
    then: () => yup.number("Enter a number").optional(),
  }),
  storageAccess: yup.string().when("botType", {
    is: "helpdesk",
    then: () => yup.string().optional(),
  }),
  problems: yup.array().when("botType", {
    is: "helpdesk",
    then: () =>
      yup
        .array()
        .of(
          yup.object({
            problem: yup.string().required("A problem is required"),
            solution: yup.string().required("A solution is required"),
          }),
        )
        .optional(),
  }),
  maxCodes: yup.number().when("botType", {
    is: "vpn",
    then: () => yup.number(),
  }),
  // vpnName: yup.string().when("botType", {
  //   is: "vpn",
  //   then: () => yup.string().required('Name of the VPN service is required'),
  // }),
});
