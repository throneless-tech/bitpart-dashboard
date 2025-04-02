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

export const EsimForm = () => {
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
        helperText="This is the name that is visible to your users. It can mirror the bot name, organization name, or be different."
        invalid={!!errors?.name}
        label="Public name"
        required
      >
        <Input placeholder="eSIM distributor" {...register('name')} />
      </Field>
      <Field
        errorText={!!errors?.description && errors.description.message}
        helperText="Describe what people can expect when engaging with this service."
        info="description"
        invalid={!!errors?.description}
        label="About"
        marginTop={4}
        required
      >
        <Textarea placeholder="Start typing..." {...register('description')} />
      </Field>
      <Field
        errorText={!!errors?.privacyPolicy && errors.privacyPolicy.message}
        helperText="Describe the privacy policy for a person interacting with this bot."
        info="privacyPolicy"
        invalid={!!errors?.privacyPolicy}
        label="Privacy policy"
        marginTop={4}
        required
      >
        <Textarea {...register('privacyPolicy')} />
      </Field>
      <Field
        errorText={!!errors?.activationInstructions && errors.activationInstructions.message}
        helperText="Include activation instructions for how a user can activate an eSIM."
        info="activationInstructions"
        invalid={!!errors?.activationInstructions}
        label="Activation instructions"
        marginTop={4}
      >
        <Textarea {...register('activationInstructions')} />
      </Field>
      <Field
        errorText={!!errors?.helpInstructions && errors.helpInstructions.message}
        helperText="Include helpful instructions for what a user should do if their eSIM is not working."
        info="helpInstructions"
        invalid={!!errors?.helpInstructions}
        label="Help section"
        marginTop={4}
      >
        <Textarea {...register('helpInstructions')} />
      </Field>
      <Fieldset.Root
        label="eSIM locations"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            eSIM locations
          </Fieldset.Legend>
          <Fieldset.HelperText>
            List the locations where a user can use an eSIM.
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
              <Field
                invalid={!!errors?.locations}
                errorText={errors.locations?.place && errors.locations?.place.message}
              >
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
        label="eSIM plans"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            eSIM plans
          </Fieldset.Legend>
          <Fieldset.HelperText>
            List the different types of plans a user can ask for.
          </Fieldset.HelperText>
        </Stack>
        {/* FIXME do we need to remove this? */}
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
                <Field
                  invalid={!!errors?.plans}
                  errorText={errors.plans?.amount}
                >
                  <Input
                    placeholder="Amount of data"
                    {...register(`plans.${i}.amount`)}
                  />
                </Field>
                <Field
                  invalid={!!errors?.plans}
                  errorText={errors.plans?.length}
                >
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