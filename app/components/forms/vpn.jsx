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

// components
import { FileUploader } from "@/app/components/forms/fileUpload";

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
      <Field
        errorText={!!errors?.maxCodes && errors.maxCodes.message}
        helperText="What is the maximum number of codes a user can request at a time?"
        invalid={!!errors?.maxCodes}
        label="Max downloads"
        marginTop={4}
        required
      >
        <NumberInputRoot
          min={1}
          formatOptions={{
            maximumFractionDigits: 0,
          }}
          {...register('maxCodes')}
        >
          <NumberInputLabel />
          <NumberInputField />
        </NumberInputRoot>
      </Field>
      <Field
        errorText={!!errors?.responseTime && errors.responseTime.message}
        helperText="How long your users can expect to have to wait for a reply, eg., '24 hours' or '2 days' or '1 week'."
        invalid={!!errors?.responseTime}
        label="Response time"
        marginTop={4}
        required
      >
        <Input {...register('responseTime')} maxW={280} />
      </Field>
      {/* FIXME do we need storage time? */}
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
      {/* <Field
        errorText={!!errors?.vpnName && errors.vpnName.message}
        helperText="Name of the VPN provider."
        invalid={!!errors?.vpnName}
        label="VPN provider name"
        marginTop={4}
        required
      >
        <Input {...register('vpnName')} />
      </Field> */}
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
      {/* FIXME do we need FAQ and limits on # of codes requested? */}
      <Fieldset.Root marginTop={6}>
        <Stack>
          <Fieldset.Legend>Upload VPN codes</Fieldset.Legend>
          <Fieldset.HelperText>
            Please provide a CSV file of your VPN codes for use. Note that the list should only include the provider and the code. You may download the following template, save and export as a .csv, and upload it here.
          </Fieldset.HelperText>
        </Stack>
        <Fieldset.Content>
          <Field
            invalid={!!errors?.csv}
            errorText={!!errors?.csv && errors.csv.message}
          >
            <FileUploader register={register('csv')} />
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </>
  )
}