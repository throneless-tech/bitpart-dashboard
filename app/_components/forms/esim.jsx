// base imports
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

// chakra imports
import {
  Fieldset,
  HStack,
  Input,
  Link,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { Button } from "@/app/_components/ui/button";
import { Field } from "@/app/_components/ui/field";

// components
import { FileUploader } from "@/app/_components/forms/fileUpload";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// icons
import { FiDownload } from "react-icons/fi";

export const EsimForm = ({ bot }) => {
  // color mode
  const color = useColorModeValue("maroon", "yellow");

  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  // const {
  //   fields: locationFields,
  //   append: locationAppend,
  //   remove: locationRemove,
  // } = useFieldArray({
  //   control,
  //   name: 'locations',
  // });

  // const {
  //   fields: planFields,
  //   append: planAppend,
  //   remove: planRemove,
  // } = useFieldArray({
  //   control,
  //   name: 'plans',
  // });

  return (
    <>
      <Field
        errorText={!!errors?.name && errors.name.message}
        helperText="This is the name that is visible to your users. It can mirror the bot name, organization name, or be different."
        invalid={!!errors?.name}
        label="Public name"
        required
      >
        <Input placeholder="eSIM distributor" {...register("name")} />
      </Field>
      <Field
        errorText={!!errors?.description && errors.description.message}
        helperText="Enter one sentence about what you do, or what this chatbot offers and to whom."
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
        errorText={!!errors?.privacyPolicy && errors.privacyPolicy.message}
        helperText="Anyone interacting or using your bot will be able to send the bot 'My data' to access this information. Customize the above text to reflect your organization's data rights policy."
        info="privacyPolicy"
        invalid={!!errors?.privacyPolicy}
        label="Data rights"
        marginTop={4}
        required
      >
        <Textarea
          autoresize
          defaultValue={
            bot
              ? bot.privacyPolicy
              : `The automated system intentionally does not ask for your phone number or location, to help keep you safe. You will be asked to check if you have a compatible phone, and which mobile networks you can see where you use your phone, in order to give you an eSIM that will work.\n\nWe keep records of which eSIMs are distributed or not, in order to provide you with a valid eSIM. This data may also be associated with the profile information you share on Signal (such as your profile name, username, and/or phone number if it's visible); and with metadata (like timestamps of when you contacted us.)\n\nWe record and store this information <WHERE?>. It is deleted <HOW OFTEN?>`
          }
          {...register("privacyPolicy")}
        />
      </Field>
      <Field
        errorText={
          !!errors?.activationInstructions &&
          errors.activationInstructions.message
        }
        helperText="Please add instructions for the steps people should take in order to activate their eSIM. The eSIM provider may have instructions you can copy and paste here. If the text is long you could link to a web page, but remember that people in low connectivity settings may be more able to receive a message on Signal than open a web page."
        invalid={!!errors?.activationInstructions}
        label="Activation instructions"
        marginTop={4}
      >
        <Textarea autoresize {...register("activationInstructions")} />
      </Field>
      <Field
        errorText={
          !!errors?.helpInstructions && errors.helpInstructions.message
        }
        helperText="Include helpful instructions for what a user should do if their eSIM is not working."
        invalid={!!errors?.helpInstructions}
        label="Help section"
        marginTop={4}
      >
        <Textarea autoresize {...register("helpInstructions")} />
      </Field>
      {/* <Fieldset.Root
        label="eSIM networks"
        marginTop={4}
      >
        <Stack>
          <Fieldset.Legend>
            eSIM networks
          </Fieldset.Legend>
          <Fieldset.HelperText>
            List the networks where a user can use an eSIM.
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
          Add network
        </Button>
      </Fieldset.Root> */}
      {/* <Fieldset.Root
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
      </Fieldset.Root> */}
      <Fieldset.Root marginTop={6}>
        <Stack>
          <Fieldset.Legend>Upload eSIM codes</Fieldset.Legend>
          <Fieldset.HelperText>
            Please provide a CSV file of your eSIM codes for use. Note that the
            list should only include the mobile network and the code. You must
            download the following template, save and export as a .csv, and
            upload it here. Do not make any changes to the header row.
          </Fieldset.HelperText>
          <Link color={color} href="/esim-template.csv" fontSize="sm">
            Download template
            <FiDownload />
          </Link>
        </Stack>
        <Fieldset.Content>
          <FileUploader register={register("csv")} />
        </Fieldset.Content>
      </Fieldset.Root>
    </>
  );
};
