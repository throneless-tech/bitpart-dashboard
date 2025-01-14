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
import {
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from "@/components/ui/number-input"

export const HelpdeskForm = () => {
  const { register, control, formState: { errors } } = useFormContext({
    defaultValues: {
      problems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'problems',
  });

  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="Name your helpdesk. It can mirror the bot name or be different."
        invalid={!!errors?.name}
        label="Helpdesk name"
        required
      >
        <Input {...register('name')} />
      </Field>
      <Field
        errorText={!!errors?.referral && errors.referral.message}
        helperText="Who or where a user should contact for immediate assistance."
        invalid={!!errors?.referral}
        label="Referral"
        marginTop={4}
        required
      >
        <Input {...register('referral')} />
      </Field>
      <Field
        errorText={!!errors?.storageTime && errors.storageTime.message}
        helperText="How long the user's information will be stored in the system, in hours. We suggest XX days, or XXX hours. Must be at least XX hours."
        invalid={!!errors?.storageTime}
        label="Storage length of time"
        marginTop={4}
        required

      >
        <NumberInputRoot
          min={1}
          formatOptions={{
            style: "unit",
            unit: "hour",
            unitDisplay: "long",
          }}
          {...register('storageTime')}
        >
          <NumberInputLabel />
          <NumberInputField />
        </NumberInputRoot>
      </Field>
      <Field
        errorText={!!errors?.storageAccess && errors.storageAccess.message}
        helperText="Who will have access to the information stored."
        invalid={!!errors?.storageAccess}
        label="Storage access"
        marginTop={4}
      >
        <Textarea {...register('storageAccess')} />
      </Field>
      <Field
        errorText={!!errors?.privacyPolicy && errors.privacyPolicy.message}
        helperText="Describe the privacy policy for a user interacting with this bot."
        info="privacyPolicy"
        invalid={!!errors?.privacyPolicy}
        label="Privacy policy"
        marginTop={4}
        required
      >
        <Textarea {...register('privacyPolicy')} />
      </Field>
      <Fieldset.Root
        label="Problem areas"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            Problems
          </Fieldset.Legend>
          <Fieldset.HelperText>
            Add as many problem areas for the help desk as you need. Keep in mind this will appear as a text message, so we recommend four (4) or fewer question/answer combos.
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
                  invalid={!!errors?.problems}
                  errorText={errors.problems?.problem}
                >
                  <Input
                    placeholder="Problem"
                    {...register(`problems.${i}.problem`)}
                  />
                </Field>
                <Field
                  invalid={!!errors?.problems}
                  errorText={errors.problems?.solution}
                >
                  <Textarea
                    placeholder="Steps to solve"
                    {...register(`problems.${i}.solution`)}
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
              problem: '',
              solution: '',
            })
          }
          variant="subtle"
          width={40}
        >
          Add problem area
        </Button>
      </Fieldset.Root>
    </>
  )
}