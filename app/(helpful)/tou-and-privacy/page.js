"use client";

// base imports
import React from "react";
import { useSession } from "next-auth/react";

// chakra ui imports
import {
  Box,
  ClientOnly,
  Container,
  Heading,
  Link,
  List,
  Table,
  Text,
} from "@chakra-ui/react";

// component imports
import { useColorModeValue } from "@/app/_components/ui/color-mode";
import Header from "@/app/_components/header";

// fonts
import { funnel, geistMono } from "@/app/fonts";

export default function About() {
  // session
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("purple.600", "purple.400");
  const borderColor = useColorModeValue("black", "white");

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container maxW="3xl" py={6}>
        <Heading as="h1" className={funnel.className} size="4xl">
          Terms of Use & Privacy Policy
        </Heading>
        <ClientOnly>
          <Text marginTop={6}>
            Bitpart is a messaging tool designed for human rights organizations,
            activists, journalists and human rights defenders working in
            repressive political environments at risk of surveillance. It
            enables you to send and receive secure, automated messages to a
            particular community over Signal by creating your own bot. These can
            be used for broadcast messaging, helpdesks, tiplines, and
            distributing eSIMs or VPNs.
          </Text>
          <Text marginTop={2}>
            The{" "}
            <Link color={color} href="#tou">
              Terms of Use
            </Link>{" "}
            sets out what we offer and what we expect from you if you would like
            to use Bitpart.
          </Text>
          <Text marginTop={2}>
            The{" "}
            <Link color={color} href="#privacy-policy">
              Privacy Policy
            </Link>{" "}
            outlines how we collect, use, and safeguard your personal
            information when you interact with our organization and services.
          </Text>
          <Text fontWeight={700} marginTop={2}>
            Contact us at{" "}
            <Link color={color} href="mailto:contact@bitp.art">
              contact@bitp.art
            </Link>{" "}
            if you have any questions. We welcome your feedback.
          </Text>
          <List.Root marginLeft={4} marginTop={8}>
            <List.Item>
              <Link color={color} href="#tou">
                Terms of Use
              </Link>
              <List.Root marginLeft={4}>
                <List.Item>
                  <Link color={color} href="#tou-formats">
                    Formats
                  </Link>
                </List.Item>
                <List.Item>
                  <Link color={color} href="#tou-acceptable-behavior">
                    Acceptable Behavior
                  </Link>
                </List.Item>
                <List.Item>
                  <Link color={color} href="#tou-account">
                    Account
                  </Link>
                </List.Item>
                <List.Item>
                  <Link color={color} href="#tou-data-processing">
                    Data Processing
                  </Link>
                </List.Item>
                <List.Item>
                  <Link color={color} href="#tou-data-security">
                    Data Security
                  </Link>
                </List.Item>
                <List.Item>
                  <Link color={color} href="#tou-service-availability">
                    Service Availability
                  </Link>
                </List.Item>
                <List.Item>
                  <Link
                    color={color}
                    href="#tou-respecting-terms-messaging-platforms"
                  >
                    Respecting the Terms of Messaging Platforms
                  </Link>
                </List.Item>
              </List.Root>
            </List.Item>
            <List.Item>
              <Link color={color} href="#privacy-policy">
                Privacy Policy
              </Link>
            </List.Item>
            <List.Root marginLeft={4}>
              <List.Item>
                <Link color={color} href="#privacy-policy-who-are-we">
                  Who are we?
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-why-collect-data">
                  Why Do We Collect Your Data?
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-personal-data">
                  Personal Data That Bitpart Collects and Processes
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-when-shared-data">
                  When We Share Your Data
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-data-retention">
                  How Long We Keep Your Data
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-delete-your-data">
                  Delete Your Data
                </Link>
              </List.Item>
              <List.Item>
                <Link
                  color={color}
                  href="#privacy-policy-how-we-secure-your-data"
                >
                  How We Secure Your Data
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-signal">
                  Bitpart and Signal
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-your-data-rights">
                  Your Data Rights
                </Link>
              </List.Item>
              <List.Item>
                <Link color={color} href="#privacy-policy-changes">
                  Changes to This Policy
                </Link>
              </List.Item>
            </List.Root>
            <List.Item>
              <Link color={color} href="#acknowledgements">
                Acknowledgements
              </Link>
            </List.Item>
          </List.Root>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="tou"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Terms of Use
          </Heading>
          <Heading
            as="h3"
            className={geistMono.className}
            marginTop={8}
            size="xl"
          >
            Definitions
          </Heading>
          <Text marginTop={2} fontStyle="italic">
            <Text as="em" fontWeight={700}>
              Bot Creators:
            </Text>{" "}
            An individual, group or organization who have set up an account and
            create chatbots using Bitpart.
          </Text>
          <Text marginTop={2} fontStyle="italic">
            <Text as="em" fontWeight={700}>
              Bot Users:
            </Text>{" "}
            The people who engage with a bot created by a Bitpart bot creator
            (for instance, they join a broadcast line, seek help from a
            helpdesk, report a tip to a tipline, seek to download eSIMs or VPNs
            distributed by a particular service). Bot Users may not be aware of
            Bitpart (though it should be clear to them that they are interacting
            with a bot).
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="tou-formats"
            marginTop={4}
            size="xl"
          >
            Formats
          </Heading>
          <List.Root marginLeft={4}>
            <List.Item>
              Bitpart is a tool to help support organizers, journalists, and
              human rights defenders. Bitpart should only be used for the 5
              formats it has been created for: broadcasting messages for
              organizing purposes; tiplines; helpdesks; distributing eSIMs;
              distributing VPNs.
            </List.Item>
            <List.Item>
              We created these formats to prevent misuse of Bitpart. You do not
              have permission to use Bitpart for another use, and if you do so
              we can remove your account. Please email us{" "}
              <Link
                color={color}
                href="mailto:contact@bitp.art"
                variant="underline"
              >
                contact@bitp.art
              </Link>{" "}
              if there is another format you would like to see.
            </List.Item>
          </List.Root>
          <Heading
            as="h3"
            className={geistMono.className}
            id="tou-acceptable-behavior"
            marginTop={4}
            size="xl"
          >
            Acceptable Behavior
          </Heading>
          <List.Root marginLeft={4}>
            <List.Item>
              We expect you to use Bitpart in ways that create a positive
              environment for the people using the chatbots you create on
              Bitpart. Please use Bitpart in a way that is kind and empathetic.
            </List.Item>
            <List.Item>
              By using Bitpart you promise not to send spam, infringing,
              obscene, threatening, libelous, or otherwise illegal material
              through Bitpart's services. For instance this includes: sexualized
              language or images and sexual attention or advances of any kind;
              trolling, insulting or derogatory comments; harassment; publishing
              others' private information, such as a physical or email address,
              without their explicit permission.
            </List.Item>
            <List.Item>
              If you violate acceptable behaviour we can remove your account.
            </List.Item>
            <List.Item>
              Please email us{" "}
              <Link
                color={color}
                href="mailto:contact@bitp.art"
                variant="underline"
              >
                contact@bitp.art
              </Link>{" "}
              to report any misuse of Bitpart.
            </List.Item>
          </List.Root>
          <Heading
            as="h3"
            className={geistMono.className}
            id="tou-account"
            marginTop={4}
            size="xl"
          >
            Account
          </Heading>
          <List.Root marginLeft={4}>
            <List.Item>
              You need to create an account in order to use Bitpart. We ask you
              for username and password, with the option to add an email. You
              can delete chatbots you have created in the dashboard of your
              account, and delete your account at any time by emailing us (
              <Link
                color={color}
                href="mailto:contact@bitp.art"
                variant="underline"
              >
                contact@bitp.art
              </Link>
              ).
            </List.Item>
          </List.Root>
          <Heading
            as="h3"
            className={geistMono.className}
            id="tou-data-processing"
            marginTop={4}
            size="xl"
          >
            Data Processing
          </Heading>
          <List.Root marginLeft={4}>
            <List.Item>
              Minimal data is collected on people engaging with chatbots created
              using Bitpart.
            </List.Item>
            <List.Item>
              The Signal profile information that is processed by Bitpart and
              bot creators is what the person chooses to make visible in their
              Signal account. Bitpart does not store Signal profile information
              and instead works by assigning random identification numbers to
              each Bot User.
            </List.Item>
            <List.Item>
              Bitpart is designed to never store any message content. Bitpart
              works over Signal, which is end-to-end encrypted.{" "}
              <Text as="span" fontWeight={700}>
                In order for Bitpart to work, the Bitpart server acts as an
                “end” in Signal’s end-to-end encryption.
              </Text>{" "}
              The server receives a message via Signal, and relays it from
              someone using your Bitpart chatbot to the creator of the Bitpart
              chatbot, or vice versa. In the moment that it is received by the
              server and relayed on, the encrypted message content is
              momentarily stored to allow for the transmission of information.
              It is subsequently deleted and not stored further.
            </List.Item>
            <List.Item>
              We have designed Bitpart so that we do not access and read message
              content. Access to the server is tightly controlled (only four
              team members have access).
            </List.Item>
            <List.Item>
              Within each conversation with a Bitpart bot, a Bot User is able to
              opt whether to agree to Bitpart’s data policy or delete their data
              by sending “Delete” to the bot. Selecting to delete their data
              will end the conversation and the bot will delete the Bot User’s
              data from Bitpart’s server.
            </List.Item>
            <List.Item>
              While Bitpart can delete records that a conversation took place
              between a Bot User and a Bitpart chatbot, it is not able to
              control what data a Bot Creator’s device collects and processes
              (such as all conversations and message content), where and how a
              Bot Creator stores data, or to delete data from a Bot Creator’s
              device.
            </List.Item>
            <List.Item>
              We recommend that Bot Creators provide Bot Users with information
              on any additional processing of their personal data, carried out
              outside of and independently from the Bitpart tool.
            </List.Item>
            <List.Item>
              We recommend that Bot Creators and Bot Users take measures to
              minimise risks and protect their privacy within Signal, such as{" "}
              <Link
                color={color}
                href="https://support.signal.org/hc/en-us/articles/360007320771-Set-and-manage-disappearing-messages"
                variant="underline"
              >
                setting disappearing message timers
              </Link>{" "}
              on conversations; and considering using a pseudonym as your Signal
              name (see how to{" "}
              <Link
                color={color}
                href="https://support.signal.org/hc/en-us/articles/360007059952-Edit-my-Profile"
                variant="underline"
              >
                edit your Profile settings
              </Link>{" "}
              ).
            </List.Item>
          </List.Root>
          <Heading
            as="h3"
            className={geistMono.className}
            id="tou-data-security"
            marginTop={4}
            size="xl"
          >
            Data Security
          </Heading>
          <List.Root marginLeft={4}>
            <List.Item>
              We use robust and state of the art security measures to ensure
              that data on the Bitpart website and server cannot be hacked, but
              there is always a chance. Please bear this in mind when using
              Bitpart.
            </List.Item>
            <List.Item>
              If there was a data breach, we would inform you within 48 hours of
              discovery.
            </List.Item>
            <List.Item>
              Bitpart has been security audited. Please email us{" "}
              <Link
                color={color}
                href="mailto:contact@bitp.art"
                variant="underline"
              >
                contact@bitp.art
              </Link>{" "}
              if you would like more information.
            </List.Item>
          </List.Root>
          <Heading
            as="h3"
            className={geistMono.className}
            id="tou-service-availability"
            marginTop={4}
            size="xl"
          >
            Service Availability
          </Heading>
          <List.Root marginLeft={4}>
            <List.Item>
              We will do our best to keep Bitpart working smoothly. In some
              instances there may be delays or outages for reasons beyond our
              control (like emergencies, network problems, third party services,
              etc.) If the issue lies with Bitpart, we will inform you and get
              things working again as soon as possible.
            </List.Item>
            <List.Item>
              Bitpart is offered free of charge. We do not seek to profit from
              Bitpart, and want it to be as accessible as possible to activists,
              journalists and human rights defenders. So far, Bitpart has been
              funded through grants. In order to cover maintenance costs we may
              need to charge for Bitpart in future, and if so, we would aim to
              still have a free option and be accessible to activists,
              journalists and human rights defenders in repressive contexts.
            </List.Item>
            <List.Item>
              If for any reason we were to "sunset" Bitpart, we would let you
              know with as much advance notice as possible, and seek to share
              alternative options.
            </List.Item>
          </List.Root>
          <Heading
            as="h3"
            className={geistMono.className}
            id="tou-respecting-terms-messaging-platforms"
            marginTop={4}
            size="xl"
          >
            Respecting the Terms of Messaging Platforms
          </Heading>
          <List.Root marginLeft={4}>
            <List.Item>
              Bitpart is a tool which relays messages that are sent using
              Signal. Please bear in mind that when you are using Bitpart, you
              are also using Signal. Please adhere to{" "}
              <Link
                color={color}
                href="https://signal.org/legal/#terms-of-service"
                variant="underline"
              >
                Signal’s Terms of Service
              </Link>
              . This includes being at least 13 years old (may be older in some
              countries); registering for a Signal account using a phone number;
              and being responsible for data and mobile carrier fees and taxes
              associated with the devices on which you use Signal.
            </List.Item>
          </List.Root>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="privacy-policy"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Privacy Policy
          </Heading>
          <Heading
            as="h3"
            className={geistMono.className}
            marginTop={4}
            size="xl"
          >
            Definitions
          </Heading>
          <Text marginTop={2} fontStyle="italic">
            <Text as="em" fontWeight={700}>
              Bot Creators:
            </Text>{" "}
            An individual, group or organization who set up a Bitpart account
            and create chatbots using Bitpart.
          </Text>
          <Text marginTop={2} fontStyle="italic">
            <Text as="em" fontWeight={700}>
              Administrators:
            </Text>{" "}
            Additional users who are able to send messages
          </Text>
          <Text marginTop={2} fontStyle="italic">
            <Text as="em" fontWeight={700}>
              Bot Users:
            </Text>{" "}
            The people who engage with a bot created by a Bitpart Bot Creator
            (for instance, they join a broadcast line, seek help from a
            helpdesk, report a tip to a tipline, seek to download eSIMs or VPNs
            distributed by a particular service). They should be told in their
            initial interaction with the bot that they are engaging with an
            automated system, but they are likely not aware of Bitpart.
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-who-are-we"
            marginTop={4}
            size="xl"
          >
            Who are we?
          </Heading>
          <Text>
            Throneless Tech is a technology worker-cooperative based in
            Washington, DC. We provide the Bitpart messaging tool. We can be
            reached at{" "}
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
            .
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-why-collect-data"
            marginTop={4}
            size="xl"
          >
            Why Do We Collect Your Data?
          </Heading>
          <Text>
            We practice privacy by design and collect as little data as
            possible. The information we do collect is used to provide Bitpart’s
            services and functionality, such as account data so that you save
            and come back to the chatbot you create; message data so that
            messages are relayed by Bitpart; and any data you share when
            contacting us for support.
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-personal-data"
            marginTop={4}
            size="xl"
          >
            Personal Data That Bitpart Collects and Processes
          </Heading>
          <Box borderColor={color} borderWidth={1} margin={4} padding={4}>
            <Text fontWeight={700}>
              Important notice on end-to-end encryption and message data
            </Text>
            <Text>
              Bitpart allows people to create bots over Signal. One of the
              benefits of Signal is end-to-end encryption, so that message
              content is secured and only visible to the sender and receiver.
              Bitpart works by relaying messages. It acts as an “end” point.
              When a message is sent by a person on Signal using a Bitpart
              chatbot, it is received by Bitpart, before relaying the message
              on. Message contents are therefore ‘opened’ by the Bitpart server.
              This is momentary, as once the message is relayed on, the message
              content is not stored.
            </Text>
          </Box>
          <Text marginTop={4}>
            When you use Bitpart, we collect the following information:
          </Text>
          <Text marginTop={4}>Bot Creators:</Text>
          <List.Root marginLeft={4}>
            <List.Item>
              Account information, including username, and an (optional) email
              address.
            </List.Item>
            <List.Item>
              An optional phone number associated with a bot (i.e. the number a
              Bot User will message).
            </List.Item>
            <List.Item>
              Messages from end-to-end encrypted conversations in Signal
              (collected and processed, then deleted and not stored further).
            </List.Item>
            <List.Item>
              Personal data shared when contacting Bitpart for technical support
              through email.
            </List.Item>
            <List.Item>
              Metadata associated with conversations, such as when conversations
              are initiated and closed.
            </List.Item>
          </List.Root>
          <Text marginTop={4}>Bot Users:</Text>
          <List.Root marginLeft={4}>
            <List.Item>
              Messages (collected and processed, but not stored).
            </List.Item>
            <List.Item>
              Metadata associated with conversations, such as when conversations
              are initiated and closed.
            </List.Item>
          </List.Root>
          <Text marginTop={4}>
            The following table explains in more detail the types of data we
            collect and the legal basis, under current data protection
            legislation, on which this data is processed.
          </Text>
          {/* <Table.ScrollArea borderWidth="1px" maxW="3xl"> */}
          <Table.Root interactive marginTop={4} size="md" variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader minW="200px">Purpose</Table.ColumnHeader>
                <Table.ColumnHeader minW="200px">
                  Data (key elements)
                </Table.ColumnHeader>
                <Table.ColumnHeader minW="200px">Basis</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Signing up as an Bot Creator</Table.Cell>
                <Table.Cell>
                  Username, password, email address (optional).
                </Table.Cell>
                <Table.Cell>
                  Contract - This is necessary for us to identify you correctly
                  so that you can return to the bots that you have created.
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  Connect Bitpart to the Signal account that will be associated
                  with a bot
                </Table.Cell>
                <Table.Cell>Signal account</Table.Cell>
                <Table.Cell>
                  Contract - This is necessary for us to connect the bot you are
                  creating to a Signal account, in order for your bot to
                  function.
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>To relay messages to and from Signal</Table.Cell>
                <Table.Cell>Message content</Table.Cell>
                <Table.Cell>
                  This is necessary for Bitpart to function (i.e. relay the
                  messages) but is not stored
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Website (dashboard) functionality</Table.Cell>
                <Table.Cell>
                  Website login/out collected through cookies
                </Table.Cell>
                <Table.Cell>
                  Contract - We store a small amount of information through
                  cookies. This is necessary for us to deliver login and logout
                  functionality, to ensure a Bot Creator is able to access the
                  correct data.
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Operation of the service</Table.Cell>
                <Table.Cell>
                  Metadata e.g. associated with conversations, such as when
                  conversations are initiated and closed
                </Table.Cell>
                <Table.Cell>
                  Contract - We store a small amount of metadata in our
                  database, such as timestamps, in order for Bitpart to function
                  correctly.
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Contacting us for technical support</Table.Cell>
                <Table.Cell>
                  Email, message, any personal data you choose to share like
                  name, etc.
                </Table.Cell>
                <Table.Cell>
                  Legitimate interests - It is necessary for us to read and
                  store your message so that we can respond in the way that you
                  would expect.
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
          {/* </Table.ScrollArea> */}
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-when-shared-data"
            marginTop={4}
            size="xl"
          >
            When We Share Your Data
          </Heading>
          <Text>
            We use a third party hosting service for the data repository for
            Bitpart, to process and store the data needed to run Bitpart (such
            as message data, randomly generated numbers used to identify unique
            Bot Users interacting with a bot, metadata from conversations, etc).
          </Text>
          <Text marginTop={4}>
            We use another third party hosting service for our email server, to
            process and store data that is needed to support users of Bitpart
            make enquiries or seek help over email.
          </Text>
          <Text marginTop={4}>
            Both servers are in European jurisdictions and we will only pass
            data to third parties outside of these jurisdictions where
            appropriate safeguards are in place as defined by applicable data
            protection laws.
          </Text>
          <Text marginTop={4}>
            We are using the abovementioned third parties purely for the
            purposes of providing the service. Such third parties process data
            on our behalf and only under our instructions, and we have in place
            data processing agreements that fulfil our legal obligations in
            relation to the use of third party data processors.
          </Text>
          <Text marginTop={4}>
            We may share personal data with additional third parties when we are
            legally required to do so.
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-data-retention"
            marginTop={4}
            size="xl"
          >
            How Long We Keep Your Data
          </Heading>
          <Text>
            We seek to only ever ask for the minimum amount of data needed for
            any associated purpose, and we delete that data promptly once it is
            no longer required.
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-delete-your-data"
            marginTop={4}
            size="xl"
          >
            Delete Your Data
          </Heading>
          <Text>
            We seek to protect your right to delete your personal information
            from our platform.
          </Text>
          <Text marginTop={4}>
            Bot Creators on Bitpart can delete the bots they create at any time
            by navigating to the dashboard and deleting their chatbots. In order
            to delete an account after it has been made, Bot Creators can
            contact us via{" "}
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>{" "}
            . We aim to delete your account and any associated data from our
            services and servers within two working days.
          </Text>
          <Text marginTop={4}>
            Each chatbot flow includes information about how a Bot User can
            delete their data from Bitpart (often by using a keyword like
            "Delete my data"). Once a Bot User has completed the data deletion
            flow in the chatbot, their data will be automatically deleted from
            our services and servers. You may also contact us via{" "}
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>{" "}
            at any time to delete your data.
          </Text>
          <Text marginTop={4}>
            <Text as="span" fontWeight={700}>
              Important note:
            </Text>{" "}
            As Bitpart relays messages between Bot Creators and Bot Users, data
            will be present in the Signal applications and any connected devices
            that they are using to engage with or run a Bitpart bot. Bitpart can
            delete from its servers that a conversation took place between a Bot
            User and a Bitpart chatbot. However, Bitpart is not able to control
            what data a Bot Creator’s device collects and processes, where and
            how a Bot Creator stores data, or to delete data from a Bot
            Creator’s device.
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-how-we-secure-your-data"
            marginTop={4}
            size="xl"
          >
            How We Secure Your Data
          </Heading>
          <Text>
            We use a combination of physical, technical, and administrative
            safeguards to protect the information we collect. We carefully
            choose our services and tools at Bitpart. It’s important that they
            follow good security practices, like HTTPS, two-factor
            authentication and the ability to set a strong password. We've
            reviewed the privacy policies and security practices of everything
            we use, such as the hosting services.
          </Text>
          <Text marginTop={4}>
            Bitpart is run by a worker cooperative and has not had any personnel
            changes. If a new team member joins, we explain best practices for
            keeping their devices secure and maintaining the security of their
            online accounts.
          </Text>
          <Text marginTop={4}>
            While we use these precautions to safeguard your information, we
            cannot guarantee the security of the networks, systems, servers,
            devices, and databases we operate or that are operated on our
            behalf.
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-signal"
            marginTop={4}
            size="xl"
          >
            Bitpart and Signal
          </Heading>
          <Text>
            As a tool designed to be used with Signal, Bitpart works to follow
            Signal’s privacy policies and standards while developing our own
            policies to better safeguard your data.
          </Text>
          <Text marginTop={4}>
            Please refer to Signal’s full{" "}
            <Link
              color={color}
              href="https://signal.org/legal/#privacy-policy"
              variant="underline"
            >
              Privacy Policy
            </Link>{" "}
            to understand how Signal handles the information you provide when
            using its applications and services.
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-your-data-rights"
            marginTop={4}
            size="xl"
          >
            Your Data Rights
          </Heading>
          <Text>
            Bitpart believes in upholding and protecting your data rights.
          </Text>
          <Text marginTop={4}>
            You have a range of rights over your data, which include the
            following:
          </Text>
          <List.Root marginLeft={4}>
            <List.Item>
              You have the right to ask for rectification and/or deletion of
              your information.
            </List.Item>
            <List.Item>
              You have the right of access to your information.
            </List.Item>
            <List.Item>
              You have the right to have the processing of your personal data
              restricted.
            </List.Item>
            <List.Item>
              You have the right to object to the processing of your personal
              data.
            </List.Item>
          </List.Root>
          <Text marginTop={4}>
            The UK Information Commissioner’s Office (ICO) website provides
            guidance on these rights:{" "}
            <Link
              color={color}
              href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights"
              variant="underline"
            >
              https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights
            </Link>{" "}
          </Text>
          <Text marginTop={4}>
            If you would like to access the rights listed above, or any other
            legal rights you have over your data under current legislation,
            please get in touch with us at{" "}
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
            .
          </Text>
          <Text>
            Based on your jurisdiction, you may also have the right to lodge a
            complaint with your local supervisory authority, if you feel your
            rights have been infringed. You can find a list of the current
            EU/EEA supervisory authorities here:{" "}
            <Link
              color={color}
              href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en"
              variant="underline"
            >
              https://www.edpb.europa.eu/about-edpb/about-edpb/members_en
            </Link>{" "}
            and the UK authority here:{" "}
            <Link color={color} href="https://ico.org.uk" variant="underline">
              https://ico.org.uk
            </Link>
            .
          </Text>
          <Heading
            as="h3"
            className={geistMono.className}
            id="privacy-policy-changes"
            marginTop={4}
            size="xl"
          >
            Changes to This Policy
          </Heading>
          <Text>
            We may modify this Privacy Policy from time to time and will publish
            the most current version on our platform. If a modification
            meaningfully reduces your rights, we'll notify people whose personal
            data we hold and is affected.
          </Text>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="acknowledgements"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Acknowledgements
          </Heading>
          <Text marginTop={4}>
            We used a variety of different resources and inspirations to draft
            the above Terms and Privacy Policy. We would like to acknowledge and
            thank{" "}
            <Link
              color={color}
              href="https://www.grit-gbv.org/copy-of-donate"
              variant="underline"
            >
              Gender Rights in Tech
            </Link>
            ,{" "}
            <Link
              color={color}
              href="https://termsweservewith.org/"
              variant="underline"
            >
              Terms-we-Serve-With
            </Link>
            ,{" "}
            <Link
              color={color}
              href="https://www.tunnelbear.com/terms-of-service"
              variant="underline"
            >
              Tunnel Bear
            </Link>
            ,{" "}
            <Link
              color={color}
              href="https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md"
              variant="underline"
            >
              Contributor Covenant
            </Link>
            ,{" "}
            <Link color={color} href="https://iapp.org/" variant="underline">
              IAPP
            </Link>
            ,{" "}
            <Link
              color={color}
              href="https://whitefuse.com/blog/privacy-policy-notice-template/#upgrade"
              variant="underline"
            >
              White Fuse
            </Link>
            , and{" "}
            <Link
              color={color}
              href="https://github.com/projectsbyif/how-if-uses-data/blob/main/how-if-uses-data.md"
              variant="underline"
            >
              Projects By If
            </Link>{" "}
            for their examples. We would also like to thank{" "}
            <Link
              color={color}
              href="https://superbloom.design/"
              variant="underline"
            >
              Superbloom
            </Link>{" "}
            for their support in drafting the Privacy Policy.
          </Text>
        </ClientOnly>
      </Container>
    </Box>
  );
}
