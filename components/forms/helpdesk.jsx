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
import {
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from "@/components/ui/number-input"

export const HelpdeskForm = ({ schema }) => {
  const { register, control, errors } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'problems',
  });

  return (
    <>
      <Field
        errorText="Field is required"
        helperText="Name your helpdesk. It can mirror the bot name or be different."
        invalid={!!errors?.name}
        label="Helpdesk name"
        required
        {...register('name')}
      >
        <Input />
      </Field>
      <Field
        errorText="Field is required"
        helperText="Who or where a user should contact for immediate assistance."
        invalid={!!errors?.referral}
        label="Referral"
        marginTop={4}
        required
        {...register('referral')}
      >
        <Input />
      </Field>
      <Field
        errorText="Field is required"
        helperText="How long the user's information will be stored in the system, in hours. We suggest XX days, or XXX hours. Must be at least XX hours."
        invalid={!!errors?.storageTime}
        label="Storage length of time"
        marginTop={4}
        required
        {...register('storageTime')}
      >
        <NumberInputRoot
          min={1}
          formatOptions={{
            style: "unit",
            unit: "hour",
            unitDisplay: "long",
          }}
        >
          <NumberInputLabel />
          <NumberInputField />
        </NumberInputRoot>
      </Field>
      <Field
        errorText="Field is required"
        helperText="Who will have access to the information stored."
        invalid={!!errors?.storageAccess}
        label="Storage access"
        marginTop={4}
        {...register('storageAccess')}
      >
        <Textarea />
      </Field>
      <Field
        errorText="Field is required"
        helperText="Describe the privacy policy for a user interacting with this bot."
        invalid={!!errors?.privacyPolicy}
        label="Privacy policy"
        marginTop={4}
        required
        {...register('privacyPolicy')}
      >
        <Textarea />
      </Field>
      <Field
        errorText="Fill out all the fields that you add."
        helperText="Add as many problem areas for the help desk as you need. Keep in mind this will appear as a text message, so we recommend six (6) or fewer question/answer combos."
        invalid={!!errors?.problems}
        label="Problem areas"
        marginTop={4}
        {...register('problems')}
      >
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
                <Input name='problem' placeholder="Problem" />
                <Textarea name='solution' placeholder="Steps to solve" />
              </Stack>
              {i > 0 && 
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
        >
          Add problem area
        </Button>
      </Field>
    </>
  )
}