// base imports
import { useFormContext } from "react-hook-form";

// chakra imports
import { Heading, Input, Stack, Textarea } from "@chakra-ui/react";
import { Field } from "@/app/_components/ui/field";

export const TiplineForm = ({ bot }) => {
  const {
    formState: { errors },
    register,
  } = useFormContext();

  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="Name your tipline. This is the name that is visible to your users. It can mirror the bot name, organization name, or be different."
        invalid={!!errors?.name}
        label="Public name"
        required
      >
        <Input {...register("name")} />
      </Field>
      <Field
        errorText={!!errors?.privacyPolicy && errors.privacyPolicy.message}
        helperText="Anyone interacting or using your bot will be able to send the bot 'My data' to access this information. Customize the above text to reflect your organization's data rights policy."
        info="privacyPolicy"
        invalid={!!errors?.privacyPolicy}
        label="Data rights"
        marginTop={4}
        required
      >
        <Textarea
          autoresize
          defaultValue={
            bot
              ? bot.privacyPolicy
              : `This tipline does not ask you for any personal data if you want to share a tip.\n\nPersonal data attached to your tip is any information that is visible on your Signal profile (e.g. your profile name, your phone number or username if visible).\n\nRemember, you can adjust your Signal profile settings such as your profile name and image, to give you more anonymity.\n\nAfter sharing a tip, you will be asked if you would like to be contacted, which you can refuse.\n\nIf you would like to be contacted you have the option to share your Signal username or phone number.\n\nTips are recorded & stored <WHERE?>.\n\nWe delete tips every <TIMEFRAME?>.`
          }
          {...register("privacyPolicy")}
        />
      </Field>
    </>
  );
};
