import { Box, Heading, Text, Button } from "@chakra-ui/react";

const ForumPage = () => {
  return (
    <Box>
      <Heading as="h1" size="xl">Forum</Heading>
      <Box>
        <Heading as="h2" size="lg">Thread Title</Heading>
        <Text>Thread content...</Text>
        <Button>Reply</Button>
      </Box>
      {/* Repeat the Box component for each thread */}
    </Box>
  );
};

export default ForumPage;
