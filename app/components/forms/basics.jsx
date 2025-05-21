// base imports
import { useFieldArray, useFormContext } from "react-hook-form";

// chakra imports
import { Fieldset, Heading, Input, Separator, Stack } from "@chakra-ui/react";

// component imports
import { Button } from "@/app/components/ui/button";
import { Field } from "@/app/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/app/components/ui/native-select";

// country codes
import { CountryCodes } from "./countryCodes";

export const BasicsForm = ({ bot }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  // const { register, control, formState: { errors }, } = useFormContext({
  //   defaultValues: {
  //     adminPhones: [],
  //   },
  // });

  // const {
  //   fields: adminPhoneFields,
  //   append: adminPhoneAppend,
  //   remove: adminPhoneRemove,
  // } = useFieldArray({
  //   control,
  //   name: 'adminPhones',
  // });

  return (
    <>
      <Heading as="h2" marginBottom={4} marginTop={4} size="md">
        Bot basics
      </Heading>
      <Field
        errorText={!!errors?.botName && errors.botName.message}
        helperText="Give your bot a name. (This is for you, and won't appear to your users. Note that special characters are not allowed.)"
        invalid={!!errors?.botName}
        label="Bot name"
        marginBottom={6}
        required
        width="320px"
      >
        <Input {...register("botName")} />
      </Field>
      <Fieldset.Root marginTop={8}>
        <Stack>
          <Fieldset.Legend>Bot phone number details</Fieldset.Legend>
          <Fieldset.HelperText>
            Optionally provide the phone number that will be associated with the
            bot's Signal account. The bot will be added as a secondary device on
            Signal and we will guide you through this process later. We
            recommend that you use a new phone number for Bitpart since your
            Signal profile information will be linked to this account.
          </Fieldset.HelperText>
        </Stack>
        <Stack marginLeft={4}>
          <Field label="Country code" marginBottom={2} width={320}>
            <NativeSelectRoot>
              <NativeSelectField {...register("countryCode")}>
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
            width="320px"
          >
            <Input {...register("phone")} />
          </Field>
        </Stack>
      </Fieldset.Root>
      {/* <Fieldset.Root
        label="Admin phone numbers"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            Admin phone numbers
          </Fieldset.Legend>
          <Fieldset.HelperText>
            Please enter the phone numbers for all of the administrators of the list, who may be messaging users.
          </Fieldset.HelperText>
        </Stack>
        {adminPhoneFields.map((f, i) => {
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
              <Stack direction={['column', 'column', 'row']} width='100%'>
                <Field
                  label="Country code"
                  marginBottom={2}
                  width={320}
                >
                  <NativeSelectRoot>
                    <NativeSelectField {...register(`adminPhones.${i}.code`)}>
                      <CountryCodes />
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
                <Field
                  errorText={!!errors?.adminPhones?.number && errors?.adminPhones?.number.message}
                  invalid={!!errors?.adminPhones}
                  label="Phone number"
                  marginBottom={4}
                  width="320px"
                >
                  <Input {...register(`adminPhones.${i}.number`)} />
                </Field>
              </Stack>
              {i > 0 &&
                <Button
                  onClick={() => adminPhoneRemove(i)}
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
            adminPhoneAppend({
              code: '',
              number: '',
            })
          }
          variant="subtle"
          width={40}
        >
          Add admin phone
        </Button>
      </Fieldset.Root> */}
      <Separator marginBottom={8} marginTop={8} />
    </>
  );
};
