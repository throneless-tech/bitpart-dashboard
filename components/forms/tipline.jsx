// base imports
import { useFormContext } from 'react-hook-form';

// chakra imports
import {
  Input,
  Stack,
  Textarea
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";

export const TiplineForm = () => {
    const { register, formState: { errors }, } = useFormContext();

  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="Name your tipline. It can mirror the bot name, organization name, or be different."
        invalid={!!errors?.name}
        label="Tipline name"
        required
      >
        <Input {...register('name')} />
      </Field>
      <Field
        errorText={!!errors?.privacyPolicy && errors.privacyPolicy.message}
        helperText="Describe the privacy policy for a user interacting with this bot."
        invalid={!!errors?.privacyPolicy}
        label="Privacy policy"
        marginTop={4}
        required
      >
        <Textarea {...register('privacyPolicy')} />
      </Field>
    </>
  )
}