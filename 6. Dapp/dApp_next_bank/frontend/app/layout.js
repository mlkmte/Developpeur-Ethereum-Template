import { Flex, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import RainbowKitAndChakraProvider from "./RainbowKitAndChakraProvider";

export const metadata = {
  title: "Bank dApp",
  description: "Bank dApp with ReactJS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <RainbowKitAndChakraProvider>
        <body>
          <Flex justifyContent="space-between" alignItems="center" p="2rem">
            <Text>Logo</Text>
            <ConnectButton />
          </Flex>
          {children}
        </body>
      </RainbowKitAndChakraProvider>
    </html>
  );
}
