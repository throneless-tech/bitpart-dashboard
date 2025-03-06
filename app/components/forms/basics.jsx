// base imports
import { useFieldArray, useFormContext } from 'react-hook-form';

// chakra imports
import {
  Fieldset,
  Heading,
  Input,
  Separator,
  Stack,
} from "@chakra-ui/react";

// component imports
import { Button } from "@/app/components/ui/button";
import { Field } from "@/app/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/app/components/ui/native-select";

// country codes
import { CountryCodes } from './countryCodes';

export const BasicsForm = (props) => {
  const { botType } = props;

  const { register, control, formState: { errors }, } = useFormContext();

  return (
    <>
      <Heading as='h2' marginBottom={4} marginTop={4} size='md'>
        Bot basics
      </Heading>
      <Field
        errorText={!!errors?.botName && errors.botName.message}
        helperText="Give your bot a name. (This is for you, and won't appear to your users)."
        invalid={!!errors?.botName}
        label="Bot name"
        marginBottom={6}
        required
        width="320px"
      >
        <Input {...register('botName')} />
      </Field>
      <Fieldset.Root marginTop={8} >
        <Stack>
          <Fieldset.Legend>Phone number details</Fieldset.Legend>
          <Fieldset.HelperText>
            Please provide the phone number that will be associated with the bot's Signal account. The bot will be added as a secondary device on Signal and we will guide you through this process later. We recommend that you use a new phone number for Bitpart since your Signal profile information will be linked to this account.
          </Fieldset.HelperText>
        </Stack>
        <Stack marginLeft={4}>
          <Field
            label="Country code"
            marginBottom={2}
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
            marginBottom={4}
            required
            width="320px"
          >
            <Input {...register('phone')} />
          </Field>
        </Stack>
      </Fieldset.Root>
      <Separator marginBottom={8} marginTop={8} />
    </>
  )
}