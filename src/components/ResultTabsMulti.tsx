import { Tabs, Table, Box } from "@chakra-ui/react";
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
    <Tabs.Root defaultValue="you" mt={4} width="80%">
      {/* Tab List */}
      <Tabs.List bg="gray.700" borderRadius="md" p={1}>
        <Tabs.Trigger
          value="you"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "gray.900",
            color: "white",
          }}
        >
          <LuUser style={{ marginRight: "8px" }} />
          You
        </Tabs.Trigger>
        <Tabs.Trigger
          value="opponent"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "gray.900",
            color: "white",
          }}
        >
          <LuUser style={{ marginRight: "8px" }} />
          Opponent
        </Tabs.Trigger>
      </Tabs.List>

      {/* Tab Content */}
      <Tabs.Content value="you">
        <Box overflowY="auto" maxH="300px" width="100%">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Guess</Table.ColumnHeader>
                <Table.ColumnHeader>Hit</Table.ColumnHeader>
                <Table.ColumnHeader>Blow</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {myFeedbacks.map((feedback, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{feedback.guess}</Table.Cell>
                  <Table.Cell>{feedback.hits}</Table.Cell>
                  <Table.Cell>{feedback.blows}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Tabs.Content>
      <Tabs.Content value="opponent">
        <Box overflowY="auto" maxH="300px">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Guess</Table.ColumnHeader>
                <Table.ColumnHeader>Hit</Table.ColumnHeader>
                <Table.ColumnHeader>Blow</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {opponentFeedbacks.map((feedback, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{feedback.guess}</Table.Cell>
                  <Table.Cell>{feedback.hits}</Table.Cell>
                  <Table.Cell>{feedback.blows}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  );
}
