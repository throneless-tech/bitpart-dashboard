// base imports
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// chakra imports
import {
  Input,
  Stack,
  Textarea
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export const BasicsForm = ({ schema }) => {
  const { register, errors } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });


  return (
    <>
      <Field
        errorText="Field is required"
        helperText="Give your bot a name."
        invalid={!!errors?.name}
        label="Name"
        marginBottom={6}
        required
        width="320px"
        {...register('name')}
      >
        <Input />
      </Field>
      <Field
        errorText="Field is required"
        helperText="Enter the phone number for your bot."
        invalid={!!errors?.phone}
        label="Phone number"
        marginBottom={6}
        required
        width="320px"
        {...register('phone')}
      >
        <Input />
      </Field>
    </>
  )
}