import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  Input,
  Select,
  Button,
  Text,
  UnorderedList,
  ListItem,
  AlertIcon,
  CloseButton,
  Grid,
  GridItem,
  InputGroup,
  InputLeftAddon,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td
} from '@chakra-ui/react';
import Web3 from 'web3';
import axios from 'axios';
import detectEthereumProvider from '@metamask/detect-provider';
import emailjs from '@emailjs/browser';
import app from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { toast,ToastContainer } from 'react-toastify'; // Add react-toastify for in-app notifications
import 'react-toastify/dist/ReactToastify.css';

const database = app.database();
const alertsRef = database.ref('activeAlerts');

interface PriceData {
  [key: string]: { usd: number };
}

interface ThresholdData {
  [key: string]: number;
}

interface AlertData {
  crypto: string;
  threshold: number;
}

const CRYPTOCURRENCIES = [
  'bitcoin',
  'ethereum',
  'litecoin',
  'bitcoin-cash',
  'cardano',
  'stellar',
  'eos',
  'monero',
  'ripple',
  'tether',
  'binance-coin',
  'neo',
  'dash',
  'iota',
  'tron',
  'vechain',
  'ethereum-classic',
  'qtum',
  'omisego',
  'augur',
  'golem',
  'status',
  'digixdao',
];
emailjs.init('wkbzNWH_xzboxGoGT');

const Alert = () => {
  const [web3, setWeb3] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [prices, setPrices] = useState({});
  const [thresholds, setThresholds] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [threshold, setThreshold] = useState('');
  const [emailError, setEmailError] = useState('');
  const [currentPrices, setCurrentPrices] = useState({}); // Add this line
  const [alertCount, setAlertCount] = useState(0); // Add this line

  useEffect(() => {
    const connectToBlockchain = async () => {
      try {
        const provider = await detectEthereumProvider();
        if (provider) {
          const web3 = new Web3(provider);
          const accounts = await web3.eth.requestAccounts();
          const userAccount = accounts[0];

          setWeb3(web3);
          setUserAccount(userAccount);
        } else {
          throw new Error('Please install MetaMask to use this dApp.');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error connecting to blockchain'); // Display error message using toast
      }
    };

    connectToBlockchain();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: CRYPTOCURRENCIES.join(','),
            vs_currencies: 'usd',
          },
        });
        setPrices(response.data);
        setCurrentPrices(response.data); // Update currentPrices here
        checkThresholds(response.data, thresholds);
      } catch (error) {
        console.error(error);
        // Display error message to the user
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);

    return () => clearInterval(interval);
  }, [thresholds]);

  const createAlert = (crypto, threshold) => {
    const newThresholdAlert = { crypto, threshold, id: uuidv4() }; // generate a unique ID
    alertsRef.push(newThresholdAlert);
  };


  useEffect(() => {
    const unsubscribe = alertsRef.on('value', (snapshot) => {
      if (snapshot && snapshot.exists()) {
        const alerts = [];
        snapshot.forEach((childSnapshot) => {
          alerts.push({...childSnapshot.val(), key: childSnapshot.key }); // add the key to each alert
        });
        setActiveAlerts(alerts);
      } else {
        setActiveAlerts([]);
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  const removeAlert = (alertToRemove) => {
    alertsRef.child(alertToRemove.key).remove();
    setAlertCount(alertCount - 1); // Decrement alertCount when an alert is removed
  };

  const handleThresholdChange = async () => {
    if (selectedCrypto && threshold && isValidEmail(userEmail) && web3 && userAccount) {
      if (activeAlerts.length < 3) { // Check if the user has already created 3 alerts
        setThresholds((prevThresholds) => ({...prevThresholds, [selectedCrypto]: parseFloat(threshold) }));
  
        const newThresholdAlert: AlertData = { crypto: selectedCrypto, threshold: parseFloat(threshold) };
        createAlert(selectedCrypto, parseFloat(threshold));
        sendEmailOnThresholdChange(selectedCrypto, newThresholdAlert);
        setAlertCount(activeAlerts.length + 1);
        toast.success('Alert created successfully!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: notificationStyle, // Apply custom style
        }); // Display success notification
      } else {
        toast.error('You have already created 3 alerts. Please remove some alerts to create new ones.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: notificationStyle, // Apply custom style
        }); // Display error notification
      }
    }
  };

  const handleUserEmailChange = (e) => {
    setUserEmail(e.target.value);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const checkThresholds = (prices, thresholds) => {
    CRYPTOCURRENCIES.forEach((crypto) => {
      const currentPrice = prices[crypto].usd;
      if (currentPrice >= thresholds[crypto]) {
        toast.success(`${crypto.toUpperCase()} price has reached $${thresholds[crypto]}`);
        sendEmailOnThresholdReach(crypto, currentPrice, thresholds[crypto]);
      }
    });
  };

  const sendEmailOnThresholdChange = (crypto, thresholdAlert) => {
    const emailTemplateParams = {
      to_email: userEmail, // Set to_email to the user's email address
      to_name: userEmail,
      from_email: 'cheunhhoyin@gmail.com', // Set from_email to a valid sender email address
      message: `Alert created successfully! You will receive notifications when ${crypto} reaches $${thresholdAlert.threshold}`,
    };
    
    sendEmail(emailTemplateParams);
  };
  
  const sendEmailOnThresholdReach = (crypto, currentPrice, threshold) => {
    const emailTemplateParams = {
      to_email: userEmail, // Set to_email to the user's email address
      to_name: userEmail,
      from_email: 'cheunhoyin@gmail.com', // Set from_email to a valid sender email address
      crypto,
      currentPrice,
      threshold,
    };
    
    sendEmail(emailTemplateParams);
  };

  const sendEmail = (emailTemplateParams) => {
    emailjs.send('service_lg0xoja', 'template_nn5xv1r', emailTemplateParams)
      .then(() => {
        console.log('Email sent successfully!');
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        // Display error message to the user
      });
  };

  const notificationStyle = {
    background: '#333',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  const notificationCloseButtonStyle = {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
  };
  
  return (
    <ChakraProvider>
      <Box m={5}>
        <Heading as="h1" size="xl">
          Price Alert System
        </Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          {/* Box 1:Create Alert */}
          <GridItem>
            <Box p={4} bg="gray.100" borderRadius="md" boxShadow="md">
              <Heading as="h2" size="lg">
                Create Alert
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Select placeholder="Select Crypto" onChange={(e) => setSelectedCrypto(e.target.value)}>
                    {Object.entries(currentPrices).map(([crypto, { usd }]) => (
                      <option key={crypto} value={crypto}>
                        {crypto.toUpperCase()} - ${usd.toFixed(2)}
                      </option>
                    ))}
                  </Select>
                </GridItem>
                <GridItem>
                  <InputGroup>
                    <InputLeftAddon children="$" />
                    <Input placeholder="Threshold Price" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
                  </InputGroup>
                </GridItem>
              </Grid>
              <Input placeholder="Enter Email" type="email" value={userEmail} onChange={handleUserEmailChange} />
              {emailError && <Text color="red.500">{emailError}</Text>}
              <Button colorScheme="blue" onClick={handleThresholdChange} mt={4}>
                Create Alert
              </Button>
            </Box>
          </GridItem>
          {/* Box 2: Active Alerts */}
          <GridItem>
            <Box p={4} bg="gray.100" borderRadius="md" boxShadow="md">
              <Heading as="h2" size="lg">
                Active Alerts
              </Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Crypto</Th>
                    <Th>Threshold</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activeAlerts.map((alert) => (
                    <Tr key={alert.id}>
                      <Td>{alert.crypto.toUpperCase()}</Td>
                      <Td>${alert.threshold}</Td>
                      <Td>
                        <CloseButton onClick={() => removeAlert(alert)} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </GridItem>
        </Grid>
        <ToastContainer />
      </Box>
    </ChakraProvider>
  );
};

export default Alert;
