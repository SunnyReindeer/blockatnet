import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Box, 
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  RadioGroup,
  HStack,
  Radio,
  Flex,
  useColorModeValue,
  Select,
  Input,
  NumberInputField,
  NumberInput,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,} from '@chakra-ui/react';

import anychart from 'anychart';

const Alert = () => {
  const { data: sessionData } = useSession();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const primaryColor = useColorModeValue('teal.500', 'teal.300');
  const secondaryColor = useColorModeValue('gray.700', 'gray.400');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI5N2Y2Mjc1LWVhZDQtNDNiOC04MmU2LWQyOTc2NDFkODdlYiIsIm9yZ0lkIjoiMzg0NjAyIiwidXNlcklkIjoiMzk1MTc2IiwidHlwZUlkIjoiZmZhOWY5NjAtZjZjMy00Y2JhLThhYTgtNWNhYzNkMTFkMGJmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEzNTQ1MTksImV4cCI6NDg2NzExNDUxOX0.h9-OeF5VKg4jPHXylfBaXphHk_Hm1ljzxYEDPtlx_BU';


  return (
    <Flex direction="column" p={8} bg={bgColor} borderRadius="lg">
  <Box
    p={8}
    shadow="md"
    borderWidth="1px"
    borderRadius="lg"
    bg={useColorModeValue('white', 'gray.700')}
  >
    <FormControl mb={4}>
      <FormLabel color={secondaryColor}>Type</FormLabel>
      <Select placeholder="Bitcoin (BTC)" color={primaryColor}>
        <option>Ethereum (ETH)</option>
      </Select>
    </FormControl>
    <FormControl mb={4} isRequired>
      <FormLabel color={secondaryColor}>Currency</FormLabel>
      <Input placeholder="Currency" color={primaryColor} />
    </FormControl>
    <FormControl as="fieldset" mb={4}>
      <FormLabel color={secondaryColor} mb={2}>
        Price Condition
      </FormLabel>
      <RadioGroup defaultValue="above">
        <HStack spacing="24px" color={primaryColor}>
          <Radio value="above">Above</Radio>
          <Radio value="below">Below</Radio>
        </HStack>
      </RadioGroup>
    </FormControl>
    <FormControl mb={4}>
      <FormLabel color={secondaryColor}>Price</FormLabel>
      <NumberInput max={50} min={10} color={primaryColor}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
    <FormControl mb={4} isRequired>
      <FormLabel color={secondaryColor}>Email</FormLabel>
      <Input placeholder="Email" color={primaryColor} />
    </FormControl>
  </Box>
</Flex>
  );
};

export default Alert;
