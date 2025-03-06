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
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from "@/app/components/ui/number-input"

export const VpnForm = () => {
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
        <Input placeholder="VPN Distribution Org" {...register('name')} />
      </Field>
      <Field
        errorText={!!errors?.description && errors.description.message}
        helperText="Describe what your organization does and/or what to expect from the bot."
        info="description"
        invalid={!!errors?.description}
        label="About"
        marginTop={4}
        required
      >
        <Textarea placeholder="Start typing..." {...register('description')} />
      </Field>
      {/* <Field
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
      </Field> */}
      <Field
        errorText={!!errors?.vpnName && errors.vpnName.message}
        helperText="Name of the VPN provider."
        invalid={!!errors?.vpnName}
        label="VPN provider name"
        marginTop={4}
        required
      >
        <Input {...register('vpnName')} />
      </Field>
      <Field
        errorText={!!errors?.activationInstructions && errors.activationInstructions.message}
        helperText="Include instructions for how someone can activate a vpn."
        info="activationInstructions"
        invalid={!!errors?.activationInstructions}
        label="Activation instructions"
        marginTop={4}
      >
        <Textarea {...register('activationInstructions')} />
      </Field>
      <Fieldset.Root
        label="VPN locations"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            VPN locations
          </Fieldset.Legend>
          <Fieldset.HelperText>
            List the locations where a user can use a VPN.
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
                errorText={errors.locations?.place}
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
        label="VPN plans"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            VPN plans
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