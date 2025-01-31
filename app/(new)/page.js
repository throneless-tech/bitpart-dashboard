"use client"
import { serverAction } from '@/app/lib/actions';

// next imports
import Image from "next/image";

// form validation imports
import { FormProvider, useForm, useFormState } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from "../lib/forms";

// style imports
import styles from "../page.module.css";

// chakra ui imports
import {
  Box,
  Button,
  Container,
  createListCollection,
  Flex,
  Group,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field"

// component imports
import {
  ColorModeButton,
  useColorMode,
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
  StepsRoot,
} from "@/components/ui/steps"

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

export default function Home() {
  const session = serverAction();

  if (!session) {
    redirect('/login');
  }

  const [botType, setBotType] = useState("broadcast");
  const [stepCount, setStepCount] = useState(0);
  const [formData, setFormData] = useState([]);
  const [formErrors, setFormErrors] = useState([]);

  // set the path that a user takes depending on which bot type they select
  const updateBotType = (event) => {
    // console.log('update bot type fx: ', event.target.value);

    setBotType(event.target.value)
  };

  // update the step count based on prev or next
  const updateStepCount = (step) => {
    setStepCount(stepCount => stepCount += step);
  }

  // form validation
  // const { register, handleSubmit, errors, } = useForm({


  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const values = methods.getValues();

  const validateForm = async (values, e) => {
    console.log('valid e: ', e);

    if (stepCount > 3) {
      console.log('final step! submit data here...');

    } else {

    }

  }

  const onError = (errors, e) => {
    console.log('errors: ', errors);
    console.log('values: ', values);

    let newErrors = [];

    for (var prop in errors) {
      // console.log('error prop is: ', prop);
      if (Object.prototype.hasOwnProperty.call(errors, prop)) {
        newErrors.push(prop);
      }
    }

    setFormErrors(newErrors);

    let newData = [];

    for (var prop in values) {
      if (Object.prototype.hasOwnProperty.call(values, prop)) {
        if (values[prop] && values[prop].length) {
          const newProp = {
            name: prop,
            value: values[prop]
          };
          newData.push(newProp);
        }
      }
    }
    // console.log('new data!!', newData);

    setFormData(newData);

    // alert('Please fix the form errors before continuing on.');

    // if (e.step == 0) {
    //   setStepCount(stepCount => stepCount += 1);
    // } else if (stepCount > 0) {
    //   setStepCount(stepCount => stepCount -= 1);
    // }
  };


  // color mode
  const { toggleColorMode } = useColorMode()

  const color = useColorModeValue("maroon", "yellow")

  useEffect(() => {

  }, [formErrors, formData])

  useEffect(() => { }, [botType, formData, stepCount]);

  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton onClick={toggleColorMode} />
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
              methods.handleSubmit(validateForm, onError)(e);
            }}
          >
            <StepsList>
              <StepsItem index={0} title="Choose your bot type" />
              <StepsItem index={1} title="Customize your bot" />
              <StepsItem index={2} title="Connect your bot" />
            </StepsList>
            <StepsContent index={0}>
              <Text marginTop={10}>
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
                defaultValue="broadcast"
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
            </StepsContent>
            <StepsContent index={2}>
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
            <StepsContent index={3}>
              Please double check that the following information is correct. You will not be able to update this later.
              <Summary data={formData} errors={formErrors} />
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
                  // disabled={!isValid}
                  onClick={() => updateStepCount(1)}
                  size="sm"
                  variant="outline"
                >
                  {stepCount > 2 ? "Submit" : "Next"}
                </Button>
              </StepsNextTrigger>
            </Group>
          </StepsRoot>
        </FormProvider>
      </Container>
    </Box>
  );
}
