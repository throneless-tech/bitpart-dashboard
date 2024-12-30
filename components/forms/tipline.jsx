// base imports
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// chakra imports
import {
  Input,
  Stack,
  Textarea
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";

export const TiplineForm = ({ schema }) => {
  const { register, errors } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  return (
    <>
      <Field
        errorText="Field is required"
        helperText="Name your tipline. It can mirror the bot name, organization name, or be different."
        invalid={!!errors?.name}
        label="Tipline name"
        required
        {...register('name')}
      >
        <Input />
      </Field>
      <Field
        errorText="Field is required"
        helperText="Describe the privacy policy for a user interacting with this bot."
        invalid={!!errors?.privacyPolicy}
        label="Privacy policy"
        marginTop={4}
        required
        {...register('privacyPolicy')}
      >
        <Textarea />
      </Field>
    </>
  )
}