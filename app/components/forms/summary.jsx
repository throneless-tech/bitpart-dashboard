import { Box, List, Text } from "@chakra-ui/react";

// components imports
import { Alert } from "@/app/components/ui/alert";

export const Summary = ({ data, errors }) => {

  console.log('data is: ', data);
  

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
                  <List.Item key={key}>{key}</List.Item>
                ))}
              </List.Root>
            </Alert>
          </Box>
        </>
      ) : null}
      {Object.keys(data).length != 0 ? Object.keys(data).map(key => (
        <Text as="div" key={key} marginTop={4}>
          <Text fontWeight="bold">
            {
              key === "botType" ? "Bot type"
                : key === "botName" ? "Bot name"
                  : key === "adminPhones" ? "Admin phones"
                    : key === "privacyPolicy" ? "Data rights"
                      : key === "safetyTips" ? "Safety tips"
                        : key === "activationInstructions" ? "Activation instructions"
                          : key === "helpInstructions" ? "Help instructions"
                            : key === "storageAccess" ? "Storage access"
                              : key === "responseTime" ? "Response time"
                                : key === "maxCodes" ? "Maximum number of codes"
                                  : key === "vpnName" ? "VPN name"
                                    : key === "countryCode" ? ""
                                      : `${key.charAt(0).toUpperCase()}${key.slice(1)}`
            }
          </Text>
          {(!!data[key] && typeof data[key] !== "string") ? data[key].map((d, ind) => (
            <Box key={`innerdata-${ind}`}>
              {Object.keys(d).map((k, i) => (
                <Box key={`${k}-${i}`}>
                  <Text fontWeight="bold">{`${k.charAt(0).toUpperCase()}${k.slice(1)}`}</Text>
                  <Text>{d[k]}</Text>
                </Box>
              ))}
            </Box>
          )) : <Text>{key === "phone" ? `+${data["countryCode"]} ${data[key]}` : key === "countryCode" ? "" : data[key]}</Text>}
        </Text >
      )) : null}
    </>
  )
}