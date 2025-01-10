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

export const esimForm = () => {
  const { register, control, formState: { errors } } = useFormContext({
    defaultValues: {
      locations: [],
      plans: [],
    },
  });

  const {
    fields: locationFields,
    append: locationAppend,
    remove: locationRemove,
  } = useFieldArray({
    control,
    name: 'locations',
  });

  const {
    fields: planFields,
    append: planAppend,
    remove: planRemove,
  } = useFieldArray({
    control,
    name: 'plans',
  });

  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="Name of your organization"
        invalid={!!errors?.name}
        label="Organization name"
        required
      >
        <Input placeholder="e-sim Distribution Org" {...register('name')} />
      </Field>
      <Field
        errorText={!!errors?.description && errors.description.message}
        helperText="Describe your organization for the 'About us' section."
        invalid={!!errors?.description}
        label="Organization description"
        marginTop={4}
        required
      >
        <Textarea placeholder="Start typing..." {...register('description')} />
      </Field>
      <Field
        errorText={!!errors?.privacyPolicy && errors.privacyPolicy.message}
        helperText="Describe the privacy policy for a user interacting with this bot."
        invalid={!!errors?.privacyPolicy}
        label="Privacy policy"
        marginTop={4}
        required
      >
        <Textarea {...register('privacyPolicy')} />
      </Field>
      <Field
        errorText={!!errors?.activationInstructions && errors.activationInstructions.message}
        helperText="Include activation instructions for how a user can activate an e-sim."
        invalid={!!errors?.activationInstructions}
        label="Activation instructions"
        marginTop={4}
      >
        <Textarea {...register('activationInstructions')} />
      </Field>
      <Field
        errorText={!!errors?.helpInstructions && errors.helpInstructions.message}
        helperText="Include helpful instructions for what a user should do if their e-sim is not working."
        invalid={!!errors?.helpInstructions}
        label="Help section"
        marginTop={4}
      >
        <Textarea {...register('helpInstructions')} />
      </Field>
      <Fieldset.Root
        invalid={!!errors?.locations}
        label="esim locations"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            esim locations
          </Fieldset.Legend>
          <Fieldset.HelperText>
            List the locations where a user can use an esim.
          </Fieldset.HelperText>
        </Stack>
        {locationFields.map((f, i) => {
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
              <Field>
                <Input
                  placeholder='Enter a location'
                  {...register(`locations.${i}.place`)}
                />
              </Field>
              {i >= 0 &&
                <Button
                  onClick={() => locationRemove(i)}
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
            locationAppend({
              place: ''
            })
          }
          variant="subtle"
          width={40}
        >
          Add location
        </Button>
      </Fieldset.Root>
      <Fieldset.Root
        invalid={!!errors?.plans}
        label="esim plans"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            esim plans
          </Fieldset.Legend>
          <Fieldset.HelperText>
            List the different types of plans a user can ask for.
          </Fieldset.HelperText>
        </Stack>
        {planFields.map((f, i) => {
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
                <Field>
                  <Input
                    placeholder="Amount of data"
                    {...register(`plans.${i}.amount`)}
                  />
                </Field>
                <Field>
                  <Input
                    placeholder="Length of time"
                    {...register(`faq.${i}.length`)}
                  />
                </Field>
              </Stack>
              {i >= 0 &&
                <Button
                  onClick={() => planRemove(i)}
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
            planAppend({
              place: ''
            })
          }
          variant="subtle"
          width={40}
        >
          Add plan info
        </Button>
      </Fieldset.Root>
    </>
  )
}