"use client"

// base imports
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

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
  Link,
  List,
  QrCode,
  Stack,
  Text,
} from "@chakra-ui/react";

// component imports
import { Checkbox } from "@/app/components/ui/checkbox";
import { useColorModeValue } from "@/app/components/ui/color-mode";
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from "@/app/components/ui/radio-card";
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
} from "@/app/components/ui/steps";
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
import { createBotBitpart, createBotPrisma, createChannelBitPart, linkChannelBitpart } from '@/app/actions/createBot';
import { createPasscode } from '@/app/actions/formatBot';
import { emsCall } from '@/app/actions/ems';
import { getUserBots } from "@/app/actions/getUserBots";

// constants
import { MAX_BOTS } from '@/app/constants';

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
    description: "Distribute eSIMs to people who request codes.",
    icon: <FaSimCard />
  },
  {
    value: "vpn",
    title: "VPN",
    description: "Distribute VPN codes to people who request them.",
    icon: <CgModem />
  },
]

const valuesToUnregister = [
  'about',
  'activationInstructions',
  // 'adminPhones',
  'csv',
  'description',
  'faq',
  'helpInstructions',
  'locations',
  'maxCodes',
  // 'plans',
  'privacyPolicy',
  'problems',
  'referral',
  'responseTime',
  'safetyTips',
  'storageAccess',
  'vpnName',
]

export default function CreateBotFlow({ userId }) {
  const [notAllowed, setNotAllowed] = useState(false);
  const [createdBot, setCreatedBot] = useState(null);
  const [stepCount, setStepCount] = useState(0);
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [botPasscode, setBotPasscode] = useState('');
  const [qrLink, setQRLink] = useState('');

  // ensure user has not maxed out the number of bots they can create
  useEffect(() => {
    async function fetchBots() {
      const fetchedBots = await getUserBots(userId);
      if (fetchedBots.length >= MAX_BOTS) {
        setNotAllowed(true);
      }
    }
    fetchBots();
  }, [])

  useEffect(() => { }, [notAllowed])

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

  // submit bot creation for bitpart server and prisma db
  const onSubmit = async (data) => {
    setIsFetching(true);
    let passcode = await createPasscode();
    setBotPasscode(passcode);

    try {
      const botBitpart = await createBotBitpart(data, passcode);

      if (botBitpart?.message_type === "Error") {
        throw new Error(botBitpart.data.response);
      }

      let emsData;
      if (data.botType === "esim" || data.botType === "vpn") {
        emsData = emsCall('test', data.botType, data.csv);
      }

      const channelBitpartLink = await linkChannelBitpart(botBitpart.data.response.bot.id)

      if (channelBitpartLink?.message_type === "Error") {
        throw new Error(channelBitpartLink.data.response);
      }

      setQRLink(channelBitpartLink.data.response);

      // const bot = await createBotPrisma(data, userId, passcode);

      // setCreatedBot(bot);
    } catch (error) {
      setStepCount(stepCount => stepCount -= 1);
      console.log(error);

      alert("A server error occurred while trying to create this bot. Please contact an admin for assistance.");
    } finally {
      setIsFetching(false);
    }
  }

  // handle form submission errors
  const onError = (errors, e) => {
    console.log('errors prevented form from submitting: ', errors);
    alert('The following errors prevented form from submitting: ', errors);
  };

  // color mode
  const color = useColorModeValue("maroon", "yellow");

  useEffect(() => { }, [createdBot, isFetching, stepCount, watchAll]);

  if (notAllowed) {
    return (
      <Box>
        <Container marginTop={8} maxWidth="lg">
          <Text>
            You have reached the limit on how many bots a user may create. Please{' '}
            <Link color={color} href='/dashboard' variant="underline">
              return home
            </Link>
            {' '}and delete a bot if you would like to create a new one.
          </Text>
        </Container>
      </Box>
    )
  } else {
    return (
      <Container marginBottom={6} maxW="6xl">
        <Heading as="h1" marginBottom={4} size="xl">
          Create a new bot
        </Heading>
        <FormProvider {...methods}>
          <StepsRoot
            count={4}
            step={stepCount}
            onStepChange={(e) => {
              if (stepCount === 2) {
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
                <StepsItem index={3} title="Connect your bot" />
                <StepsItem index={4} title="Use your bot" />
              </Stack>
            </StepsList>
            <StepsContent
              index={0}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              <Text as='div' marginTop={10}>
                Bitpart is designed to work using Signal, a platform that offers the highest standard of security and privacy among free and publicly available messaging platforms available today.
              </Text>
              <Text marginTop={8}>
                (Don’t have Signal? Get it {' '}
                <Link
                  href='https://signal.org/install'
                  color={color}
                  textDecoration='underline'
                  target='_blank'
                  variant='underline'
                >here</Link>
                .)
              </Text>
              <Text marginTop={8}>
                <Highlight styles={{ px: "0.5", bg: "yellow.muted" }} query="We recommend setting up a separate Signal account for your bot.">
                  Remember, if you use your personal Signal account, the recipients of your messages will see your name. You will also receive all the bot messages. We recommend setting up a separate Signal account for your Bitpart bot.
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
            <StepsContent
              index={1}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
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
            <StepsContent
              index={2}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
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
            <StepsContent
              index={3}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              <Heading as="h2" marginBottom={4} marginTop={10} size="md">
                Connect Bitpart to Signal
              </Heading>
              <QrCode.Root value={qrLink}>
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
            <StepsCompletedContent
              index={0}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              <Text marginTop={12}>
                Your broadcast channel has now been created!
              </Text>
              <Text fontWeight={700} marginTop={4}>
                How can I send out messages?
                </Text>
              <Text marginTop={4}>
                For the system to recognise you as the person sending broadcast messages (and not as someone joining the broadcast channel) please send a message on Signal to your channel{' '} {createdBot && createdBot.phone ? createdBot.phone : ""} with the passcode.
              </Text>
              <Text marginTop={4}>
                Your passcode is{' '}
                <Text as="span" fontSize="xl">
                  {botPasscode}
                </Text>
              </Text>
              <Text marginTop={4}>
                You only need to send it once. Bitpart will recognise you going forwards. Any message you then send to your channel will be forwarded on to everyone who has 'signed up' to the channel.
              </Text>
              <Text marginTop={4}>
                If you want to change or remove a number in future, sending "Delete" will erase the conversation and thus Bitpart's memory of you as someone who is able to send broadcast messages.
              </Text>
              <Text marginTop={4}>
                More than one person can send broadcast messages. If another number also sends the passcode over Signal to your channel, they will be able to send out broadcast messages too.
              </Text>
              <Text marginTop={4}>
                Keep your passcode secure. Remember -- this passcode gives someone access to send messages to the entire channel.
              </Text>
              <Text fontWeight={700} marginTop={4}>
                What should I do now?
              </Text>
              <List.Root as="ol" marginLeft={4} marginTop={2}>
                <List.Item>
                  Message your bot with the passcode to establish you as a broadcaster.
                </List.Item>
                <List.Item>
                  Test your channel by using a different number to send a Signal message to your channel.
                </List.Item>
                <List.Item>
                  Share your channel widely with your target audience. 
                </List.Item>
              </List.Root>
              <Text marginTop={4}>
                Go {' '}
                <Link color={color} href='/dashboard' variant="underline">
                  home
                </Link>
                {' '}to see your bots and create a new one. You will be able to find the passcode again there. 
              </Text>
            </StepsCompletedContent>
            <Group>
              <StepsPrevTrigger asChild>
                <Button
                  // disabled={stepCount == 0 || stepCount == 3}
                  onClick={() => updateStepCount(-1)}
                  size="sm"
                  variant="outline"
                >
                  Prev
                </Button>
              </StepsPrevTrigger>
              <StepsNextTrigger asChild>
                <Button
                  disabled={(stepCount == 1 && !formState.isValid) || (stepCount == 2 && !dataConfirmed) || stepCount > 3}
                  onClick={() => {
                    if (!isFetching) {
                      updateStepCount(1);
                    }
                  }}
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

}