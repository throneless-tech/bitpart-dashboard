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
import { useColorModeValue } from "@/app/components/ui/color-mode";
import Header from "../../components/header";

export default function FAQ() {
  // session
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container marginBottom={20} marginTop={8} maxW="3xl">
        <Heading as="h1" size="2xl">
          Help / Frequently Asked Questions
        </Heading>
        <Text fontSize="xl" marginTop={4} textDecoration="underline">
          The basics
        </Text>
        <List.Root marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#what-is-bitpart" variant="underline">
                What is Bitpart?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-does-bitpart-work"
                variant="underline"
              >
                How does Bitpart work?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-does-bitpart-connect-to-signal"
                variant="underline"
              >
                How does Bitpart connect to Signal?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#what-bot-formats-are-there"
                variant="underline"
              >
                What bot formats are there?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#what-language-does-bitpart-come-in"
                variant="underline"
              >
                What languages does Bitpart come in?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text fontSize="xl" marginTop={4} textDecoration="underline">
          Security
        </Text>
        <List.Root marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link
                color={color}
                href="#is-bitpart-encrypted"
                variant="underline"
              >
                Is Bitpart encrypted?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-do-you-make-sure-bad-actors-dont-use-bitpart"
                variant="underline"
              >
                How do you make sure bad actors don't use Bitpart?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#where-do-you-store-data"
                variant="underline"
              >
                Where do you store data?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-do-i-know-i-can-trust-bitpart"
                variant="underline"
              >
                How do I know I can trust Bitpart?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text fontSize="xl" marginTop={4} textDecoration="underline">
          Using Bitpart
        </Text>
        <List.Root marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link
                color={color}
                href="#why-cant-i-use-my-personal-number"
                variant="underline"
              >
                Why can't I use my personal number/personal Signal account for
                the bot?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#where-can-i-see-who-is-interacting"
                variant="underline"
              >
                Where can I see who is interacting with my bot? / How can I see
                who is using my bot? / How can I see who is on my broadcast
                bot's distribution list?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-can-i-remove-someone"
                variant="underline"
              >
                How can I remove someone who has signed up to receive messages
                from my broadcast bot?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-can-i-delete-conversations"
                variant="underline"
              >
                How can I delete conversations?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-can-i-edit-the-text"
                variant="underline"
              >
                How can I edit the text in my bot?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#my-bot-is-getting-spammed"
                variant="underline"
              >
                My bot is getting spammed what can I do?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#what-is-a-passcode"
                variant="underline"
              >
                What is a passcode? What is forwarding?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Text fontSize="xl" marginTop={4} textDecoration="underline">
          Troubleshooting
        </Text>
        <List.Root marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link
                color={color}
                href="#why-do-i-get-an-error-message"
                variant="underline"
              >
                Why do I get an error message when I try to connect my bot to
                the Signal account?
              </Link>
            </List.Item>
            <List.Item>
              <Link
                color={color}
                href="#how-can-i-contact-you"
                variant="underline"
              >
                I have another issue or question, how can I contact you?
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Heading as="h2" marginTop={12} size="2xl">
          FAQs / help
        </Heading>
        <Heading as="h3" marginTop={8} size="xl" textDecoration="underline">
          The basics
        </Heading>
        <Heading id="what-is-bitpart" marginTop={8} size="lg">
          What is Bitpart?
        </Heading>
        <Text marginTop={4}>
          Bitpart is an automated messaging platform designed for activists,
          journalists, and human rights defenders in repressive environments,
          and the organisations that support them, to set up helpdesks,
          tiplines, distribute VPNs or e-sims, or broadcast messages. It can be
          set up and used via existing secure messaging platforms like Signal,
          without requiring users to download any additional software. There is
          a version hosted by Bitpart's developers, Throneless Tech, on the
          platform where you are right now. The code for Bitpart is open source
          and can be found on{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://github.com/throneless-tech/bitpart"
              variant="underline"
            >
              Github
            </Link>
          </ClientOnly>
          , so bot creators can host data on their own servers.
        </Text>
        <Heading id="how-does-bitpart-work" marginTop={8} size="lg">
          How does Bitpart work?
        </Heading>
        <Text marginTop={4}>
          Bitpart is a platform to built and run bots on Signal messenger.
          Bitpart offers the ability to send messages to many people at once
          (like a 'channel' or distribution list); and also offers the ability
          to set up automated responses in set formats. Once the bot is set up,
          all interactions take place over Signal.
        </Text>
        <Text marginTop={4}>
          In order for Bitpart to work, the bot connects to your Signal account
          as a linked device. The Bitpart server acts as an “end” in Signal’s
          end-to-end encryption. In the moment that the encrypted message is
          received by the server, the content is briefly stored to allow for the
          transmission of information. The messages are deleted almost instantly
          and are not ever saved in the database. We (Throneless Tech, the team
          that runs Bitpart) cannot access or read any of your messages, but you
          should be aware that they do briefly pass through Bitpart's servers in
          order for automation or broadcasting functionality.
        </Text>
        <Text marginTop={4}>
          Bitpart also offers the functionality of forwarding messages. For
          instance, a Bot Creator running a broadcast bot may want multiple
          people to be able to send broadcast messages. They therefore will ask
          those people to send a "passcode" to their bot's Signal account just
          once, which allows Bitpart to recognise those with the passcode. It
          means that the bot will always recognise those Signal accounts as
          broadcasters, and forward on their message to everyone who has signed
          up to the broadcast bot.
        </Text>
        <Text marginTop={4}>
          Forwarding is also helpful for the automated bots. For instance, a
          tipline Bot Creator can share the passcode with their colleagues, who
          would then message the tipline bot with the passcode. This allows for
          others in the newsroom to receive any incoming tips, which would be
          forwarded to their own Signal account. Or, if running a helpdesk or
          VPN distribution or eSIM distribution bot, sending the passcode to the
          bot allows for any requests for human support/ extra help to be
          forwarded immediately to whoever has used the passcode.{" "}
          <ClientOnly>
            <Link color={color} href="#what-is-a-passcode" variant="underline">
              See below
            </Link>
          </ClientOnly>{" "}
          for more information on passcodes.
        </Text>
        <Heading
          id="how-does-bitpart-connect-to-signal"
          marginTop={8}
          size="lg"
        >
          How does Bitpart connect to Signal?
        </Heading>
        <Text marginTop={4}>
          When setting up a bot, you will connect it to a Signal account by
          adding it as a linked device to your primary device. (You'll therefore
          be able to see all bot conversations on the primary device and any
          other linked devices).
        </Text>
        <Text marginTop={4}>
          Once Bitpart is connected, all messages received are replied to by the
          bot -- which is why we don't recommend using your personal Signal
          account.
        </Text>
        <Heading id="what-bot-formats-are-there" marginTop={8} size="lg">
          What bot formats are available?
        </Heading>
        <Text marginTop={4}>
          Bitpart currently offers 5 formats: broadcast, helpdesk, tipline, VPN
          distribution, and eSIM distribution. These formats are tailored to
          specific uses, and offer the following features:
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
              <Table.ColumnHeader minW="200px">Bot format</Table.ColumnHeader>
              <Table.ColumnHeader minW="200px">How it works</Table.ColumnHeader>
              <Table.ColumnHeader minW="200px">
                Direction of messages
              </Table.ColumnHeader>
              <Table.ColumnHeader minW="200px">
                Human in the loop?
              </Table.ColumnHeader>
              <Table.ColumnHeader minW="200px">
                Information a Bot Creator needs to provide to make a bot
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Broadcast</Table.Cell>
              <Table.Cell>
                People opt in to receive messages. Broadcast messages are sent
                from Bot creator or another admin's phone, with Bitpart
                forwarding on these messages individually.
              </Table.Cell>
              <Table.Cell>1 way only</Table.Cell>
              <Table.Cell>
                No. However the Bot Creator should specify who people should
                contact if they need support.
              </Table.Cell>
              <Table.Cell>
                Public name for the bot; info about the channel; contact info.{" "}
                <br />
                <br />
                OPTIONAL: <br />
                Safety tips, FAQs
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Tipline</Table.Cell>
              <Table.Cell>
                Offers a way for people to share information. They can also
                specify if they want to contacted for follow up or not.
              </Table.Cell>
              <Table.Cell>
                2 way, but its role is mostly to receive information from Bot
                Users
              </Table.Cell>
              <Table.Cell>Yes. Option to set up forwarding of tips</Table.Cell>
              <Table.Cell>Name; Data rights text</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Helpdesk</Table.Cell>
              <Table.Cell>
                Offers approximately up to 4 or 5 issues and replies.
              </Table.Cell>
              <Table.Cell>
                2 way communication, automated responses to frequently asked
                questions
              </Table.Cell>
              <Table.Cell>
                Yes, if a Bot User's question option to set up message
                forwarding when a user has a question beyond scope of helpdesk &
                needs to speak to a human
              </Table.Cell>
              <Table.Cell>
                Helpdesk name; Referral/ emergency contact; About; Response
                time; Data retention policy; Data rights; Frequently asked
                questions and responses
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>VPN distribution</Table.Cell>
              <Table.Cell>
                People are sent VPN codes (up to a maximum number set by the Bot
                Creator).
              </Table.Cell>
              <Table.Cell>
                Mostly 1 way (delivery of codes) though a bot user is able to
                interact
              </Table.Cell>
              <Table.Cell>
                Yes, if a Bot User needs Help and their needs are not met in the
                Help section, they can opt to speak to a human. The Bot Creator
                can use the passcode to set up message forwarding for these
                requests.
              </Table.Cell>
              <Table.Cell>
                Public name, About, Maximum number of downloads; Response time;
                CSV file with VPN codes
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>eSIM distribution</Table.Cell>
              <Table.Cell>
                People are sent an eSIM code after verifying that their device
                is eSIM compatible and that they are in an area covered by the
                eSIM.
              </Table.Cell>
              <Table.Cell>
                Mostly 1 way (delivery of codes) though a bot user is able to
                interact
              </Table.Cell>
              <Table.Cell>
                Yes, if a Bot User needs Help and their needs are not met in the
                Help section, they can opt to speak to a human. The Bot Creator
                can use the passcode to set up message forwarding for these
                requests.
              </Table.Cell>
              <Table.Cell>
                Public name; About; Data rights; Activation instructions; CSV
                file with eSIM codes. <br />
                <br />
                OPTIONAL: FAQs
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        <Text marginTop={4}>
          For all formats, a bot user has to message the bot first. (The bot
          cannot initiate a conversation.)
        </Text>
        <Text marginTop={4}>
          If you are not sure which bot format to use, we recommend thinking
          about if you mostly wanting to be sharing information out (broadcast),
          receiving information (tipline); or answering questions (helpdesk).
        </Text>
        <Heading
          id="what-language-does-bitpart-come-in"
          marginTop={8}
          size="lg"
        >
          What languages does Bitpart come in?
        </Heading>
        <Text marginTop={4}>
          Currently Bitpart is only in English. Adding more languages is a
          priority.
        </Text>
        <Text marginTop={4}>
          If there's a language you would like to build your bot in, please
          message us, as we will prioritise languages based on need and ease of
          implementing them (
          <ClientOnly>
            <Link
              color={color}
              href="mailto:contact@bitp.art"
              variant="underline"
            >
              contact@bitp.art
            </Link>
          </ClientOnly>
          ).
        </Text>
        <Heading as="h3" marginTop={8} size="xl" textDecoration="underline">
          Security
        </Heading>
        <Heading id="is-bitpart-encrypted" marginTop={8} size="lg">
          Is Bitpart encrypted?
        </Heading>
        <Text marginTop={4}>
          Messages are encrypted between your bot and anyone who messages it (as
          all Signal messages are). , and are also encrypted at rest in the
          database using AES256 encryption from the SQLCipher Project. We’re
          taking all precautions, but there are some inherent risks, as the
          person operating Bitpart does have access to the messages (for
          instance it would be technically possible for the operator to read the
          messages, but we don’t expose that functionality).
        </Text>
        <Heading
          id="how-do-you-make-sure-bad-actors-dont-use-bitpart"
          marginTop={8}
          size="lg"
        >
          How do you make sure bad actors don’t use Bitpart?
        </Heading>
        <Text marginTop={4}>We have taken a number of measures, such as:</Text>
        <List.Root marginLeft={4}>
          <List.Item>
            intentionally researching the needs of our community and designing
            bots with specific formats and limiting what can be changed within
            them.
          </List.Item>
          <List.Item>
            access is currently only offered via invite codes (during this
            launch period)
          </List.Item>
          <List.Item>bots cannot initiate conversations.</List.Item>
          <List.Item>
            bot users consent to interact with a bot, and can withdraw that
            consent at any time by deleting the conversation (i.e. sending
            "Delete"), or blocking the Signal account that the bot uses.
          </List.Item>
          <List.Item>
            monitoring for unusual activity on the Bitpart dashboard.
          </List.Item>
          <List.Item>
            undergoing a Threat Modelling & Risk Assessment from a trusted third
            party organisation
          </List.Item>
          <List.Item>
            undergoing a Security Audit from a trusted third party organisation
          </List.Item>
        </List.Root>
        <Text marginTop={4}>
          We have tried our best to balance potential abuse without compromising
          user privacy.
        </Text>
        <Text marginTop={4}>
          Bitpart’s repository will be open source, and like all open source
          projects we can’t guarantee that it won’t be used by bad actors.
        </Text>
        <Text marginTop={4}>
          If you have any concerns of suspicious activity please contact us:{" "}
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
        <Heading id="where-do-you-store-data" marginTop={8} size="lg">
          Where do you store data?
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
        <Heading id="how-do-i-know-i-can-trust-bitpart" marginTop={8} size="lg">
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
          In building Bitpart we have taken{" "}
          <ClientOnly>
            <Link
              color={color}
              href="#is-bitpart-encrypted"
              variant="underline"
            >
              significant security measures
            </Link>
          </ClientOnly>
          .
        </Text>
        <Text marginTop={4}>
          The code for Bitpart is available on{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://github.com/throneless-tech/bitpart"
              variant="underline"
            >
              Github
            </Link>
          </ClientOnly>
          , for those who wish to examine it.
        </Text>
        <Heading as="h3" marginTop={8} size="xl" textDecoration="underline">
          Using Bitpart
        </Heading>
        <Heading id="why-cant-i-use-my-personal-number" marginTop={8} size="lg">
          Why can't I use my personal number/personal Signal account for the
          bot?
        </Heading>
        <Text marginTop={4}>
          Once a bot is connected to a Signal account, any messages received by
          that account will trigger the bot. Therefore if you use your personal
          number or account, anyone messaging you will receive messages from the
          bot.
        </Text>
        <Heading id="what-is-a-passcode" marginTop={8} size="lg">
          What is a passcode? What is forwarding?
        </Heading>
        <Text marginTop={4}>
          At the end of creating your bot, at the last step of the process ("Use
          your Bot,") you will see a passcode.
        </Text>
        <Text marginTop={4}>
          Broadcast:{" "}
          <Text as="span" fontWeight={700}>
            The passcode must be used for the broadcast bot in order to send
            broadcast messages
          </Text>
          .
        </Text>
        <Text marginTop={4}>
          Tipline, helpdesk, VPN, eSIM: The passcode is{" "}
          <Text as="span" fontWeight={700}>
            optional
          </Text>{" "}
          to use. It allows for messages from Bot Users to be forwarded to
          another number (such as forwarding of tips; or forwarding of requests
          for extra help and support beyond the scope of the helpdesk, VPN, or
          eSIM bot). This forwarding functionality can help to identify tips or
          flag support requests. Forwarding may be particularly useful if you
          have multiple team members or if your bot has many people using it.
        </Text>
        <Text fontWeight={700} marginTop={4}>
          How to set up forwarding/passcode:
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <List.Item>
            Find the passcode by navigating to your{" "}
            <ClientOnly>
              <Link color={color} href="/home" variant="underline">
                dashboard
              </Link>
            </ClientOnly>{" "}
            and identifying your bot.
            <Image src="/screenshot-1.png" />
          </List.Item>
          <List.Item marginTop={2}>
            Send a message over Signal to the Bot, with just the password.
            <Image src="/screenshot-2.png" />
          </List.Item>
          <List.Item marginTop={2}>
            You should receive a confirmation from the bot.
          </List.Item>
        </List.Root>
        <Text marginTop={4}>
          Note that whichever Signal account you used to send the passcode to
          the bot is now identified by the Bitpart system as an admin. This
          means that:
        </Text>
        <List.Root marginLeft={4}>
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
            forwarded to the Signal account
          </List.Item>
        </List.Root>
        <Text fontWeight={700} marginTop={4}>
          Alternatives to passcode: linking devices
        </Text>
        <Text marginTop={4}>
          Alternatively, if you want multiple people on a team to view bot
          messages but don't necessarily want messages forwarded, you may want
          to consider linking a desktop or iPad version of Signal instead of
          using the passcode. This would involve using the linked device to see
          the messages that are being sent and received by the bot. You will
          then be able to see which devices are linked to the primary device in
          the Signal account settings, giving greater overview. Guidance on how
          to link a device can be found in Signal's support pages:
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
        <Text fontWeight={700} marginTop={4}>
          How to remove forwarding / passcode:
        </Text>
        <List.Root as="ol" marginLeft={4}>
          <List.Item>
            From a Signal account that previously sent a passcode to the bot,
            send a message to the bot saying "Help".
            <Image src="/screenshot-3.png" />
          </List.Item>
          <List.Item marginTop={2}>
            Follow instructions to Delete the conversation with the bot.
          </List.Item>
          <List.Item marginTop={2}>
            Deleting the conversation history deletes the passcode and Bitpart's
            recognition of this Signal account as an admin.
          </List.Item>
        </List.Root>
        <Text fontWeight={700} marginTop={4}>
          How many accounts can use the passcode?
        </Text>
        <Text marginTop={4}>
          There are no limits on how many times a passcode can be used.
          Depending on your risk model, you may want multiple people to use the
          passcode (for instance if you have a broadcast bot that you are using
          for an action and you anticipate that organizers may be detained).
        </Text>
        <Text fontWeight={700} marginTop={4}>
          How can I change the passcode?
        </Text>
        <Text marginTop={4}>
          Unfortunately at this time you cannot reset or change a passcode.
          Remember -- the passcode gives someone access to send out (broadcast
          bot) or receive (tipline, helpdesk, VPN & eSIM bots) messages from
          people using your bot. Please keep your passcode safe and private.
        </Text>
        <Text fontWeight={700} marginTop={4}>
          How can I tell who has the passcode?
        </Text>
        <Text marginTop={4}>
          Unfortunately at this time you cannot tell who has the passcode,
          beyond know who you as a Bot Creator have distributed it to. We
          recommend erring on the side of caution and understanding the risks
          for your specific situation before sharing the passcode. Consider{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices"
              target="_blank"
              variant="underline"
            >
              linking devices
            </Link>
          </ClientOnly>{" "}
          rather than using the passcode, as this will allow you to see which
          devices are linked through the Signal account.
        </Text>
        <Heading
          id="where-can-i-see-who-is-interacting"
          marginTop={8}
          size="lg"
        >
          Where can I see who is interacting with my bot? / How can I see who is
          using my bot? / How can I see who is on my broadcast bot's
          distribution list?
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
        <Heading id="how-can-i-remove-someone" marginTop={8} size="lg">
          How can I remove someone who has signed up to receive messages from my
          broadcast bot?
        </Heading>
        <Text marginTop={4}>
          The only way to do this currently would be to use functionalities
          within Signal, such as blocking an account you do not want to receive
          messages from you.
        </Text>
        <Heading id="how-can-i-delete-conversations" marginTop={8} size="lg">
          How can I delete conversations?
        </Heading>
        <Text marginTop={4}>
          An bot user can delete conversations from Bitpart by entering "Delete"
          at any time and following the instructions (typically they will have
          to confirm again). This deletes the record of there being a
          conversation from Bitpart's servers, but does not delete any data from
          either the bot's Signal account or the bot user's Signal account.
        </Text>
        <Text marginTop={4}>
          To completely delete all records of the conversation, a bot user and a
          bot creator will both need to delete messages within their Signal
          accounts. If you're not sure how to do this, Signal has instructions{" "}
          <ClientOnly>
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007320491-Delete-messages-alerts-or-chats"
              target="_blank"
              variant="underline"
            >
              here
            </Link>
          </ClientOnly>
          .
        </Text>
        <Heading id="how-can-i-edit-the-text" marginTop={8} size="lg">
          How can I edit the text in my bot?
        </Heading>
        <Text marginTop={4}>
          Navigate to your Dashboard/My bots page. There you will see a list of
          the bots you have created. Click the "Edit" button on the bot your
          wish to edit. You will see the information you previously entered when
          creating the bot. Change the information you would like ot edit, then
          confirm by pressing "Edit."
        </Text>
        <Heading id="my-bot-is-getting-spammed" marginTop={8} size="lg">
          My bot is getting spammed, what can I do?
        </Heading>
        <Text marginTop={4}>
          Just as you would if someone is spamming a Signal account, take
          actions within the Signal account that is connected to your bot. For
          instance you may want to block the account that is spamming your bot;
          or block and report it.
        </Text>
        <Heading as="h3" marginTop={8} size="xl" textDecoration="underline">
          Troubleshooting
        </Heading>
        <Heading id="why-do-i-get-an-error-message" marginTop={8} size="lg">
          Why do I get an error message when I try to connect my bot to the
          Signal account?
        </Heading>
        <Text marginTop={4}>
          This error can occur if the Signal account you are using is already
          connected to a bot. Go to your dashboard to view your existing bots;
          if you entered the (optional) number when making your bot, you will
          see it there. Alternatively you can check the Signal account you are
          trying to use by messaging it. You can only use a Signal account for
          one bot at a time.
        </Text>
        <Heading id="how-can-i-contact-you" marginTop={8} size="lg">
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
      </Container>
    </Box>
  );
}
