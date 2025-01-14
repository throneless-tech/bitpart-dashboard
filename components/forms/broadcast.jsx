// base imports
import { useFieldArray, useFormContext } from 'react-hook-form';

// chakra imports
import {
  Fieldset,
  Input,
  Stack,
  Textarea
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export const BroadcastForm = () => {
  const { register, control, formState: { errors } } = useFormContext({
    defaultValues: {
      faq: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faq',
  });
  
  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="Name your list. This is the name that is visible to your users. It can mirror the bot name or be different."
        invalid={!!errors?.name}
        label="List name"
        required
      >
        <Input placeholder="Special broadcast list" {...register('name')} />
      </Field>
      <Field
        errorText={!!errors?.description && errors.description.message}
        helperText="Describe the list, such as who manages it, how often you expect to send messages, and why messages will be sent."
        invalid={!!errors?.description}
        label="List description"
        marginTop={4}
        required
      >
        <Textarea {...register('description')} />
      </Field>
      <Field
        errorText={!!errors?.safetyTips && errors.safetyTips.message}
        helperText="Include safety tips for the list recipients, such as what to do in an emergency or best practices for digital security hygiene."
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