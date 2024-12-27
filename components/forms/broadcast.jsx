// base imports
import * as Yup from 'yup';

// chakra imports
import {
  Input,
  Textarea
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"

export const BroadcastForm = () => {
  const broadcastSchema = Yup.object({
    name: Yup.string().required(),
    welcomeMessage: Yup.string().required(),
  });

  return (
    <form>
      <Field
        label="List name"
        required
      >
        <Input placeholder="Special broadcast list" />
      </Field>
      <Field
        errorText="Field is required"
        helperText="The message that greets someone joining your list."
        label="Welcome message"
        marginTop={4}
        required
      >
        <Textarea placeholder="Start typing..." />
      </Field>
    </form>
  )
}