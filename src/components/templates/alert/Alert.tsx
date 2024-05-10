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
  Td,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import Web3 from 'web3';
import axios from 'axios';
import detectEthereumProvider from '@metamask/detect-provider';
import emailjs from '@emailjs/browser';
import app from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { toast, ToastContainer } from 'react-toastify';
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
  direction: 'above' | 'below';
  walletAddress: string;
  id: string;
}

const CRYPTOCURRENCIES = [
  'bitcoin',
  'ethereum',
  'litecoin',
  'bitcoin-cash',
  'cardano',
  'tellar',
  'eos',
  'onero',
  'ripple',
  'tether',
  'binance-coin',
  'neo',
  'dash',
  'iota',
  'tron',
  'echain',
  'ethereum-classic',
  'qtum',
  'omisego',
  'augur',
  'golem',
  'tatus',
  'digixdao',
];
emailjs.init('wkbzNWH_xzboxGoGT');

const Alert = () => {
  const [web3, setWeb3] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [prices, setPrices] = useState<PriceData>({});
  const [currentPrices, setCurrentPrices] = useState<PriceData>({});
  const [thresholds, setThresholds] = useState<ThresholdData>({});
  const [userEmail, setUserEmail] = useState('');
  const [activeAlerts, setActiveAlerts] = useState<AlertData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,bitcoin-cash,cardano,tellar,eos,onero,ripple,tether,binance-coin,neo,dash,iota,tron,echain,ethereum-classic,qtum,omisego,augur,golem,tatus,digixdao&vs_currencies=usd');
        setPrices(response.data);
        setCurrentPrices(response.data);
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

  const createAlert = (crypto, threshold, direction, walletAddress) => {
    const newThresholdAlert = { crypto, threshold, direction, walletAddress, id: uuidv4(), triggered: false };
    alertsRef.child(walletAddress).push(newThresholdAlert).then((snapshot) => {
      const newAlert = { ...newThresholdAlert, key: snapshot.key };
      setActiveAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    });
  };

  useEffect(() => {
    const unsubscribe = alertsRef.on('value', (snapshot) => {
      if (snapshot && snapshot.exists()) {
        const alerts = [];
        snapshot.forEach((childSnapshot) => {
          const alert = childSnapshot.val();
          if (alert.walletAddress === userAccount) {
            alerts.push({...alert, key: childSnapshot.key });
          }
        });
        setActiveAlerts(alerts);
      } else {
        setActiveAlerts([]);
      }
    });

    // If the userAccount state is null, retrieve the user's wallet address from the cookie
    if (userAccount === null) {
      const userAccount = getCookie('userAccount');
      if (userAccount) {
        setUserAccount(userAccount);
      }
    }

    return () => unsubscribe();
  }, [userAccount, web3]); // Add web3 to the dependency array

  // Helper function to retrieve the user's wallet address from the cookie
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const removeAlert = (alertToRemove) => {
    alertsRef.child(userAccount).child(alertToRemove.key).remove();
    setActiveAlerts(activeAlerts.filter((alert) => alert.id !== alertToRemove.id));
  };

  const handleThresholdChange = async () => {
    if (selectedCrypto && threshold && isValidEmail(userEmail) && web3 && userAccount) {
      if (activeAlerts.length < 3) {
        setThresholds((prevThresholds) => ({...prevThresholds, [selectedCrypto]: parseFloat(threshold) }));

        const newThresholdAlert: AlertData = { crypto: selectedCrypto, threshold: parseFloat(threshold), direction, walletAddress: userAccount };
        createAlert(selectedCrypto, parseFloat(threshold), direction, userAccount);
        sendEmailOnThresholdChange(selectedCrypto, newThresholdAlert);
        setAlertCount(activeAlerts.length + 1);
        toast.success(`Alert created successfully! You will receive notifications when ${selectedCrypto.toUpperCase()} ${direction === 'above' ? 'goes above' : 'goes below'} $${threshold}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: notificationStyle,
        });
      } else {
        toast.error('You have already created 3 alerts. Please remove some alerts to create new ones.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: notificationStyle,
        });
      }
    }};

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
      if (currentPrice >= thresholds[crypto] && thresholds[crypto] !== undefined && direction === 'above') {
        const alertToRemove =activeAlerts.find((alert) => alert.crypto === crypto && alert.threshold === thresholds[crypto]);
        if (alertToRemove) {
          removeAlertFromFirebase(alertToRemove);
          setActiveAlerts(activeAlerts.filter((alert) => alert.id !== alertToRemove.id));
          sendEmailOnThresholdReach(crypto, currentPrice, thresholds[crypto], 'above');
          toast.success(`${crypto.toUpperCase()} price has reached $${thresholds[crypto]} above the threshold.`, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: notificationStyle,
          });
        }
      } else if (currentPrice <= thresholds[crypto] && thresholds[crypto] !== undefined && direction === 'below') {
        const alertToRemove = activeAlerts.find((alert) => alert.crypto === crypto && alert.threshold === thresholds[crypto]);
        if (alertToRemove) {
          removeAlertFromFirebase(alertToRemove);
          setActiveAlerts(activeAlerts.filter((alert) => alert.id !== alertToRemove.id));
          sendEmailOnThresholdReach(crypto, currentPrice, thresholds[crypto], 'below');
          toast.success(`${crypto.toUpperCase()} price has reached $${thresholds[crypto]} below the threshold.`, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: notificationStyle,
          });
        }
      }
    });
  };

  const removeAlertFromFirebase = (alert) => {
    alertsRef.child(userAccount).child(alert.key).remove();
  };

  const sendEmailOnThresholdChange = (crypto, thresholdAlert) => {
    const emailTemplateParams = {
      to_email: userEmail,
      to_name: userEmail,
      from_email: 'cheunhhoyin@gmail.com',
      message: `Alert created successfully! You will receive notifications when ${crypto} reaches $${thresholdAlert.threshold} ${thresholdAlert.direction === 'above' ? 'above' : 'below'} the threshold.`,
    };

    sendEmail(emailTemplateParams);
  };

  const sendEmailOnThresholdReach = (crypto, currentPrice, threshold, direction) => {
    const emailTemplateParams = {
      to_email: userEmail,
      to_name: userEmail,
      from_email: 'cheunhhoyin@gmail.com',
      message: `Price of ${crypto} has reached ${direction} the threshold of $${threshold}. Current price is $${currentPrice}.`,
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

  const notificationStyle = {fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#333',
    padding: '10px 20px',
    borderRadius: '5px',
    marginBottom: '10px',
  };

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      if (userAccount) {
        const alertsRef = database.ref('activeAlerts').child(userAccount);
        alertsRef.on('value', (snapshot) => {
          if (snapshot && snapshot.exists()) {
            const alerts = [];
            snapshot.forEach((childSnapshot) => {
              const alert = childSnapshot.val();
              alerts.push({ ...alert, key: childSnapshot.key });
            });
            setActiveAlerts(alerts);
          } else {
            setActiveAlerts([]);
          }
        });
      }
    };

    // Fetch active alerts when wallet is connected
    fetchActiveAlerts();

    // Also fetch active alerts when user account changes
    if (userAccount) {
      fetchActiveAlerts();
    }
  }, [userAccount]);

  const handleWalletConnect = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3 = new Web3(provider);
        const accounts = await web3.eth.requestAccounts();
        const userAccount = accounts[0];

        // Store the user's wallet address in local storage
        localStorage.setItem('userAccount', userAccount);

        setWeb3(web3);
        setUserAccount(userAccount);
      } else {
        throw new Error('Please install MetaMask to use this dApp.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to blockchain');
    }
  };

  return (
    <ChakraProvider>
      <Box p={4}>
        <Heading as="h1" size="xl" mb={4}>
          Crypto Alert System
        </Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <Flex direction="column">
              <Heading as="h3" size="md" mb={2}>
                Select Cryptocurrency
              </Heading>
              <Select
                placeholder="Select a cryptocurrency"
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
              >
                {Object.entries(currentPrices).map(([crypto, price]) => (
                  <option key={crypto} value={crypto}>
                    {crypto} - ${price.usd}
                  </option>
                ))}
              </Select>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex direction="column">
              <Heading as="h3" size="md" mb={2}>
                Set Threshold
              </Heading>
              <Input
                type="number"
                placeholder="Enter threshold"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </Flex>
          </GridItem>
          <GridItem>
            <Flex direction="column">
              <Heading as="h3" size="md"mb={2}>
                Price Direction
              </Heading>
              <RadioGroup value={direction} onChange={setDirection}>
                <Radio value="above">Above</Radio>
                <Radio value="below">Below</Radio>
              </RadioGroup>
            </Flex>
          </GridItem>
          <GridItem>
            <Flex direction="column">
              <Heading as="h3" size="md" mb={2}>
                Enter Email
              </Heading>
              <Input
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={handleUserEmailChange}
              />
              {emailError && <Text color="red.500">{emailError}</Text>}
            </Flex>
          </GridItem>
        </Grid>
        <Button
          mt={4}
          colorScheme="teal"
          isDisabled={!selectedCrypto || !threshold || !userEmail || !web3 || !userAccount}
          onClick={handleThresholdChange}
        >
          Create Alert
        </Button>
        <Heading as="h2" size="lg" mt={6}>
          Active Alerts
        </Heading>
        <Table variant="simple" mt={4}>
          <Thead>
            <Tr>
              <Th>Crypto</Th>
              <Th>Threshold</Th>
              <Th>Direction</Th>
              <Th>Remove</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activeAlerts.map((alert)=> (
              <Tr key={alert.id}>
                <Td>{alert.crypto}</Td>
                <Td>${alert.threshold}</Td>
                <Td>{alert.direction === 'above' ? 'Above' : 'Below'}</Td>
                <Td>
                  <CloseButton onClick={() => removeAlert(alert)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <ToastContainer />
    </ChakraProvider>
  );
};

export default Alert;