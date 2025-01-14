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
          <NativeSelectField>
            <CountryCodes />
          </NativeSelectField>
        </NativeSelectRoot>
      </Field>
      <Field
        errorText={!!errors?.phone && errors.phone.message}
        helperText="Enter the phone number for your bot, including country code."
        invalid={!!errors?.phone}
        label="Phone number"
        marginBottom={6}
        required
        width="320px"
      >
        <Input {...register('phone')} />
      </Field>
      {botType == "broadcast" ? (
        <>
          <Fieldset.Root
            invalid={!!errors?.faq}
            label="Contacts"
            marginTop={4}
          >
            <Stack>
              <Fieldset.Legend>
                Contacts
              </Fieldset.Legend>
              <Fieldset.HelperText>
                Add contacts to whom the broadcast messages will be distributed.
              </Fieldset.HelperText>
            </Stack>
            {fields.map((f, i) => {
              return (
                <Stack
                  alignItems={'center'}
                  direction={['column', 'row']}
                  justifyContent="flex-start"
                  key={f.id}
                  marginBottom={4}
                  spacing={20}
                  width='100%'
                >
                  <Stack width='100%'>
                    <Field
                      invalid={!!errors.contacts}
                      errorText={errors.contacts?.countryCode}
                    >
                      <NativeSelectRoot size="sm" width="320px">
                        <NativeSelectField
                          placeholder="Select a country code"
                          {...register("framework")}
                        >
                        <CountryCodes />
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field>
                    <Field width={320}>
                      <Input
                        placeholder="Phone number"
                        {...register(`contacts.${i}.phone`)}
                      />
                    </Field>
                  </Stack>
                  {i >= 0 &&
                    <Button
                      onClick={() => remove(i)}
                      height={6}
                      width={1}
                    >
                      X
                    </Button>
                  }
                </Stack>
              );
            })}
            <Button
              onClick={() =>
                append({
                  phone: '',
                })
              }
              variant="subtle"
              width={40}
            >
              Add contact
            </Button>
          </Fieldset.Root>
        </>
      ) : null}
    </>
  )
}