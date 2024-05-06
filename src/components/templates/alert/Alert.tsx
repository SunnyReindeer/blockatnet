import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  FormControl,
  FormLabel,
  Flex,
  useColorModeValue,
  Select,
  GridItem,
  Grid,
  Icon,
  Text,
  RadioGroup,
  Stack,
  Radio,
  Input,
  Button,
  List,
  ListItem,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { FaBitcoin, FaEthereum, FaSun, FaMoon, FaGlobeAmericas, FaGlobeAsia, FaTether } from 'react-icons/fa';
import { CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { toast } from '@chakra-ui/toast';
import { useToast } from '@chakra-ui/react';  

const Alert = () => {
  const [selectedOption, setSelectedOption] = useState('wallet');
  const [targetPrice, setTargetPrice] = useState('');
  const [email, setEmail] = useState('');
  const [alertList, setAlertList] = useState([]);
  const [quicknodeUrl, setQuicknodeUrl] = useState('');
  const [pipedreamUrl, setPipedreamUrl] = useState('');
  const toast = useToast();

  useEffect(() => {
    // Initialize QuickNode and Pipedream URLs
    setQuicknodeUrl('https://your-quicknode-url.com');
    setPipedreamUrl('https://your-pipedream-url.com');
  }, []);

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      // Create a new alert using QuickNode
      const response = await axios.post(`${quicknodeUrl}/alerts`, {
        alertType: selectedOption,
        targetPrice,
        email,
      });
      if (response.status === 201) {
        // Add the new alert to the list
        setAlertList((prevList) => [...prevList, response.data]);
        toast({ title: 'Alert created successfully', status: 'success' });
      } else {
        toast({ title: 'Error creating alert', status: 'error' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error creating alert', status: 'error' });
    }
  };

  const handleCheckAlerts = async () => {
    try {
      // Check for triggered alerts using QuickNode
      const response = await axios.get(`${quicknodeUrl}/alerts/triggered`);
      if (response.status === 200) {
        // Loop through triggered alerts and send notifications using Pipedream
        response.data.forEach((alert) => {
          axios.post(`${pipedreamUrl}/notifications`, {
            alertType: alert.alertType,
            targetPrice: alert.targetPrice,
            email: alert.email,
          });
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" mb={4}>
        <Box w="48%" mr={4}>
          <Text fontSize="2xl" mb={4}>Cryptocurrency Price Alert</Text>
          <form onSubmit={handleAddAlert}>
            <RadioGroup onChange={(value) => setSelectedOption(value)} value={selectedOption}>
              <Stack direction="row">
                <Radio value="wallet">Monitor Wallet</Radio>
                <Radio value="smartContract">Monitor Smart Contract</Radio>
                <Radio value="burnedFee">Burned Fee</Radio>
              </Stack>
            </RadioGroup>
            {selectedOption === 'wallet' && (
              <FormControl isRequired mt={4}>
                <FormLabel>Wallet Address</FormLabel>
                <Input type="text" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
                <FormLabel>Gas Price</FormLabel>
                <Input type="text" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
              </FormControl>
            )}
            {selectedOption === 'smartContract' && (
              <FormControl isRequired mt={4}>
                <FormLabel>Smart Contract Hash</FormLabel>
                <Input type="text" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
                <FormLabel>Gas Price</FormLabel>
                <Input type="text" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
              </FormControl>
            )}
            {selectedOption === 'burnedFee' && (
              <FormControl isRequired mt={4}>
                <FormLabel>Burned Fee Amount</FormLabel>
                <Input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
              </FormControl>
            )}
            <FormControl isRequired mt={4}>
              <FormLabel>Email for Alerts</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <Button colorScheme="blue" type="submit" mt={4} isDisabled={alertList.length >= 3}>
              Add Alert
           </Button>
          </form>
        </Box>
        <Box w="48%" ml={4}>
          <Text fontSize="2xl" mb={4}>
            Alert List
          </Text>
          <List>
            {alertList.map((alert) => (
              <ListItem key={alert.id}>
                <Flex alignItems="center">
                  <Text flex="1">{alert.alertType}</Text>
                  <Text>{alert.targetPrice}</Text>
                  <Text>{alert.email}</Text>
                  <IconButton
                    aria-label="Remove alert"
                    icon={<CloseIcon />}
                    size="sm"
                    onClick={() => {
                      // Remove the alert from the list
                      setAlertList((prevList) => prevList.filter((a) => a.id !== alert.id));
                    }}
                  />
                </Flex>
              </ListItem>
            ))}
          </List>
          <Button colorScheme="blue" mt={4} onClick={handleCheckAlerts}>
            Check Alerts
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default Alert;