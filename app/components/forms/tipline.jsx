// base imports
import { useFormContext } from 'react-hook-form';

// chakra imports
import {
  Heading,
  Input,
  Stack,
  Textarea
} from "@chakra-ui/react";
import { Field } from "@/app/components/ui/field";

export const TiplineForm = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="Name your tipline. This is the name that is visible to your users. It can mirror the bot name, organization name, or be different."
        invalid={!!errors?.name}
        label="Tipline name"
        required
      >
        <Input {...register('name')} />
      </Field>
      <Field
        errorText={!!errors?.privacyPolicy && errors.privacyPolicy.message}
        helperText="Describe the data privacy practices for a person interacting with this bot."
        info="privacyPolicy"
        invalid={!!errors?.privacyPolicy}
        label="Data privacy"
        marginTop={4}
        required
      >
        <Textarea {...register('privacyPolicy')} />
      </Field>
    </>
  )
}