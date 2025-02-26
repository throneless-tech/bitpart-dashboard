"use client"
import { serverAction } from '@/app/lib/actions';
import dynamic from 'next/dynamic';

// next imports
import Image from "next/image";

// form validation imports
import { FormProvider, useForm, useFormState } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from "../../lib/forms";

// style imports
import styles from "../../page.module.css";

// chakra ui imports
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Heading,
  Highlight,
  Icon,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";

// component imports
import { Checkbox } from "@/components/ui/checkbox"
import {
  ColorModeButton,
  useColorModeValue,
} from "@/components/ui/color-mode"
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from "@/components/ui/radio-card"
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
} from "@/components/ui/steps"
const StepsRoot = dynamic(() => import('@/components/ui/steps'), { ssr: false })

// form imports
import { BasicsForm } from "@/components/forms/basics";
import { BroadcastForm } from "@/components/forms/broadcast";
import { EsimForm } from "@/components/forms/esim";
import { HelpdeskForm } from "@/components/forms/helpdesk";
import { Summary } from "@/components/forms/summary";
import { TiplineForm } from "@/components/forms/tipline";
import { VpnForm } from "@/components/forms/vpn";

// icons imports
import { CgModem } from "react-icons/cg";
import { FaSimCard } from "react-icons/fa";
import { IoHelpBuoySharp } from "react-icons/io5";
import { LuLightbulb } from "react-icons/lu";
import { TbBuildingBroadcastTower } from "react-icons/tb";
import { useEffect, useState } from "react";
import { redirect } from 'next/dist/server/api-utils';

const frameworks = [
  {
    value: "broadcast",
    title: "Broadcast",
    description: "Send messages to many recipients while protecting the privacy of both senders and recipients.",
    icon: <TbBuildingBroadcastTower />
  },
  {
    value: "tipline",
    title: "Tipline",
    description: "Set up an automated system to receive tips.",
    icon: <LuLightbulb />
  },
  {
    value: "helpdesk",
    title: "Helpdesk",
    description: "Set up an automated system to answer questions.",
    icon: <IoHelpBuoySharp />
  },
  {
    value: "esim",
    title: "eSIM",
    description: "Distribute eSIMs to users who request codes.",
    icon: <FaSimCard />
  },
  {
    value: "vpn",
    title: "VPN",
    description: "Distribute VPN codes to users who request them.",
    icon: <CgModem />
  },
]

export default function Create() {
  // const session = serverAction();

  // if (!session) {
  //   redirect('/login');
  // }

  // const [botType, setBotType] = useState("broadcast");
  const [stepCount, setStepCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const [dataConfirmed, setDataConfirmed] = useState(false);

  // update the step count based on prev or next
  const updateStepCount = (step) => {
    setStepCount(stepCount => stepCount += step);
    window.scrollTo(0, 0);
  }

  const methods = useForm({
    defaultValues: { botType: 'broadcast' },
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const values = methods.getValues();

  const [botType] = methods.watch(['botType']);

  const watchBotType = methods.watch('botType');

  const watchAll = methods.watch();

  const formState = methods.formState;

  const validateForm = async (values, e) => {
    console.log('valid e: ', e);

    if (stepCount > 3) {
      console.log('final step! submit data here...');

    } else {

    }

  }

  // set the path that a user takes depending on which bot type they select, and unregister any previously registered but unneeded fields
  const updateBotType = (event) => {
    methods.setValue('botType', event.target.value);
    methods.clearErrors();
    methods.unregister([
      'description',
      'about',
      'safetyTips',
      'faq',
      'privacyPolicy',
      'activationInstructions',
      'helpInstructions',
      'locations',
      'plans',
      'referral',
      'storageAccess',
      'problems',
      'vpnName',
    ]);
  };

  const onSubmit = (data) => {
    console.log('data is being submitted...', data);
    let newData = [];

    // for (var prop in values) {
    //   if (Object.prototype.hasOwnProperty.call(values, prop)) {
    //     if (values[prop] && values[prop].length) {
    //       const newProp = {
    //         name: prop,
    //         value: values[prop]
    //       };
    //       newData.push(newProp);
    //     }
    //   }
    // }
    // console.log('new data!!', newData);

    // setFormData(newData);
  }

  const onError = (errors, e) => {
    console.log('errors: ', errors);
    console.log('values: ', values);

    // let newErrors = [];

    // for (var prop in errors) {
    //   // console.log('error prop is: ', prop);
    //   if (Object.prototype.hasOwnProperty.call(errors, prop)) {
    //     newErrors.push(prop);
    //   }
    // }

    // setFormErrors(newErrors);
  };


  // color mode
  const color = useColorModeValue("maroon", "yellow");

  useEffect(() => { }, [formData, formErrors, stepCount, watchAll]);

  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Button>
            Donate
          </Button>
        </Flex>
      </Container>
      <Container marginBottom={6} maxW="4xl">
        <Heading as="h1" marginBottom={4} size="xl">
          Create a new bot
        </Heading>
        <FormProvider {...methods}>
          <StepsRoot
            count={4}
            step={stepCount}
            onStepChange={(e) => {
              // if (stepCount == 1) {
              //   methods.handleSubmit(onSubmit, onError)(e);
              // }
            }}
          >
            <StepsList>
              <Stack direction={['column', 'row']}>
                <StepsItem index={0} title="Choose your bot type" />
                <StepsItem index={1} title="Customize your bot" />
                <StepsItem index={2} title="Verify your data" />
                <StepsItem index={3} title="Connect your bot" />
              </Stack>
            </StepsList>
            <StepsContent index={0}>
              <Text as='div' marginTop={10}>
                Bitpart works over Signal to ensure as secure and private a connection as possible. If you don't have Signal already,{' '}
                <Link
                  href='https://signal.org/install'
                  color={color}
                  textDecoration='underline'
                  variant='underline'
                >get Signal</Link>
                .
              </Text>
              <Heading as="h2" marginTop={10} size="md">
                What kind of bot do you want to create?
              </Heading>
              <RadioCardRoot
                align="center"
                defaultValue={botType}
                justify="center"
                marginY={6}
                maxW="4xl"
                onChange={updateBotType}
                orientation="vertical"
              >
                <RadioCardLabel>Choose your bot type:</RadioCardLabel>
                <Stack
                  align="stretch"
                  direction={["column", "row"]}
                  flexWrap="wrap"
                  gap={4}
                  justifyContent="center"
                  marginTop={3}
                >
                  {frameworks.map((item) => (
                    <RadioCardItem
                      label={item.title}
                      description={item.description}
                      icon={
                        <Icon fontSize="2xl" color="fg.subtle">
                          {item.icon}
                        </Icon>
                      }
                      indicator={false}
                      key={item.value}
                      maxWidth={300}
                      minWidth={300}
                      width={300}
                      value={item.value}
                      {...methods.register('botType')}
                    />
                  ))}
                </Stack>
              </RadioCardRoot>
            </StepsContent>
            <StepsContent index={1}>
              <Heading
                as="h3"
                marginBottom={4}
                marginTop={10}
                size="md"
              >
                Building {botType} bot
              </Heading>
              <BasicsForm />
              {botType == "broadcast" ? (
                <>
                  <BroadcastForm />
                </>
              ) : botType == "esim" ? (
                <>
                  <EsimForm />
                </>
              ) : botType == "helpdesk" ? (
                <>
                  <HelpdeskForm />
                </>
              ) : botType == "tipline" ? (
                <>
                  <TiplineForm />
                </>
              ) : botType == "vpn" ? (
                <>
                  <VpnForm />
                </>
              ) : (
                <>
                  <Text>
                    Something went wrong. Please contact a system administrator: no bot type selected.
                  </Text>
                </>
              )}
              <Text
                backgroundColor="yellow.muted"
                marginBottom={4}
                marginTop={8}
              >
                Please double check that the above information is correct. You will not be able to update this later.
              </Text>
            </StepsContent>
            <StepsContent index={2}>
              <Text marginTop={10}>
                Here is your new bot summary:
              </Text>
              <Summary data={values} errors={formState.errors} />
              <Text marginTop={10}>
                Does this look correct? If so, confirm with the checkbox below. If not, go back and edit your data. You will not be able to update this later.
              </Text>
              <Checkbox
                checked={dataConfirmed}
                onCheckedChange={(e) => setDataConfirmed(!!e.checked)}
                marginBottom={8}
                marginTop={2}
              >
                Yes, the information I entered to create my bot is correct. I will not be able to edit this later, and must delete this bot and create a new one if I want to update it.
              </Checkbox>
            </StepsContent>
            <StepsContent index={3}>
              <Heading as="h2" marginTop={10} size="md">
                Set up Signal account
              </Heading>
              <Text marginTop={4}>
                If you haven't already, go through{' '}
                <Link
                  href='https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices'
                  color={color}
                  textDecoration='underline'
                  variant='underline'
                >
                  these steps
                </Link>  to link Bitpart to your Signal account.
              </Text>
              <Text marginTop={4}>
                QR code will appear here::::
              </Text>
            </StepsContent>
            <StepsCompletedContent>
              You have created a new bot!
            </StepsCompletedContent>
            <Group>
              <StepsPrevTrigger asChild>
                <Button
                  onClick={() => updateStepCount(-1)}
                  size="sm"
                  variant="outline"
                >
                  Prev
                </Button>
              </StepsPrevTrigger>
              <StepsNextTrigger asChild>
                <Button
                  disabled={(stepCount == 1 && !formState.isValid) || (stepCount == 2 && !dataConfirmed)}
                  onClick={() => updateStepCount(1)}
                  size="sm"
                  variant="outline"
                >
                  {stepCount == 2 ? "Submit" : "Next"}
                </Button>
              </StepsNextTrigger>
            </Group>
          </StepsRoot>
        </FormProvider>
      </Container>
    </Box>
  );
}
