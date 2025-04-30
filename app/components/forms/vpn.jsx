// base imports
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

// chakra imports
import { Fieldset, Input, Link, Stack, Textarea } from "@chakra-ui/react";
import { Button } from "@/app/components/ui/button";
import { Field } from "@/app/components/ui/field";
import {
  NumberInputField,
  NumberInputLabel,
  NumberInputRoot,
} from "@/app/components/ui/number-input";

// components
import { FileUploader } from "@/app/components/forms/fileUpload";
import { useColorModeValue } from "@/app/components/ui/color-mode";

// icons
import { FiDownload } from "react-icons/fi";

export const VpnForm = () => {
  // color mode
  const color = useColorModeValue("maroon", "yellow");

  const {
    register,
    control,
    formState: { errors },
  } = useFormContext({
    defaultValues: {
      faq: [],
      locations: [],
      // plans: [],
    },
  });

  const {
    fields: locationFields,
    append: locationAppend,
    remove: locationRemove,
  } = useFieldArray({
    control,
    name: "locations",
  });

  const {
    fields: faqFields,
    append: faqAppend,
    remove: faqRemove,
  } = useFieldArray({
    control,
    name: "faq",
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
        <Input placeholder="VPN Distribution Org" {...register("name")} />
      </Field>
      <Field
        errorText={!!errors?.description && errors.description.message}
        helperText="Enter one sentence describing your group or organization, why you distribute VPNs or who the VPN distribution is for."
        invalid={!!errors?.description}
        label="About"
        marginTop={4}
        required
      >
        <Textarea
          autoresize
          placeholder="Start typing..."
          {...register("description")}
        />
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
          {...register("maxCodes")}
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
        <Input {...register("responseTime")} maxW={280} />
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
        errorText={
          !!errors?.activationInstructions &&
          errors.activationInstructions.message
        }
        helperText="Please add instructions for the steps people should take in order to use their VPN code. The  VPN provider may have instructions you can copy and paste here. If the text is long you could link to a web page, but remember that people in low connectivity settings may be more able to receive a message on Signal than open a web page."
        info="activationInstructions"
        invalid={!!errors?.activationInstructions}
        label="Activation instructions"
        marginTop={4}
      >
        <Textarea autoresize {...register("activationInstructions")} />
      </Field>
      {/* We are currently parsing providers from csv; removing the following field */}
      {/* <Fieldset.Root
        label="VPN locations"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            VPN providers
          </Fieldset.Legend>
          <Fieldset.HelperText>
            List the providers who are sharing VPN codes.
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
          Add provider
        </Button>
      </Fieldset.Root> */}
      <Fieldset.Root label="FAQs" marginTop={4}>
        <Stack>
          <Fieldset.Legend>FAQs</Fieldset.Legend>
          <Fieldset.HelperText>
            If you need FAQs, we recommend four (4) or fewer question/answer
            combos. Start with your most asked question at the top. Keep in mind
            Bitpart will automatically add an 'other' question for a freeform
            ask from a user.
          </Fieldset.HelperText>
        </Stack>
        {faqFields.map((f, i) => {
          return (
            <Stack
              alignItems={"center"}
              direction={["column", "row"]}
              justifyContent="flex-start"
              key={f.id}
              marginBottom={4}
              spacing={20}
              width="100%"
            >
              <Stack width="100%">
                <Field invalid={!!errors?.faq} errorText={errors.faq?.question}>
                  <Input
                    placeholder="Question"
                    {...register(`faq.${i}.question`)}
                  />
                </Field>
                <Field invalid={!!errors?.faq} errorText={errors.faq?.answer}>
                  <Input
                    placeholder="Answer"
                    {...register(`faq.${i}.answer`)}
                  />
                </Field>
              </Stack>
              {i >= 0 && (
                <Button onClick={() => faqRemove(i)} height={6} width={1}>
                  X
                </Button>
              )}
            </Stack>
          );
        })}
        <Button
          onClick={() =>
            faqAppend({
              question: "",
              answer: "",
            })
          }
          variant="subtle"
          width={40}
        >
          Add FAQ
        </Button>
      </Fieldset.Root>
      <Fieldset.Root marginTop={6}>
        <Stack>
          <Fieldset.Legend>Upload VPN codes</Fieldset.Legend>
          <Fieldset.HelperText>
            Please provide a CSV file of your VPN codes for use. Note that the
            list should only include the provider and the code. You may download
            the following template, save and export as a .csv, and upload it
            here.
          </Fieldset.HelperText>
          <Link color={color} href="/vpn-template.csv" fontSize="sm">
            Download template
            <FiDownload />
          </Link>
        </Stack>
        <Fieldset.Content>
          <Field
            invalid={!!errors?.csv}
            errorText={!!errors?.csv && errors.csv.message}
          >
            <FileUploader register={register("csv")} />
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </>
  );
};
