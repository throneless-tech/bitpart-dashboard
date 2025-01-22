import { Box, List, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

// components imports
import { Alert } from "@/components/ui/alert";

export const Summary = ({ data, errors }) => {
  useEffect(() => { }, [data, errors])

  return (
    <>
      {errors && errors.length ? (
        <>
          <Box marginY={6}>
            <Alert status="error" title="Invalid Fields">
              <Text>
                Your form has some errors. Please go back and fix the following fields before submitting this form:
              </Text>
              <List.Root marginTop={2} variant="plain">
                {errors.map(error => (
                  <List.Item key={error}>{error}</List.Item>
                ))}
              </List.Root>
            </Alert>
          </Box>
        </>
      ) : null}
      {data && data.length ? (data.map(d => (
        <Box key={d.value}>
          {typeof d.value == "object" ? (
            <>
              <Text as="div" marginTop={4}>
                <Text fontWeight="bold">{d.name}</Text>
                <Text>{d.value.countryCode ? `+${d.value.countryCode}` : ""} {d.value.phone}</Text>
              </Text >
            </>
          ) : (
            <Text as="div" marginTop={4}>
              <Text fontWeight="bold">{d.name}</Text>
              <Text>{d.value}</Text>
            </Text >
          )}
        </Box>
      ))
      ) : null}
    </>
  )
}