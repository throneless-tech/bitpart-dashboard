// base imports
import { useFieldArray, useFormContext } from 'react-hook-form';

// chakra imports
import {
  Fieldset,
  Input,
  Stack,
  Textarea
} from "@chakra-ui/react";
import { Button } from "@/app/components/ui/button";
import { Field } from "@/app/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/app/components/ui/native-select";

// country codes
import { CountryCodes } from './countryCodes';

export const BroadcastForm = () => {
  const { register, control, formState: { errors } } = useFormContext({
    defaultValues: {
      adminPhones: [],
      faq: [],
    },
  });

  const {
    fields: adminPhoneFields,
    append: adminPhoneAppend,
    remove: adminPhoneRemove,
  } = useFieldArray({
    control,
    name: 'adminPhones',
  });

  const {
    fields: faqFields,
    append: faqAppend,
    remove: faqRemove,
  } = useFieldArray({
    control,
    name: 'faq',
  });
  
  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="Name your list. This is the name that is visible to your users. It can mirror the bot name, organization name, or be different."
        invalid={!!errors?.name}
        label="Public name"
        required
      >
        <Input placeholder="Broadcast list" {...register('name')} />
      </Field>
      <Fieldset.Root
        label="Admin phone numbers"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            Admin phone numbers
          </Fieldset.Legend>
          <Fieldset.HelperText>
            Please enter the phone numbers for all of the administrators of the list who will be sending messages.
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
                required
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
                required
                width="320px"
              >
                <Input {...register(`adminPhones.${i}.number`)} />
              </Field>
            </Stack>
            {i >= 0 &&
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
              phone: '',
            })
          }
          variant="subtle"
          width={40}
        >
          Add admin phone
        </Button>
      </Fieldset.Root>
      <Field
        errorText={!!errors?.description && errors.description.message}
        helperText="Describe the list, such as who manages it, how often you expect to send messages, and why messages will be sent."
        info="description"
        invalid={!!errors?.description}
        label="About"
        marginTop={4}
        required
      >
        <Textarea {...register('description')} />
      </Field>
      <Field
        errorText={!!errors?.safetyTips && errors.safetyTips.message}
        helperText="Include safety tips for the list recipients, such as what to do in an emergency or best practices for digital security hygiene."
        info="safetyTips"
        invalid={!!errors?.safetyTips}
        label="Safety tips"
        marginTop={4}
      >
        <Textarea {...register('safetyTips')} />
      </Field>
      <Fieldset.Root
        label="FAQs"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            FAQs
          </Fieldset.Legend>
          <Fieldset.HelperText>
            If your list needs FAQs, we recommend four (4) or fewer question/answer combos. Start with your most asked question at the top. Keep in mind Bitpart will automatically add an 'other' question for a freeform ask from a user.
          </Fieldset.HelperText>
        </Stack>
        {faqFields.map((f, i) => {
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
                  invalid={!!errors?.faq}
                  errorText={errors.faq?.question}
                >
                  <Input
                    placeholder="Question"
                    {...register(`faq.${i}.question`)}
                  />
                </Field>
                <Field
                  invalid={!!errors?.faq}
                  errorText={errors.faq?.answer}
                >
                  <Input
                    placeholder="Answer"
                    {...register(`faq.${i}.answer`)}
                  />
                </Field>
              </Stack>
              {i >= 0 &&
                <Button
                  onClick={() => faqRemove(i)}
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
            faqAppend({
              question: '',
              answer: '',
            })
          }
          variant="subtle"
          width={40}
        >
          Add FAQ
        </Button>
      </Fieldset.Root>
    </>
  )
}