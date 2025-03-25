"use client"

// base imports
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from "react";
import { prisma } from '@/lib/prisma';

// form validation imports
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from "../lib/forms";

// chakra ui imports
import {
  Box,
  Button,
  Container,
  Group,
  Heading,
  Highlight,
  Icon,
  Input,
  Link,
  List,
  QrCode,
  Stack,
  Text,
} from "@chakra-ui/react";

// component imports
import { Checkbox } from "@/app/components/ui/checkbox"
import {
  ColorModeButton,
  useColorModeValue,
} from "@/app/components/ui/color-mode"
import { Field } from "@/app/components/ui/field";
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from "@/app/components/ui/radio-card"
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
} from "@/app/components/ui/steps"
const StepsRoot = dynamic(() => import('@/app/components/ui/steps'), { ssr: false })

// form imports
import { BasicsForm } from "@/app/components/forms/basics";
import { BroadcastForm } from "@/app/components/forms/broadcast";
import { EsimForm } from "@/app/components/forms/esim";
import { HelpdeskForm } from "@/app/components/forms/helpdesk";
import { Summary } from "@/app/components/forms/summary";
import { TiplineForm } from "@/app/components/forms/tipline";
import { VpnForm } from "@/app/components/forms/vpn";

// icons imports
import { CgModem } from "react-icons/cg";
import { FaSimCard } from "react-icons/fa";
import { IoHelpBuoySharp } from "react-icons/io5";
import { LuLightbulb } from "react-icons/lu";
import { TbBuildingBroadcastTower } from "react-icons/tb";

// actions
import { createBot } from '../actions/createBot';

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

const valuesToUnregister = [
  'description',
  'about',
  'adminPhones',
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
]

const IFrame = (props) => {
  const { height, ref, src, width } = props;
  console.log(props);

  return (
    <iframe src={src} height={height} width={width} />
  )
};

export default function CreateBotFlow({ userId }) {
  const [createdBot, setCreatedBot] = useState(null);
  // const [botType, setBotType] = useState("broadcast");
  const [stepCount, setStepCount] = useState(0);
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

  const watchAll = methods.watch();

  const formState = methods.formState;

  // set the path that a user takes depending on which bot type they select, and unregister any previously registered but unneeded fields
  const updateBotType = (event) => {
    methods.setValue('botType', event.target.value);
    methods.clearErrors();
    methods.unregister(valuesToUnregister);
  };

  const onSubmit = async (data) => {
    const bot = await createBot(data, userId);
    setCreatedBot(bot);
  }

  const onError = (errors, e) => {
    console.log('errors prevented form from submitting: ', errors);
  };

  // color mode
  const color = useColorModeValue("maroon", "yellow");

  // signal captcha
  const ref = useRef(null);
  const [captchaContainer, setCaptchaContainer] = useState(null)
  const handleCaptchaContainer = (e) => {
    console.log('ref: ', ref.current);
    console.log("e: ", e);

    const captcha = ref.current?.contentWindow?.document?.getElementById("captcha");
    console.log(captcha);

  }

  // web sockets
  useEffect(() => {
    // const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_BITPART_SERVER_URL}:${process.env.NEXT_PUBLIC_BITPART_SERVER_PORT}/ws`);
    // ws.onopen = () => {
    //   console.log('Connected to WebSocket');
    //   ws.send('Hello, WebSocket!');
    // };
    // ws.onmessage = (event) => {
    //   console.log('Message received:', event.data);
    // };
    // ws.onclose = () => {
    //   console.log('WebSocket connection closed');
    // };
    // return () => {
    //   ws.close();
    // };
  }, []);

  useEffect(() => { }, [captchaContainer, createdBot, stepCount, watchAll]);

  return (
    <Container marginBottom={6} maxW="6xl">
      <Heading as="h1" marginBottom={4} size="xl">
        Create a new bot
      </Heading>
      <FormProvider {...methods}>
        <StepsRoot
          count={5}
          step={stepCount}
          onStepChange={(e) => {
            if (stepCount == 2) {
              methods.handleSubmit(onSubmit, onError)(e);
            }
          }}
          variant="subtle"
        >
          <StepsList>
            <Stack direction={['column', 'column', 'row']}>
              <StepsItem index={0} title="Choose your bot type" />
              <StepsItem index={1} title="Customize your bot" />
              <StepsItem index={2} title="Confirm your data" />
              <StepsItem index={3} title="Create a captcha" />
              <StepsItem index={4} title="Connect your bot" />
            </Stack>
          </StepsList>
          <StepsContent index={0}>
            <Text as='div' marginTop={10}>
              Bitpart works over Signal to ensure as secure and private a connection as possible. If you don't have Signal already,{' '}
              <Link
                href='https://signal.org/install'
                color={color}
                textDecoration='underline'
                target='_blank'
                variant='underline'
              >get Signal</Link>
              .
            </Text>
            <Text marginTop={8}>
              <Highlight styles={{ px: "0.5", bg: "yellow.muted" }} query="We recommend setting up a separate Signal account for your bot.">
                Remember that using primary device will show your name and you'll receive all the bot messages. We recommend setting up a separate Signal account for your bot.
              </Highlight>
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
            {/* <Heading
                as="h3"
                marginBottom={4}
                marginTop={10}
                size="md"
              >
                Building {botType} bot
              </Heading> */}
            <BasicsForm />
            <Heading as='h2' marginBottom={4} size='md'>
              Bot specifics
            </Heading>
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
            <Box marginY={8}>
              <Text>
                In order to set up your Bitpart bot via Signal, please go to{' '}
                <Link color={color} href='https://signalcaptchas.org/challenge/generate' target='_blank' variant='underline'>
                  signalcaptchas.org
                </Link>{' '}
                to generate a captcha. Follow instructions but when it says "Open Signal"  right click, copy and paste the link back on this page.
              </Text>
              <Text marginTop={4}>
                This is required by Signal. Sorry!
              </Text>
              <Field
                // errorText={!!errors?.name && errors.name.message}
                helperText="Enter the Signal captcha url here"
                // invalid={!!errors?.name}
                label="Signal captcha confirmation"
                marginTop={8}
                required
              >
                <Input placeholder='signalcaptcha://' />
              </Field>
            </Box>
          </StepsContent>
          <StepsContent index={4}>
            <Heading as="h2" marginBottom={4} marginTop={10} size="md">
              Connect Bitpart to Signal
            </Heading>
            <QrCode.Root value="https://signal.org">
              <QrCode.Frame>
                <QrCode.Pattern />
              </QrCode.Frame>
            </QrCode.Root>
            <List.Root marginLeft={4} marginTop={4}>
              <List.Item>
                On your phone, open Signal and navigate to Signal Settings {'>'} Linked devices.
              </List.Item>
              <List.Item>
                Tap the Android + with blue circle (Android) or Link New Device (iOS)
              </List.Item>
              <List.Item>
                Use your phone to scan the QR code.
              </List.Item>
            </List.Root>
            <Text marginTop={4}>
              You can find more information or troubleshoot by following{' '}
              <Link
                href='https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices'
                color={color}
                textDecoration='underline'
                target='_blank'
                variant='underline'
              >
                this link
              </Link>.
            </Text>
          </StepsContent>
          <StepsCompletedContent>
            <Box marginY={12}>
              You have created a new bot! Go to your{' '}
              <Link color={color} href='/dashboard' variant="underline">
                Dashboard
              </Link>
              {' '}to see all the bots you have created.
            </Box>
          </StepsCompletedContent>
          <Group>
            <StepsPrevTrigger asChild>
              <Button
                disabled={stepCount == 3}
                onClick={() => updateStepCount(-1)}
                size="sm"
                variant="outline"
              >
                Prev
              </Button>
            </StepsPrevTrigger>
            <StepsNextTrigger asChild>
              <Button
                disabled={(stepCount == 1 && !formState.isValid) || (stepCount == 2 && !dataConfirmed) || stepCount > 4}
                onClick={() => updateStepCount(1)}
                size="sm"
                variant="outline"
              >
                {stepCount == 2 ? "Submit" : stepCount >= 4 ? "Finished" : "Next"}
              </Button>
            </StepsNextTrigger>
          </Group>
        </StepsRoot>
      </FormProvider>
    </Container>
  )
}