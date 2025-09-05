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
  Image,
  Link,
  List,
  Table,
  Text,
} from "@chakra-ui/react";

// components imports
import Footer from "@/app/_components/footer";
import Header from "../../_components/header";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { funnel, geistMono } from "@/app/fonts";

export default function FAQ() {
  // session
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("purple.600", "purple.400");
  const borderColor = useColorModeValue("black", "white");

  return (
    <Box paddingBottom={8}>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container marginBottom={20} marginTop={8} maxW="3xl">
        <Heading as="h1" className={funnel.className} size="4xl">
          Frequently Asked Questions
        </Heading>
        {/* DEFINITIONS */}
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="basics"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Definitions
          </Heading>
        </ClientOnly>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            Bot:
          </Text>{" "}
          A bot is the communications service you create when using the Bitpart
          messaging tool. The bot can incorporate automated messages, and is
          tailored to five different purposes currently available on the Bitpart
          platform: broadcast channel, tipline, helpdesk, eSIM distribution, and
          VPN distribution.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            Bot Creator:
          </Text>{" "}
          An individual who has an account on{" "}
          <ClientOnly>
            <Link color={color} href="https://bitp.art" variant="underline">
              bitp.art
            </Link>{" "}
          </ClientOnly>
          and can create, edit, and delete bots.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            Admin:
          </Text>{" "}
          An individual who has been given a bot passcode by a Bot Creator to
          manage the bot. An Admin is able to send out broadcast messages
          (broadcast bot) using their own Signal Account, or receive tips
          reported to a tipline or human support requests sent to a helpdesk,
          VPN or eSIM distribution, which are forwarded by the bot to the
          Admin’s Signal account.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            Bot Users:
          </Text>{" "}
          The people who engage with a bot created by a Bitpart Bot Creator or
          run by an Admin (for instance, they join a broadcast channel, seek
          help from a helpdesk, report a tip to a tipline, or seek to download
          the eSIMs or VPNs a Bot Creator is distributing). Your Bot Users may
          not be aware that you are using Bitpart as a tool to provide them
          these services, though they may be able to recognize that they are
          interacting with a bot.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            Broadcast channel:
          </Text>{" "}
          A Bitpart bot that enables a Bot Creator or an Admin to send broadcast
          messages to many Signal accounts at once. The Bot Creator and Admin
          can do so anonymously from their own Signal accounts, with only the
          bot's Signal account (which relays the broadcast messages) visible to
          recipients.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            Helpdesk:
          </Text>{" "}
          A Bitpart bot that interacts via Signal with a Bot User seeking
          support, through a series of automated responses that the Bot Creator
          curates. A Bot Creator or an Admin can also send personalized messages
          directly to the member when the support they need is beyond the scope
          of the automated responses available.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            Tipline:
          </Text>{" "}
          A Bitpart bot that allows anyone with a Signal account to report a
          tip. The tip is received in the form of a Signal message sent to the
          Signal account that was used to create the bot, with the option for
          tips to be forwarded to Bot Creators and Admins.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            eSIM Distribution:
          </Text>{" "}
          A Bitpart bot that distributes eSIMs to Bot Users. A Bot Creator or an
          Admin can also send personalized messages directly to the member when
          the support they need is beyond the scope of the automated responses
          available.
        </Text>
        <Text marginTop={2} fontStyle="italic">
          <Text as="em" fontWeight={700}>
            VPN Distribtuion:
          </Text>{" "}
          Bitpart bot that distributes VPN codes to Bot Users. A Bot Creator or
          an Admin can also send personalized messages directly to the member
          when the support they need is beyond the scope of the automated
          responses available.
        </Text>
        {/* TOC */}
        <Text
          className={geistMono.className}
          fontSize="xl"
          marginTop={10}
          textDecoration="underline"
          textTransform="
        uppercase"
        >
          <ClientOnly>
            <Link color={color} href="#basics">
              The basics
            </Link>
          </ClientOnly>
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#what-is-bitpart">
                What is Bitpart?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#do-i-need-signal">
                Do I need a Signal account to create and manage a Bitpart bot?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#other-platforms">
                Can I make a Bitpart bot for other messaging platforms besides
                Signal?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-does-bitpart-work">
                How does Bitpart work?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#multiple-admins">
                Can a Bitpart bot be managed by multiple members of my team?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-does-bitpart-connect-to-signal">
                How does Bitpart connect to Signal?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#what-can-i-use-bitpart-for">
                What can I use a Bitpart bot for?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#is-separate-software-needed">
                Do I need to download software or an app to use Bitpart?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#what-languages-available">
                What languages are available for Bitpart?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#what-is-cost">
                What does it cost to use Bitpart?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text
          className={geistMono.className}
          fontSize="xl"
          marginTop={4}
          textDecoration="underline"
          textTransform="
        uppercase"
        >
          <ClientOnly>
            <Link color={color} href="#security">
              Security
            </Link>
          </ClientOnly>
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#is-bitpart-safe">
                Is Bitpart safe to use?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#is-bitpart-encrypted">
                Is Bitpart encrypted?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#can-bitpart-be-used-maliciously">
                Can Bitpart be used by malicious actors?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#is-bitpart-open-source">
                Is Bitpart open source?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#can-bitpart-see-my-messages">
                Can Bitpart see my messages?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#where-does-bitpart-store-data">
                Where does Bitpart store my data?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-do-i-know-i-can-trust-bitpart">
                How do I know I can trust Bitpart?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text
          className={geistMono.className}
          fontSize="xl"
          marginTop={4}
          textDecoration="underline"
          textTransform="
        uppercase"
        >
          <ClientOnly>
            <Link color={color} href="#using-bitpart">
              Using Bitpart
            </Link>
          </ClientOnly>
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#why-shouldnt-i-use-my-personal-number">
                Why shouldn’t I use my personal number/personal Signal account
                for the bot?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-do-i-set-up-new-signal-account">
                How do I set up a new Signal account?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#multiple-admins-2">
                Can a Bitpart bot be managed by multiple Admins?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#forwarding-and-passcodes">
                How can I set up forwarding? How do I use the passcode?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-can-i-delete-conversations">
                How can I delete conversations?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-can-i-edit-text">
                How can I edit the text in my bot?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-can-i-change-bot-name">
                How can I change the bot name?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#my-bot-is-getting-spammed">
                My bot is getting spammed. What can I do?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#can-i-use-my-device">
                Can I use my own device to run a Bitpart bot?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text
          className={geistMono.className}
          fontSize="xl"
          marginTop={4}
          textDecoration="underline"
          textTransform="
        uppercase"
        >
          <ClientOnly>
            <Link color={color} href="#broacast-channel">
              Running a broadcast channel
            </Link>
          </ClientOnly>
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#broadcast-channel-contacts">
                Do I need to upload a list of contacts to create my broadcast
                channel?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#broadcast-channel-who-is-using-it">
                How can I see who is using my bot? How can I see who subscribed
                to my broadcast channel?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#broadcast-channel-remove">
                How can I remove someone who has signed up to receive messages
                from my broadcast channel?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text
          className={geistMono.className}
          fontSize="xl"
          marginTop={4}
          textDecoration="underline"
          textTransform="
        uppercase"
        >
          <ClientOnly>
            <Link color={color} href="#troubleshooting">
              Troubleshooting
            </Link>
          </ClientOnly>
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#why-do-i-get-an-error-message">
                Why do I get an error message when I try to connect my bot to
                the Signal account?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#can-i-reset-password">
                Can I reset my password?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-can-i-contact-you">
                I have another issue or question, how can I contact you?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text
          className={geistMono.className}
          fontSize="xl"
          marginTop={4}
          textDecoration="underline"
          textTransform="
        uppercase"
        >
          <ClientOnly>
            <Link color={color} href="#deleting-closing">
              Deleting / Closing a bot
            </Link>
          </ClientOnly>
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#can-i-turn-bot-off-on">
                Can I turn my bot off & on?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-can-i-delete-bot">
                How can I delete my bot?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#can-i-reuse-bot">
                Can I build a new bot on a Signal account I had previously used
                for a bot?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text
          className={geistMono.className}
          fontSize="xl"
          marginTop={4}
          textDecoration="underline"
          textTransform="
        uppercase"
        >
          <ClientOnly>
            <Link color={color} href="#collaboration">
              Collaboration
            </Link>
          </ClientOnly>
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#can-we-collaborate">
                Can we collaborate on building Bitpart?
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#how-can-i-contact-you-code">
                I’ve reviewed Bitpart’s code and have an idea / a report / a
                question. How can I contact you?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="basics"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            The basics
          </Heading>
        </ClientOnly>
        <Heading
          as="h3"
          className={geistMono.className}
          id="what-is-bitpart"
          marginTop={8}
          size="xl"
        >
          What is Bitpart?
        </Heading>
        <Text marginTop={4}>
          Bitpart is a one-to-many messaging tool that plugs into Signal. It was
          designed with rights defenders, activists and journalists operating in
          risky or repressive environments, and is intended for anyone needing
          to communicate with a large network safely over Signal.
        </Text>
        <Text marginTop={4}>
          Bitpart can be used by individuals and organizations to set up a
          broadcast channel, a helpdesk or a tipline, or to distribute VPNs or
          eSIMs to members of their network.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="do-i-need-signal"
          marginTop={8}
          size="xl"
        >
          Do I need a Signal account to create and manage a Bitpart bot?
        </Heading>
        <Text marginTop={4}>
          Yes. You will be asked to link a Signal account when creating a
          Bitpart bot. The Signal account with which you create your bot will be
          the same number you use to interact with your Bot Users on your Signal
          app.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="other-platforms"
          marginTop={8}
          size="xl"
        >
          Can I make a Bitpart bot for other messaging platforms besides Signal?
        </Heading>
        <Text marginTop={4}>
          No. For now, Bitpart operates only through Signal.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-does-bitpart-work"
          marginTop={8}
          size="xl"
        >
          How does Bitpart work?
        </Heading>
        <Text marginTop={4}>
          Bitpart is a tool for building and running bots on Signal messenger.
          Bitpart has five purposes. It offers the ability to:
        </Text>
        <List.Root as="ol" marginLeft={4} marginTop={4}>
          <List.Item>
            Send messages to many Signal accounts at once, in the form of a
            broadcast channel
          </List.Item>
          <List.Item>
            Set up automated responses to individual Signal accounts, in the
            form of a helpdesk
          </List.Item>
          <List.Item>
            Receive tips and reports from Signal accounts in the form of a
            tipline
          </List.Item>
          <List.Item>Distribute eSIMs to Signal accounts</List.Item>
          <List.Item>Distribute VPN codes to Signal accounts</List.Item>
        </List.Root>
        <Text marginTop={4}>
          Each bot is set up by creating an account on{" "}
          <ClientOnly>
            <Link color={color} href="https://bitp.art" variant="underline">
              bitp.art
            </Link>
          </ClientOnly>
          . Once the bot is set up, all interactions take place over Signal.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="multiple-admins"
          marginTop={8}
          size="xl"
        >
          Can a Bitpart bot be managed by multiple members of my team?
        </Heading>
        <Text marginTop={4}>
          Accounts on the Bitpart platform are intended for individuals. There
          is currently no way to connect accounts and share bots across a team
          (though this is something we are considering for the future).
        </Text>
        <Text marginTop={4}>
          Bitpart offers the ability for Admins to help manage bots, using
          passcodes. Admins do not need access to your Bot Creator account on
          this platform. Bitpart generates a unique passcode for each bot at the
          end of the “Create your bot" process. Bot Creators can share this
          passcode with members of their team. Messaging the bot one time with
          the passcode means that the sender is recognized by Bitpart as an
          Admin. An Admin will be able to send messages to the channel
          (broadcast bot) or receive select messages that Bitpart forwards, such
          as tips (tipline bot) or requests for human support (helpdesk, VPN,
          eSIM).{" "}
          <ClientOnly>
            <Link color={color} href="#multiple-admins-2" variant="underline">
              Please see more about multiple Admins here.
            </Link>
          </ClientOnly>{" "}
          Soon you will be able to change passcodes for greater security.
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={6}
          size="lg"
        >
          Broadcast channel:
        </Heading>
        <Text>
          For a message to be broadcast out, Bot Creators (and anyone they wish
          to designate as an Admin) must send a "passcode" to their bot's Signal
          account just once. The bot will then recognize those 'Admin' Signal
          accounts as broadcasters, and forward their message to everyone who
          has signed up to the broadcast channel. This means that messages are
          sent without revealing the Signal account of the Admins or Bot Creator
          sending the broadcasts. It also means that the device and Signal
          account used to run the Bitpart bot can be left in a safe place
          (during a protest, for instance), while Admins use their own devices
          to broadcast messages.
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={6}
          size="lg"
        >
          Tipline:
        </Heading>
        <Text>
          A Bot Creator can set up forwarding so that the tips received by a
          tipline bot are forwarded to Admins' Signal accounts. A Bot Creator
          shares a passcode to the team member they want to make an Admin, who
          in turn sends the passcode over Signal to the tipline bot Signal
          account. The tipline bot then recognizes that team member as an Admin.
          All Admins receive incoming tips directly to their own Signal account.
          If a tip sender opts in to be contacted, their contact information
          will be forwarded too.
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={6}
          size="lg"
        >
          Helpdesk, VPN, eSIM:
        </Heading>
        <Text>
          For these bots, a Bot Creator can set up message forwarding to receive
          alerts when someone using the bot needs additional support. Sending a
          passcode via Signal to the bot allows for Bitpartit to recognize those
          Signal aAccounts as Admins. Bitpart will then immediately forward any
          requests for human support to Admins. This 'flags' support requests
          which might otherwise get lost in the conversations, especially if
          there are many people engaging with your bot or if the bot's Signal
          account is not closely monitored.
        </Text>
        <Text marginTop={4}>
          <ClientOnly>
            <Link
              color={color}
              href="#forwarding-and-passcodes"
              variant="underline"
            >
              See below for more information on passcodes.
            </Link>
          </ClientOnly>
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-does-bitpart-connect-to-signal"
          marginTop={8}
          size="xl"
        >
          How does Bitpart connect to Signal?
        </Heading>
        <Text marginTop={4}>
          When setting up a bot using your Bitpart dashboard, you will be
          requested to add a Signal account as a linked device. You'll therefore
          be able to see all bot conversations on the device you used to set up
          your bot, and any other linked devices.
        </Text>
        <Text marginTop={4}>
          Once Bitpart is connected, the bot replies to all messages received by
          the Signal account you’ve added. This is why we don't recommend using
          your personal Signal account.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="what-can-i-use-bitpart-for"
          marginTop={8}
          size="xl"
        >
          What can I use a Bitpart bot for?
        </Heading>
        <Text marginTop={4}>
          Bitpart currently offers 5 different bots: broadcast channel,
          helpdesk, tipline, VPN distribution, and eSIM distribution. These are
          tailored to specific uses, and offer the following features:
        </Text>
        <Table.Root
          interactive
          marginTop={4}
          size="md"
          showColumnBorder
          variant="outline"
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Type of bot</Table.ColumnHeader>
              <Table.ColumnHeader>How it works</Table.ColumnHeader>
              <Table.ColumnHeader>Direction of messages</Table.ColumnHeader>
              <Table.ColumnHeader>Human in the loop?</Table.ColumnHeader>
              <Table.ColumnHeader>
                Information a Bot Creator needs to provide to make a bot
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Broadcast channel</Table.Cell>
              <Table.Cell>
                <Text>
                  People opt in to receive messages. Broadcast messages are sent
                  from the Bot Creator or Admin's phone.
                </Text>
                <Text marginTop={4}>
                  Recipients cannot see the identities of other recipients nor
                  of those sending out broadcast messages.
                </Text>
              </Table.Cell>
              <Table.Cell>1- way communication only</Table.Cell>
              <Table.Cell>
                No. However the Bot Creator should specify a contact (i.e. a
                Signal username or email) should people need support.
              </Table.Cell>
              <Table.Cell>
                <Text>
                  Public name for the bot; info about the channel; a contact if
                  people need extra support.
                </Text>
                <Text marginTop={4}>OPTIONAL: Safety tips, FAQs</Text>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Tipline</Table.Cell>
              <Table.Cell>
                Offers a way for people in your network to share information
                with the Bot Creator / Admin. They can also specify if they want
                to be contacted for follow up or not.
              </Table.Cell>
              <Table.Cell>
                2-way communication, but its role is mostly to receive
                information from your Bot Users Users
              </Table.Cell>
              <Table.Cell>
                Yes. Tips can be forwarded to members of your team (Admins). An
                Admin or Bot Creator can also follow up with the person who sent
                the tip, if they opted in to be contacted.{" "}
              </Table.Cell>
              <Table.Cell>Name; Data rights policy</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Helpdesk</Table.Cell>
              <Table.Cell>
                Offers approximately up to 4 or 5 issues and automated replies.
              </Table.Cell>
              <Table.Cell>
                2-way communication, automated responses to frequently asked
                questions
              </Table.Cell>
              <Table.Cell>
                Yes, a person using your helpdesk can opt to speak directly with
                an Admin, should they have a question that is beyond the scope
                of the helpdesk’s automated responses. The Bot Creator can set
                up Admins to whom messages are forwarded for these requests.
              </Table.Cell>
              <Table.Cell>
                Helpdesk name; Referral/ emergency contact; About; Response
                time; Data retention policy; Data rights policy; Frequently
                asked questions and responses
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>VPN distribution</Table.Cell>
              <Table.Cell>
                People are sent VPN codes (up to a maximum number set by the Bot
                Creator).
              </Table.Cell>
              <Table.Cell>
                Mostly 1-way communication (delivery of codes), although your
                Bot Users receiving the codes are able to interact
              </Table.Cell>
              <Table.Cell>
                Yes, if a Bot User needs additional help, they can opt to speak
                to a human (the Bot Creator or an Admin). The Bot Creator can
                set up Admins to whom messages are forwarded for these requests.
              </Table.Cell>
              <Table.Cell>
                Public name, About, Maximum number of downloads; Response time;
                CSV file with VPN codes
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>eSIM distribution</Table.Cell>
              <Table.Cell>
                Bot Users are sent an eSIM code after verifying that their
                device is eSIM compatible and that they are in an area covered
                by the eSIM.
              </Table.Cell>
              <Table.Cell>
                Mostly 1-way communication (delivery of codes), although Bot
                Users receiving the eSIMs are able to interact
              </Table.Cell>
              <Table.Cell>
                Yes, if a Bot User needs additional\ help, they can opt to speak
                to a human (the Bot Creator or an Admin). The Bot Creator can
                set up Admins to whom messages are forwarded for these requests.
              </Table.Cell>
              <Table.Cell>
                <Text>
                  Public name; About; Data rights; Activation instructions; CSV
                  file with eSIM codes.
                </Text>
                <Text marginTop={4}>Optional: FAQs</Text>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        <Text marginTop={4}>
          For all bot types, Bot Users have to message the bot first. A bot
          cannot initiate a conversation.
        </Text>
        <Text marginTop={4}>
          If you are not sure which bot type to use, we recommend thinking about
          if you mostly want to be sharing information out (broadcast channel),
          receiving information (tipline), or answering questions (helpdesk).
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="is-separate-software-needed"
          marginTop={8}
          size="xl"
        >
          Do I need to download software or an app to use Bitpart?
        </Heading>
        <Text marginTop={4}>
          No. A Bitpart bot operates via the messenging platform, Signal, and
          does not require users to download any additional software.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="what-languages-available"
          marginTop={8}
          size="xl"
        >
          What languages does Bitpart come in?
        </Heading>
        <Text marginTop={4}>
          Currently Bitpart is only in English. Adding more languages is a
          priority.
        </Text>
        <Text marginTop={4}>
          If there's a language in which you would like to build your bot,
          please email us, as we will prioritize languages based on need. (
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>
          )
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="what-is-cost"
          marginTop={8}
          size="xl"
        >
          What does it cost to use Bitpart?
        </Heading>
        <Text marginTop={4}>
          Bitpart is free to use.{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://www.paypal.com/donate/?hosted_button_id=757LCPWH64A6N"
              variant="underline"
            >
              We appreciate your support
            </Link>{" "}
            to help us run Bitpart.
          </ClientOnly>
        </Text>
        <Text marginTop={4}>
          Please note that you need a separate Signal account to run Bitpart,
          and this will likely have costs (such as the cost of a phone number
          and device).
        </Text>
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="security"
            marginBottom={2}
            marginTop={12}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Security
          </Heading>
        </ClientOnly>
        <Heading
          as="h3"
          className={geistMono.className}
          id="is-bitpart-safe"
          marginTop={8}
          size="xl"
        >
          Is Bitpart safe to use?
        </Heading>
        <Text marginTop={4}>
          Bitpart is hosted on a secure platform to which only Bitpart’s
          three-person development team has administrative access. The platform
          is continuously updated with the latest security measures. Any
          security-related components of the configuration (including API keys
          and encryption keys) are stored in encrypted fashion. As Bitpart’s
          development team, we employ a security observability and enforcement
          framework on the platform that continually monitors it for security
          threats or unusual behavior. Bitpart was also independently audited by
          a third-party security consultant for any potential vulnerabilities
          before release.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="is-bitpart-encrypted"
          marginTop={8}
          size="xl"
        >
          Is Bitpart encrypted?
        </Heading>
        <Text marginTop={4}>
          <Text as="span" fontWeight={700}>
            The Bitpart server acts as an “end” in Signal’s end-to-end
            encryption.
          </Text>{" "}
          Messages are encrypted between your bot and anyone who messages it (as
          all Signal messages are). In order for Bitpart to work, the bot
          connects to your Signal account as a linked device.
        </Text>
        <Text marginTop={4}>
          In the moment that the encrypted message is received by the server,
          the content is briefly stored to allow for the transmission of
          information. The messages are deleted almost instantly and are not
          ever saved in the database. We (Throneless Tech, the team that runs
          Bitpart) cannot access or read any of your messages, but you should be
          aware that they do briefly pass through Bitpart's servers in order for
          automation or broadcasting functionality.
        </Text>
        <Text marginTop={4}>
          Data that is stored on the server is encrypted at rest in the database
          using AES256 encryption from the SQLCipher Project.
        </Text>
        <Text marginTop={4}>
          We’re taking all precautions, but there are some inherent risks.
          Depending on your privacy needs, context, and technological capacity,
          you may want to consider setting up your own instance of Bitpart using{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://github.com/throneless-tech/bitpart"
              target="_blank"
              variant="underline"
            >
              open source code available on Github
            </Link>
          </ClientOnly>
          , which would allow you to host data on your own servers.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="can-bitpart-be-used-maliciously"
          marginTop={8}
          size="xl"
        >
          Can Bitpart be used by malicious actors?
        </Heading>
        <Text marginTop={4}>
          Just like any publicly available privacy-orientated messaging tool,
          there is the risk that Bitpart be used by those with malicious intent.
          However, we have taken a number of measures to prevent this, such as:
        </Text>
        <List.Root marginLeft={4} marginTop={2}>
          <List.Item>
            intentionally researching the needs of our community and designing
            bots with formats that directly respond to the needs of our
            community.
          </List.Item>
          <List.Item>
            setting limitations in each bot type's design of what can be changed
            within them.
          </List.Item>
          <List.Item>
            only offering access to Bitpart via invite codes (during th launch
            period).
          </List.Item>
          <List.Item>
            designing the bots in such a way that they cannot initiate
            conversations.
          </List.Item>
          <List.Item>
            ensuring recipients of bot messages consent to interact with a bot,
            and can withdraw that consent at any time by deleting the
            conversation (i.e. sending "Delete"), or by blocking the Signal
            account that the bot uses.
          </List.Item>
          <List.Item>
            monitoring for unusual activity on the Bitpart dashboard.
          </List.Item>
          <List.Item>
            undergoing a Threat Modeling & Risk Assessment from a trusted
            third-party organization.
          </List.Item>
          <List.Item>
            undergoing a Security Audit from a trusted third-party organization.
          </List.Item>
        </List.Root>
        <Text marginTop={4}>
          We have tried our best to balance potential abuse without compromising
          user privacy.
        </Text>
        <Text marginTop={4}>
          Bitpart’s repository is open source, and like all open source
          projects, we cannot guarantee that it won’t be used by bad actors.
        </Text>
        <Text marginTop={4}>
          If you have any concerns of suspicious activity, please notify us:{" "}
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="where-does-bitpart-store-data"
          marginTop={8}
          size="xl"
        >
          Is Bitpart open source?
        </Heading>
        <Text marginTop={4}>
          The code for Bitpart is open source and{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://github.com/throneless-tech/bitpart"
              target="_blank"
              variant="underline"
            >
              can be found on Github
            </Link>
          </ClientOnly>
          . Bot Creators can host data on their own servers.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="can-bitpart-see-my-messages"
          marginTop={8}
          size="xl"
        >
          Can Bitpart see my messages?
        </Heading>
        <Text marginTop={4}>
          In order for Bitpart to work, the bot connects to your Signal account
          as a linked device. The Bitpart server acts as an “end” in Signal’s
          end-to-end encryption. In the moment that the encrypted message is
          received by the server, the content of the message is briefly stored
          to allow for the transmission of information. Once the information has
          been transmitted, the messages are deleted almost instantly, and are
          not ever saved in the database. Bitpart’s developers cannot access or
          read any of your messages, but you should be aware that they briefly
          pass through Bitpart's servers in order for automation or broadcasting
          functionality.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="where-does-bitpart-store-data"
          marginTop={8}
          size="xl"
        >
          Where does Bitpart store my data?
        </Heading>
        <Text marginTop={4}>
          Data for Bitpart is hosted on a secure server in a European country
          and is therefore in a jurisdiction under the General Data Protection
          Regulation (GDPR). For more information on what data is stored and
          where, please see our{" "}
          <ClientOnly>
            <Link color={color} href="/tou-and-privacy" variant="underline">
              Privacy Policy
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-do-i-know-i-can-trust-bitpart"
          marginTop={8}
          size="xl"
        >
          How do I know I can trust Bitpart?
        </Heading>
        <Text marginTop={4}>
          We understand that using Bitpart requires trust - especially this
          hosted platform.
        </Text>
        <Text marginTop={4}>
          One of the reasons why Bitpart is built on Signal is because it is a
          messaging platform that focuses on privacy. Many activists, human
          rights defenders and journalists already use Signal for this reason.
        </Text>
        <Text marginTop={4}>
          The team behind Bitpart,{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://throneless.tech"
              variant="underline"
            >
              Throneless Tech
            </Link>
          </ClientOnly>
          , is a technology worker-cooperative specialized in building
          technology and providing digital security trainings for social justice
          oriented community organizations, activist groups, and non-profits.
        </Text>
        <Text marginTop={4}>
          In building Bitpart, we have taken safety measures{" "}
          <ClientOnly>
            <Link color={color} href="#is-bitpart-safe" variant="underline">
              we have taken safety measures
            </Link>
          </ClientOnly>{" "}
          and{" "}
          <ClientOnly>
            <Link
              color={color}
              href="#can-bitpart-be-used-maliciously"
              variant="underline"
            >
              measures to prevent malicious use
            </Link>
          </ClientOnly>
          .
        </Text>
        <Text marginTop={4}>
          The code for Bitpart is also{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://github.com/throneless-tech/bitpart"
              target="_blank"
              variant="underline"
            >
              available on Github
            </Link>
          </ClientOnly>
          , for those who wish to examine it.
        </Text>
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="using-bitpart"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Using Bitpart
          </Heading>
        </ClientOnly>
        <Heading
          as="h3"
          className={geistMono.className}
          id="why-shouldnt-i-use-my-personal-number"
          marginTop={8}
          size="xl"
        >
          Why shouldn’t I use my personal number/personal Signal account for the
          bot?
        </Heading>
        <Text marginTop={4}>
          Once a bot is connected to a Signal account, any messages received by
          that account will trigger the bot. Therefore, if you use your personal
          number or account, anyone messaging you will receive messages from the
          bot.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-do-i-set-up-new-signal-account"
          marginTop={8}
          size="xl"
        >
          How do I set up a new Signal account?
        </Heading>
        <Text marginTop={4}>
          There are two ways to set up a new Signal account to use for your bot:
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={8}
          size="lg"
        >
          Option 1: SIM card and mobile phone.
        </Heading>
        <Text>
          We recommend getting a new phone number by purchasing a physical SIM
          card or eSIM which can receive SMS messages. The Signal app only works
          with one phone number at a time, so you will need a mobile device to
          run the Signal app on.
        </Text>
        <Text marginTop={4}>
          <ClientOnly>
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007318691-Register-a-phone-number"
              target="_blank"
              variant="underline"
            >
              Follow Signal's instructions
            </Link>
          </ClientOnly>{" "}
          to register your new phone number and create a new Signal account.
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={8}
          size="lg"
        >
          Option 2: Commandline interface (CLI) and a phone number.
        </Heading>
        <Text>
          With this method, you can use a virtual (VoIP) number, so long as it
          receives SMS or calls. Setting up the CLI does require some technical
          capacity and familiarity with the terminal. The commandline interface
          and documentation are{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://github.com/AsamK/signal-cli"
              target="_blank"
              variant="underline"
            >
              available on Github
            </Link>
          </ClientOnly>
          .
        </Text>
        <Text marginTop={4}>
          Option 1 is straightforward and relatively easy to set up. Because
          some countries require sim SIM cards to be registered with an identity
          document, it depends on your context and threat model if this is
          suitable for you.
        </Text>
        <Text marginTop={4}>
          Option 2 requires more technical know-how. If you do not have the
          technical capacity to set up a new Signal account using the CLI but
          Option 1, using a physical SIM card, would place you at great risk,
          please get in touch with our team at{" "}
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>{" "}
          to see if we're able to help.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="multiple-admins-2"
          marginTop={8}
          size="xl"
        >
          Can a Bitpart bot be managed by multiple Admins?
        </Heading>
        <Text marginTop={4}>
          Yes. At the end of the “Create your bot” process, the last step ("Use
          your Bot") gives you a passcode. A Bot Creator can share the passcode
          with those members of their team that would be administering the bot,
          referred to here as "Admins."
        </Text>
        <Text marginTop={4}>
          <Text as="span" fontWeight={700}>
            For Broadcast channel bots:
          </Text>{" "}
          The passcode you receive at the end of the Bot creation process must
          be used by whoever will be sending the broadcast messages in order for
          the bot to work.
        </Text>
        <Text marginTop={4}>
          <Text as="span" fontWeight={700}>
            For Tipline, helpdesk, VPN, and eSIM bots:
          </Text>{" "}
          The passcode is optional to use. It allows for messages from Bot Users
          to be forwarded to another number (such as tips received via a tipline
          bot; or requests for extra support via the helpdesk, VPN, or eSIM
          bots). Forwarding may be particularly useful if you have multiple team
          members or if your bot has many people using it.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="forwarding-and-passcodes"
          marginTop={8}
          size="xl"
        >
          How can I set up forwarding? How do I use the passcode?
        </Heading>
        <List.Root as="ol" marginLeft={4} marginTop={4}>
          <List.Item marginTop={2}>
            Find the passcode by navigating to{" "}
            <ClientOnly>
              <Link color={color} href="/my-bots" variant="underline">
                your dashboard
              </Link>
            </ClientOnly>{" "}
            and identifying your bot.
            <Image marginTop={2} src="/screenshot-1.png" />
          </List.Item>
          <List.Item marginTop={4}>
            Send a message over Signal to the Bot, with just the password.
            <Image marginTop={2} src="/screenshot-2.png" />
          </List.Item>
          <List.Item marginTop={4}>
            You should receive a confirmation from the bot.
          </List.Item>
        </List.Root>
        <Text marginTop={4}>
          Note that whichever Signal account you used to send the passcode to
          the bot is now identified by the Bitpart system as an Admin. This
          means that:
        </Text>
        <List.Root marginLeft={4} marginTop={2}>
          <List.Item>
            for a broadcast bot, any messages that the Signal account (connected
            by passcode) sends to the bot will be forwarded on to everyone who
            has signed up to the broadcast bot.
          </List.Item>
          <List.Item>
            for a tipline bot, any tips that are received will be forwarded to
            the Signal account (connected by passcode).
          </List.Item>
          <List.Item>
            for a helpdesk, VPN, or eSIM bot, any requests to connect to human
            support or for help beyond the frequently asked questions will be
            forwarded to the Signal account.
          </List.Item>
        </List.Root>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={8}
          size="lg"
        >
          How to remove forwarding / passcode:
        </Heading>
        <List.Root as="ol" marginLeft={4}>
          <List.Item marginTop={2}>
            From a Signal account that previously sent a passcode to the bot,
            send a message to the bot saying "Help".
            <Image marginTop={2} src="/screenshot-3.png" />
          </List.Item>
          <List.Item marginTop={4}>
            Follow instructions to Delete the conversation with the bot.
          </List.Item>
          <List.Item marginTop={4}>
            Deleting the conversation history deletes the passcode and Bitpart's
            recognition of this Signal account as an Admin.
          </List.Item>
        </List.Root>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={8}
          size="lg"
        >
          How many accounts can use the passcode?
        </Heading>
        <Text>
          There are no limits to how many times a passcode can be used.
          Depending on your risk model, you may want multiple people to use the
          passcode (for instance, if you have a broadcast bot that you are using
          for an action and you anticipate that organizers may be detained).
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={8}
          size="lg"
        >
          How can I change the passcode?
        </Heading>
        <Text>
          Unfortunately, at this time you cannot reset or change a passcode,
          though this feature will be available soon. Remember, the passcode
          gives someone access to send out messages (broadcast bot) or receive
          messages (tipline, helpdesk, VPN & eSIM bots) from people using your
          bot.{" "}
          <Text as="span" fontWeight={700}>
            Please keep your passcode safe and private
          </Text>
          .
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          marginTop={8}
          size="lg"
        >
          How can I tell who has the passcode?
        </Heading>
        <Text>
          Unfortunately, at this time you cannot tell who has the passcode,
          beyond who you know you as a Bot Creator have distributed it to. We
          recommend erring on the side of caution and understanding the risks
          for your specific situation before sharing the passcode. Consider
          linking devices{" "}
          <ClientOnly>
            <Link
              color={color}
              href="#alternatives-to-passcode"
              variant="underline"
            >
              (see below)
            </Link>
          </ClientOnly>{" "}
          rather than using the passcode, as this will allow you to see which
          devices are linked through the Signal account.
        </Text>
        <Heading
          as="h4"
          className={geistMono.className}
          id="alternatives-to-passcode"
          marginTop={8}
          size="lg"
        >
          Alternatives to passcode: linking devices
        </Heading>
        <Text>
          Alternatively, if you want multiple people on a team to view bot
          messages but don't necessarily want messages forwarded, you may want
          to consider linking a desktop or iPad version of Signal instead of
          using the passcode. This would involve using the linked device to see
          the messages that are being sent and received by the bot. You will
          then be able to see which devices are linked to the primary device in
          the Signal account settings, giving greater overview. Guidance on how
          to link a device can be found in Signal's support pages:{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices"
              target="_blank"
              variant="underline"
            >
              support.signal.org/hc/en-us/articles/360007320551-Linked-Devices
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-can-i-delete-conversations"
          marginTop={8}
          size="xl"
        >
          How can I delete conversations?
        </Heading>
        <Text marginTop={4}>
          A person receiving messages from a Bitpart bot can delete
          conversations from Bitpart by entering "Delete" at any time and
          following the instructions (typically, they will simply be asked to
          confirm and enter "Delete" again). This deletes the record of there
          being a conversation from Bitpart's servers, but does not delete any
          data from either the bot's Signal account or the recipient's Signal
          account.
        </Text>
        <Text marginTop={4}>
          To completely delete all records of the conversation, a recipient and
          a Bot Creator will both need to delete messages within their Signal
          accounts. If you're not sure how to do this,{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007320491-Delete-messages-alerts-or-chats"
              target="_blank"
              variant="underline"
            >
              Signal has instructions here
            </Link>
          </ClientOnly>{" "}
          on how to Delete messages or chats.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-can-i-edit-text"
          marginTop={8}
          size="xl"
        >
          How can I edit the text in my bot?
        </Heading>
        <Text marginTop={4}>
          Navigate to your Dashboard/My bots page. There you will see a list of
          the bots you have created. Click the "Edit" button on the bot your
          wish to edit. You will see the information you previously entered when
          creating the bot. Change the information you would like to edit, then
          confirm by pressing "Edit."
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-can-i-change-bot-name"
          marginTop={8}
          size="xl"
        >
          How can I change the bot name?
        </Heading>
        <Text marginTop={4}>
          Follow{" "}
          <ClientOnly>
            <Link color={color} href="#how-can-i-edit-text" variant="underline">
              the instructions above
            </Link>
          </ClientOnly>{" "}
          on how to edit my bot to edit the name of your bot.
        </Text>
        <Text marginTop={4}>
          Remember that the profile name and profile picture on the Signal
          account that you use for you bot will be visible to everyone who
          interacts with it. Within the Signal app itself,{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007059952-Edit-my-Profile"
              target="_blank"
              variant="underline"
            >
              you can edit your profile
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-can-i-edit-text"
          marginTop={8}
          size="xl"
        >
          My bot is getting spammed. What can I do?
        </Heading>
        <Text marginTop={4}>
          Just as you would if someone is spamming a Signal account, take
          actions within the Signal account that is connected to your bot. For
          instance, you may want to block the account that is spamming your bot,
          or block and report it.
        </Text>
        <Text marginTop={4}>
          If you are concerned about any suspicious activity, please contact
          Bitpart’s support team at{" "}
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="can-i-use-my-device"
          marginTop={8}
          size="xl"
        >
          Can I use my own device to run a Bitpart bot that has been set up on a
          different device?
        </Heading>
        <Text marginTop={4}>
          Yes. Your Bitpart bot will continue to work even if the device that
          the Signal account your bot is connected to is turned off. We
          recommend turning on your device at least once every 30 days to make
          sure that the Signal account running your bot is working. For better
          responsiveness and management, you may also wish to frequently check
          the Signal account your bot is connected to.
        </Text>
        <Text marginTop={4}>
          After connecting the Signal account to your bot when creating your
          bot, you will use passcodes to send out broadcast messages from your
          own Signal account (in the case of a broadcast bot) or receive tips
          and support requests that Bitpart will forward to your own Signal
          account.{" "}
          <ClientOnly>
            <Link
              color={color}
              href="#forwarding-and-passcodes"
              variant="underline"
            >
              (Please see how to use passcodes.)
            </Link>
          </ClientOnly>
        </Text>
        <Text marginTop={4}>
          This means that during a protest or other action, the device with the
          Signal account that the bot is connected to can be left in a safe
          place - you do not need to take it with you.
        </Text>
        <Text marginTop={4}>
          Using the Signal account and device to which your bot is connected may
          be important for a number of reasons:
        </Text>
        <List.Root marginLeft={4} marginTop={2}>
          <List.Item>
            it is the only complete way to see who is engaging with your bot
            (such as who has opted in to receive your broadcasts, for example).
          </List.Item>
          <List.Item>
            it is the only way to manage your Signal account's settings, such as
            profile and disappearing messages.
          </List.Item>
          <List.Item>
            it is how you can delete conversations and block users.
          </List.Item>
        </List.Root>
        {/* RUNNING A BROADCAST CHANNEL */}
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="broacast-channel"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Running a broadcast channel
          </Heading>
        </ClientOnly>
        <Heading
          as="h3"
          className={geistMono.className}
          id="broadcast-channel-contacts"
          marginTop={8}
          size="xl"
        >
          Do I need to upload a list of contacts to create my broadcast channel?
        </Heading>
        <Text marginTop={4}>
          You cannot upload a list of contacts to the broadcast bot. Instead,
          you will have to share the Signal username or phone number to which
          your bot is connected, and individuals must actively opt in to your
          broadcast channel. Bitpart is designed this way to better protect your
          privacy, and that of your channel subscribers.
        </Text>
        <Text marginTop={4}>
          You cannot see who is subscribed to your broadcast channel in the form
          of a 'list,' and Bitpart does not collect or store this data. You are
          able to see all conversations on the primary device (where you set up
          the Signal account you use for your bot) and any other linked devices.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="broadcast-channel-who-is-using-it"
          marginTop={8}
          size="xl"
        >
          How can I see who is using my bot? How can I see who subscribed to my
          broadcast channel?
        </Heading>
        <Text marginTop={4}>
          You are able to see all bot conversations on the primary device (where
          you set up the Signal account you use for your bot) and any other
          linked devices. The conversations are not visible on the Bitpart site.
          There is no list of users (as Bitpart does not collect or store this
          information). The best way to see who has interacted with your bot is
          by checking the Signal account your bot uses on the primary device
          (i.e. a phone) or any other linked devices.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="broadcast-channel-remove"
          marginTop={8}
          size="xl"
        >
          How can I remove someone who has signed up to receive messages from my
          broadcast channel?
        </Heading>
        <Text marginTop={4}>
          The only way to do this currently would be to use functionalities
          within Signal, such as blocking an account you do not want to receive
          messages from you.
        </Text>
        {/* TROUBLESHOOTING */}
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="troubleshooting"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Troubleshooting
          </Heading>
        </ClientOnly>
        <Heading
          as="h3"
          className={geistMono.className}
          id="why-do-i-get-an-error-message"
          marginTop={8}
          size="xl"
        >
          Why do I get an error message when I try to connect my bot to the
          Signal account?
        </Heading>
        <Text marginTop={4}>
          This error can occur if the Signal account you are using is already
          connected to a bot. You can only use a Signal account for one bot at a
          time. Go to your dashboard to view your existing bots. Alternatively
          you can check the Signal account you are trying to use by messaging
          it.
        </Text>
        <Text marginTop={4}>
          Check the number of linked devices to the Signal account you want to
          use for the bot, to ensure you haven't reached the maximum.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="can-i-reset-password"
          marginTop={8}
          size="xl"
        >
          Can I reset my password?
        </Heading>
        <Text marginTop={4}>
          No. Please email us at{" "}
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>{" "}
          if you need ot reset your password.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-can-i-contact-you"
          marginTop={8}
          size="xl"
        >
          I have another issue or question, how can I contact you?
        </Heading>
        <Text marginTop={4}>
          Please email us at{" "}
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>
          . We will respond within 48 hours on weekdays and aim to respond
          faster.
        </Text>
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="deleting-closing"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Deleting / Closing a bot
          </Heading>
        </ClientOnly>
        <Heading
          as="h3"
          className={geistMono.className}
          id="can-i-turn-bot-off-on"
          marginTop={8}
          size="xl"
        >
          Can I turn my bot off & on?
        </Heading>
        <Text marginTop={4}>
          Currently you cannot turn your bot off and on. This feature has been
          requested in testing and is on our list to develop for future releases
          of Bitpart.
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-can-i-delete-bot"
          marginTop={8}
          size="xl"
        >
          How can I delete my bot?
        </Heading>
        <Text marginTop={4}>
          First, navigate to{" "}
          <ClientOnly>
            <Link color={color} href="/my-bots" variant="underline">
              "My Bots."
            </Link>
          </ClientOnly>
        </Text>
        <Text marginTop={4}>
          Then go to the Signal profile on the device which your bot was linked
          to. Navigate to "Settings", then "linked devices" and click on the bot
          and "unlink device". See detailed instructions on how to do this from
          Signal:
          <ClientOnly>
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007321111-Unlinking-devices"
              target="_blank"
              variant="underline"
            >
              support.signal.org/hc/en-us/articles/360007321111-Unlinking-devices
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="can-i-reuse-bot"
          marginTop={8}
          size="xl"
        >
          Can I build a new bot on a Signal account I had previously used for a
          bot?
        </Heading>
        <Text marginTop={4}>
          You can delete a bot, and set up a new bot which uses the same number
          and Signal username. Please be mindful of who you might have already
          shared the number and Signal username with previously. Please note
          that when you delete a bot, it deletes all past conversations on the
          Bitpart server but not on the Signal account and device, unless you do
          this manually.
        </Text>
        <ClientOnly>
          <Heading
            as="h2"
            borderBottom={`1px solid ${borderColor}`}
            className={geistMono.className}
            id="collaboration"
            marginBottom={2}
            marginTop={8}
            paddingBottom={2}
            size="2xl"
            textTransform="uppercase"
          >
            Collaboration
          </Heading>
        </ClientOnly>
        <Heading
          as="h3"
          className={geistMono.className}
          id="can-we-collaborate"
          marginTop={8}
          size="xl"
        >
          Can we collaborate on building Bitpart?
        </Heading>
        <Text marginTop={4}>
          Bitpart is an open source project and we welcome contributions. You
          can find
          <ClientOnly>
            <Link
              color={color}
              href="https://github.com/throneless-tech/bitpart"
              target="_blank"
              variant="underline"
            >
              Bitpart on Github
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading
          as="h3"
          className={geistMono.className}
          id="how-can-i-contact-you-code"
          marginTop={8}
          size="xl"
        >
          I’ve reviewed Bitpart’s code and have an idea / a report / a question.
          How can I contact you?
        </Heading>
        <Text marginTop={4}>
          Please email us at{" "}
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>
          .
        </Text>
      </Container>
      <Footer color={color} />
    </Box>
  );
}
