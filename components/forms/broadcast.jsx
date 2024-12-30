// base imports
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// chakra imports
import {
  Input,
  Stack,
  Textarea
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export const BroadcastForm = ({ schema }) => {
  const { register, control, handleSubmit, errors } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'faq',
  });

  return (
    <>
      <Field
        errorText="Field is required"
        helperText="Name your list. It can mirror the bot name or be different."
        invalid={!!errors?.name}
        label="List name"
        required
        {...register('name')}
      >
        <Input placeholder="Special broadcast list" />
      </Field>
      <Field
        errorText="Field is required"
        helperText="The message that greets someone joining your list."
        invalid={!!errors?.welcomeMessage}
        label="Welcome message"
        marginTop={4}
        required
        {...register('welcomeMessage')}
      >
        <Textarea placeholder="Start typing..." />
      </Field>
      <Field
        errorText="Field is required"
        helperText="Describe the list and its rules."
        invalid={!!errors?.description}
        label="Description and rules"
        marginTop={4}
        required
        {...register('description')}
      >
        <Textarea placeholder="Start typing..." />
      </Field>
      <Field
        errorText="Field must be a string of text."
        helperText="Include safety tips for the list."
        invalid={!!errors?.safetyTips}
        label="Safety tips"
        marginTop={4}
        {...register('safetyTips')}
      >
        <Textarea placeholder="Start typing..." />
      </Field>
      <Field
        errorText="Fill out all the fields that you add."
        helperText="Add as many FAQ for the list as you need. Keep in mind this will appear as a text message, so we recommend six (6) or fewer question/answer combos."
        invalid={!!errors?.name}
        label="FAQ"
        marginTop={4}
        {...register('FAQ')}
      >
        {fields.map((f, i) => {
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
                <Input name='question' placeholder="Question" />
                <Input name='answer' placeholder="Answer" />
              </Stack>
              {i > 0 && 
                <Button
                  onClick={() => remove(i)}
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
            append({
              question: '',
              answer: '',
            })
          }
          variant="subtle"
        >
          Add FAQ
        </Button>
      </Field>
    </>
  )
}