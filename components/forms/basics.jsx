// base imports
import { useFieldArray, useFormContext } from 'react-hook-form';

// chakra imports
import {
  Fieldset,
  Input,
  Stack,
} from "@chakra-ui/react";

// component imports
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";

// country codes
import { CountryCodes } from './countryCodes';

export const BasicsForm = (props) => {
  const { botType } = props;

  const { register, control, formState: { errors }, } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

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
        label="Country code"
        marginBottom={6}
        required
        width={320}
      >
        <NativeSelectRoot>
          <NativeSelectField {...register('countryCode')}>
            <CountryCodes />
          </NativeSelectField>
        </NativeSelectRoot>
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