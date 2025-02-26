import { Box, List, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

// components imports
import { Alert } from "@/components/ui/alert";

export const Summary = ({ data, errors }) => {
  useEffect(() => {
    console.log('data is: ', data);
    console.log('errors are: ', errors);

    console.log(Object.keys(data).length);
    Object.keys(data).forEach((key, index) => console.log(key))


  }, [data, errors])

  return (
    <>
      {Object.keys(errors).length !== 0 ? (
        <>
          <Box marginY={6}>
            <Alert status="error" title="Invalid Fields">
              <Text>
                Your form has some errors. Please go back and fix the following fields before submitting this form:
              </Text>
              <List.Root marginTop={2} variant="plain">
                {Object.keys(errors).map(key => (
                  <List.Item key={key}>{errors[key]}</List.Item>
                ))}
              </List.Root>
            </Alert>
          </Box>
        </>
      ) : null}
      {Object.keys(data).length != 0 ? Object.keys(data).map(key => (
        <Text as="div" key={key} marginTop={4}>
          <Text fontWeight="bold">{key}</Text>
          <Text>{data[key]}</Text>
        </Text >
      )) : null}
    </>
  )
}