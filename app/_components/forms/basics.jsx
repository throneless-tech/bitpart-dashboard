// base imports
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

// chakra imports
import { Input, Separator, Stack, Text } from "@chakra-ui/react";

// component imports
import { Button } from "@/app/_components/ui/button";
import { Field } from "@/app/_components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/app/_components/ui/native-select";

// country codes
import { CountryCodes } from "./countryCodes";

// disappearing messages
import {
  EXPIRE_TIMER_OPTIONS,
  EXPIRE_TIMER_UNITS,
  formatExpireTimer,
} from "@/app/_lib/expireTimer";

export const BasicsForm = ({ bot }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const expireTimer = useWatch({ control, name: "expireTimer" });

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
      <Field
        errorText={!!errors?.botName && errors.botName.message}
        helperText="Give your bot a name. This is also the bot's Signal profile name, which is only set when the bot is linked, so changing it later won't update Signal until the bot is re-linked. (Note that special characters are not allowed.)"
        invalid={!!errors?.botName}
        label="Bot name"
        marginBottom={6}
        marginTop={8}
        required
        width="320px"
      >
        <Input {...register("botName")} />
      </Field>
      {bot ? (
        <Field
          helperText="This is set when the bot is created and applies to new conversations."
          label="Disappearing messages"
          marginBottom={6}
          width="320px"
        >
          <Text>{formatExpireTimer(bot.expireTimer)}</Text>
        </Field>
      ) : (
        <>
          <Field
            errorText={!!errors?.expireTimer && errors.expireTimer.message}
            helperText="Messages in new conversations with the bot will disappear after this amount of time."
            invalid={!!errors?.expireTimer}
            label="Disappearing messages"
            marginBottom={6}
            width="320px"
          >
            <NativeSelectRoot>
              <NativeSelectField {...register("expireTimer")} defaultValue="0">
                {EXPIRE_TIMER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </NativeSelectField>
            </NativeSelectRoot>
          </Field>
          {expireTimer === "custom" ? (
            <Stack direction="row" marginBottom={6} width="320px">
              <Field
                errorText={
                  !!errors?.expireTimerCustomValue &&
                  errors.expireTimerCustomValue.message
                }
                invalid={!!errors?.expireTimerCustomValue}
                label="Time"
                required
              >
                <Input
                  min={1}
                  step={1}
                  type="number"
                  {...register("expireTimerCustomValue")}
                />
              </Field>
              <Field label="Unit">
                <NativeSelectRoot>
                  <NativeSelectField
                    {...register("expireTimerCustomUnit")}
                    defaultValue="86400"
                  >
                    {EXPIRE_TIMER_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field>
            </Stack>
          ) : null}
        </>
      )}
      {/* <Fieldset.Root marginTop={8}>
        <Stack>
          <Fieldset.Legend>Bot phone number details (OPTIONAL)</Fieldset.Legend>
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
      </Fieldset.Root> */}
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
    </>
  );
};
