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

export const VpnForm = ({ schema }) => {
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
        <Input placeholder="VPN Distribution Org" />
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
        helperText="Name of VPN provider"
        invalid={!!errors?.vpnName}
        label="VPN provider name"
        marginTop={4}
        required
        {...register('vpnName')}
      >
        <Input />
      </Field>
      <Field
        errorText="Field must be a string of text."
        helperText="Include activation instructions for how a user can activate an e-sim."
        invalid={!!errors?.activationInstructions}
        label="Activation instructions"
        marginTop={4}
        {...register('activationInstructions')}
      >
        <Textarea placeholder="Start typing..." />
      </Field>
      <Field
        errorText="Fill out all the fields that you add."
        helperText="List the locations where a user can use an e-sim."
        invalid={!!errors?.locations}
        label="VPN locations"
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