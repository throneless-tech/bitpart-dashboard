// base imports
import * as React from 'react'

// chakra imports
import {
  Link,
  List,
  Text
} from '@chakra-ui/react'

export default function PrivacyPolicyText() {

  return (
    <>
      <Text>
        The people who will use your chatbot have rights over their data. They have:
      </Text>
      <List.Root marginLeft={4}>
        <List.Item>
          a right to privacy;
        </List.Item>
        <List.Item>
          a right to edit and access their own information;
        </List.Item>
        <List.Item>
          and a right to be forgotten (i.e. to erase their data).
        </List.Item>
      </List.Root>
      <Text marginTop={4}>
        Bitpart automatically includes a message called "My data rights" that anyone using your bot will be able to navigate. This message contains 2 sections: space for your data policy, and information about Bitpart's Privacy policy:
      </Text>
      <List.Root as="ol" marginBottom={8}>
        <List.Item>
          <Text marginTop={4}>
            <Text as="span" fontWeight={700}>
              Your data policy
              <br />
            </Text>
            If you are part of an organization that has a privacy policy or data policy, include a brief few lines summarising it in plain language and link to the full policy.
          </Text>
          <Text marginTop={4}>

            If you do not have a privacy policy, now is the time to think about data for the chatbot you are building.
          </Text>
          <List.Root as="ol" marginLeft={4} marginTop={4}>
            <List.Item>
              What information is being collected?{' '}
              <Text as="span" fontStyle="italic">
                (For instance are your recording usernames and phone numbers? What are you doing the contents of messages?)
              </Text>
            </List.Item>
            <List.Item>
              How long will information be stored and used?{' '}
              <Text as="span" fontStyle="italic">

                (What if someone accesses the information you are collecting, who isn't meant to? It's better to minimise what you have, and one way to do this is to regularly delete data)
              </Text>
            </List.Item>
            <List.Item>
              What happens after this period?{' '}
              <Text as="span" fontStyle="italic">

                (For instance you may wish to delete data that is more than 6 months old; and set reminders so that you actually do so)
              </Text>
            </List.Item>
            <List.Item>
              How is it processed?{' '}
              <Text as="span" fontStyle="italic">
                (What will you do with the data you collect? How will you be storing it or using it?)
              </Text>
            </List.Item>
            <List.Item>
              An explanation of why collecting any personal data is required.
            </List.Item>
            <List.Item>
              What is the minimum data needed in order for us to provide the service{' '}
              <Text as="span" fontStyle="italic">
                (such as helpdesk support or send an eSIM)?
              </Text>
            </List.Item>
            <List.Item>
              How can someone using your bot edit or delete their data?{' '}
              <Text as="span" fontStyle="italic">
                (for instance this may be asking you to delete it)
              </Text>
            </List.Item>
          </List.Root>
          <Text marginTop={4}>
            Some top tips:
          </Text>
          <List.Root marginLeft={4} marginTop={2}>
            <List.Item>
              Use simple language
            </List.Item>
            <List.Item>
              Update it regularly and inform the people using your service of any changes
            </List.Item>
            <List.Item>
              If you have a full privacy policy, we recommend linking to it at the end of your message
            </List.Item>
            <List.Item>
              If possible, provide a way for people to contact you, like an email or phone number.
            </List.Item>
          </List.Root>
        </List.Item>
        <List.Item>
          <Text fontWeight={700} marginTop={4}>
            Bitpart's data policy
          </Text>
          <List.Root marginLeft={4} marginTop={2}>
            <List.Item>
              This bot or automated messaging system is built using a tool called Bitpart.
            </List.Item>
            <List.Item>
              Signal offers' end-to-end encryption, but it is important to let you know that Bitpart acts as an "end." Bitpart works by relaying messages between senders and receivers, and therefore message content is visible to our server momentarily in order for that to happen, but is not stored.
            </List.Item>
            <List.Item>
              Bitpart seeks to minimize the amount of personal information that is collected from you and works to promptly delete that data once it is no longer required. For instance, after you finish a conversation we will delete your data from our system.
            </List.Item>
            <List.Item>
              For our full terms of use and privacy policy, see{' '}
              <Link href="/tos-and-privacy" variant="underline">
              here
              </Link>.
            </List.Item>
            <List.Item>
              Contact us at{' '}
              <Link href='mailto:contact@bitp.art' variant="underline">
                contact@bitp.art
              </Link> {' '} with any questions
            </List.Item>
          </List.Root>
        </List.Item>
      </List.Root>
    </>
  )
}