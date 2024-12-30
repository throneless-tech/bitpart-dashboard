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

export const EsimForm = ({ schema }) => {
  const { register, control, errors } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'locations',
  });

  return (
    <>
      <Field
        errorText="Field is required"
        helperText="Name of your organization"
        invalid={!!errors?.name}
        label="Organization name"
        required
        {...register('name')}
      >
        <Input placeholder="e-sim Distribution Org" />
      </Field>
      <Field
        errorText="Field is required"
        helperText="Describe your organization for the 'About us' section."
        invalid={!!errors?.description}
        label="Organization description"
        marginTop={4}
        required
        {...register('description')}
      >
        <Textarea placeholder="Start typing..." />
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
        errorText="Field must be a string of text."
        helperText="Include activation instructions for how a user can activate an e-sim."
        invalid={!!errors?.activationInstructions}
        label="Activation instructions"
        marginTop={4}
        {...register('activationInstructions')}
      >
        <Textarea />
      </Field>
      <Field
        errorText="Field must be a string of text."
        helperText="Include helpful instructions for what a user should do if their e-sim is not working."
        invalid={!!errors?.helpInstructions}
        label="Help section"
        marginTop={4}
        {...register('helpInstructions')}
      >
        <Textarea />
      </Field>
      <Field
        errorText="Fill out all the fields that you add."
        helperText="List the locations where a user can use an e-sim."
        invalid={!!errors?.locations}
        label="e-sim locations"
        marginTop={4}
        {...register('locations')}
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
                <Input name='place' />
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
              place: ''
            })
          }
          variant="subtle"
        >
          Add location
        </Button>
      </Field>
    </>
  )
}