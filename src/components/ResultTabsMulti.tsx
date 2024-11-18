import {
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";

interface Feedback {
  guess: string;
  hits: number;
  blows: number;
}

interface ResultTabsMultiProps {
  myFeedbacks: Feedback[];
  opponentFeedbacks: Feedback[];
}

export default function ResultTabsMulti({
  myFeedbacks,
  opponentFeedbacks,
}: ResultTabsMultiProps) {
  return (
    <Tabs variant="unstyled" mt={4}>
      <TabList bg="gray.700" borderRadius="md" p={1}>
        <Tab _selected={{ bg: "gray.900", color: "white" }} borderRadius="md">
          <LuUser style={{ marginRight: "8px" }} />
          You
        </Tab>
        <Tab _selected={{ bg: "gray.900", color: "white" }} borderRadius="md">
          <LuUser style={{ marginRight: "8px" }} />
          Opponent
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Box overflowY="auto" maxH="300px">
            <Table variant="simple" size="sm">
              <Thead position="sticky" top={0} bg="gray.700">
                <Tr>
                  <Th color="white">Guess</Th>
                  <Th color="white">Hit</Th>
                  <Th color="white">Blow</Th>
                </Tr>
              </Thead>
              <Tbody>
                {myFeedbacks.map((feedback, index) => (
                  <Tr key={index}>
                    <Td>{feedback.guess}</Td>
                    <Td>{feedback.hits}</Td>
                    <Td>{feedback.blows}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </TabPanel>
        <TabPanel>
          <Box overflowY="auto" maxH="300px">
            <Table variant="simple" size="sm">
              <Thead position="sticky" top={0} bg="gray.700">
                <Tr>
                  <Th color="white">Guess</Th>
                  <Th color="white">Hit</Th>
                  <Th color="white">Blow</Th>
                </Tr>
              </Thead>
              <Tbody>
                {opponentFeedbacks.map((feedback, index) => (
                  <Tr key={index}>
                    <Td>{feedback.guess}</Td>
                    <Td>{feedback.hits}</Td>
                    <Td>{feedback.blows}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
