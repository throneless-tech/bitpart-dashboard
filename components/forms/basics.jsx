// base imports
import { useFormContext } from 'react-hook-form';

// chakra imports
import { Input } from "@chakra-ui/react";

// component imports
import { Field } from "@/components/ui/field";

export const BasicsForm = () => {
  const { register, formState: { errors }, } = useFormContext();

  return (
    <>
      <Field
        errorText={!!errors?.botName && errors.botName.message}
        helperText="Give your bot a name."
        invalid={!!errors?.botName}
        label="Name"
        marginBottom={6}
        required
        width="320px"
      >
        <Input {...register('botName')} />
      </Field>
      <Field
        errorText={!!errors?.phone && errors.phone.message}
        helperText="Enter the phone number for your bot."
        invalid={!!errors?.phone}
        label="Phone number"
        marginBottom={6}
        required
        width="320px"
      >
        <Input {...register('phone')} />
      </Field>
    </>
  )
}