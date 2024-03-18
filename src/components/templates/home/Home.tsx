import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Switch,
  Text,
  VStack,
  HStack,
  useToast,
  Link,
  Image,
  Icon,
  IconButton,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { Pie } from 'react-chartjs-2';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { ExternalLinkIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useEvmWalletTokenBalances } from '@moralisweb3/next';
import { useSession } from 'next-auth/react';
import { useNetwork } from 'wagmi';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
  const { data } = useSession();
  const { chain } = useNetwork();
  const [netWorth, setNetWorth] = useState(null);
  const [tokens, setTokens] = useState([]);
  const toast = useToast();
  const [showGainers, setShowGainers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 5; 
  const [pageTokens, setPageTokens] = useState([]); 
  const [totalPages, setTotalPages] = useState(0);

  const [lastBitcoinPrice, setLastBitcoinPrice] = useState(null);
  const [bitcoinPriceDirection, setBitcoinPriceDirection] = useState(null);

  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [ethereumPrice, setEthereumPrice] = useState(null);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [topTokens, setTopTokens] = useState([]);

  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjUzZTI3YzZjLTE1YTUtNGE0My05NTVlLTYzODg0Nzk0MTNjNyIsIm9yZ0lkIjoiMzgzMzQxIiwidXNlcklkIjoiMzkzODg0IiwidHlwZUlkIjoiNmNkZDQxNGEtNGQ1NC00YTFiLWJjYmUtMTAzZTgwMTM1ZDM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA3MDY4NTQsImV4cCI6NDg2NjQ2Njg1NH0.Jd7LRPGqGDDl3e5OULPEAx9b7vS7xCcddVToICpYgvQ';

  
  // Calculate New Worth
  const fetchNetWorth = async () => {
    const address = data?.user?.address;
    if (!address) return;

    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/net-worth?exclude_spam=true&exclude_unverified_contracts=true`;
    const options = {
      method: 'GET',
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'Accept': 'application/json',
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Net worth data:', data);
      setNetWorth(data.total_networth_usd);
    } catch (error) {
      console.error("Failed to fetch net worth:", error);
    }
  };
  
  const fetchTopTokens = async () => {
    const url = 'https://deep-index.moralis.io/api/v2.2/market-data/erc20s/top-movers';
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY,
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const jsonResponse = await response.json();
      const movers = showGainers ? jsonResponse.gainers : jsonResponse.losers;
      console.log('Top Tokens:', movers);
      setTokens(movers); 
      setTotalPages(Math.ceil(movers.length / tokensPerPage));
      setPageTokens(movers.slice(0, tokensPerPage)); 
    } catch (error) {
      console.error('Error fetching top ERC20 tokens:', error);
    }
  };

  const changePage = (newPage) => {
    console.log(`Trying to change to page ${newPage}, Current page: ${currentPage}`);
  
    if (newPage < 1) {
      console.log("Showing first page toast");
      toast({
        title: "First Page",
        description: "You are already at the first page.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      return;
    } else if (newPage > totalPages) {
      console.log("Showing last page toast");
      toast({
        title: "Last Page",
        description: "You are already at the last page.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    setCurrentPage(newPage);
  };
  

  const fetchPrices = async () => {
    try {
      const responseBitcoin = await fetch('https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true');
      const dataBitcoin = await responseBitcoin.json();
      const responseEthereum = await fetch('https://pro-api.coingecko.com/api/v3/simple/price?ids=ethereum&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true');
      const dataEthereum = await responseEthereum.json();


      setBitcoinPrice(dataBitcoin.bitcoin.usd);
      setEthereumPrice(dataEthereum.ethereum.usd);
      console.log('dataBitcoin:', dataBitcoin)
      console.log('dataEthereum:', dataEthereum)
    } catch (error) {
      console.error('Error fetching cryptocurrency prices:', error);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchNetWorth();
    fetchTopTokens();
    const intervalId = setInterval(fetchPrices, 180000); // Fetch prices every 180 seconds


    return () => clearInterval(intervalId);
  }, [data?.user?.address, chain?.id, showGainers]);;

  // Pagination Logic
  useEffect(() => {
    const indexOfLastToken = currentPage * tokensPerPage;
    const indexOfFirstToken = indexOfLastToken - tokensPerPage;
    setPageTokens(tokens.slice(indexOfFirstToken, indexOfLastToken));
  }, [currentPage, tokens]);

  useEffect(() => {
    const fetchTokenBalancesAndPrices = async () => {
      const address = data?.user?.address; 
      if (!address) return;
      const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=eth&exclude_spam=true&exclude_unverified_contracts=true`;
  
      try {
        const response = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'X-API-Key': MORALIS_API_KEY,
          },
        });
  
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTokenBalances(data.result); 
        console.log('Token balance:', data);
      } catch (error) {
        console.error("Failed to fetch token balances and prices:", error);
        toast({
          title: "An error occurred",
          description: "Unable to fetch token balances and prices.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    };
  
    if(data?.user?.address) {
      fetchTokenBalancesAndPrices();
    }
  }, [data?.user?.address, MORALIS_API_KEY]); 

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  });
  
  useEffect(() => {
    if(tokenBalances.length > 0) {
      const labels = tokenBalances.map(token => token.name || token.symbol);
      const data = tokenBalances.map(token => parseFloat(token.usd_value || 0)); 
      const backgroundColors = tokenBalances.map((_, index) => `hsl(${index / tokenBalances.length * 360}, 70%, 70%)`); 
  
      setChartData({
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: backgroundColors
        }]
      });
    }
  }, [tokenBalances]);
  
  
  
  
  return (
    <Flex direction="column" p={5}>


      <VStack spacing={8}>
      <HStack spacing={8} w="full" alignItems="stretch">

      <Box
      p={5}
      shadow="sm"
      borderWidth="1px"
      borderRadius="2xl"
      w="full"
      bg={useColorModeValue('white', 'gray.800')}
      >
       <VStack>
        
       <Image src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="Bitcoin Logo" boxSize="50px" mr={3} />
          <Stat>
            
            <StatLabel fontSize="sm" textAlign="center">Bitcoin Price</StatLabel>
            <StatNumber fontSize="2xl" textAlign="center">${bitcoinPrice}</StatNumber>
            <StatHelpText textAlign="center">As of now</StatHelpText>
         </Stat>
         <Icon as={bitcoinPriceDirection === 'up' ? FiTrendingUp : FiTrendingDown} color={useColorModeValue('green.500', 'red.500')} boxSize="6" />  
         <Image src="https://s3.coinmarketcap.com/generated/sparklines/web/7d/2781/1.svg" alt="bitcoin-7d-price-graph" class="sc-14cb040a-0 dmOeak" loading="lazy"/>
        </VStack>
      
    </Box>
      <Box
        p={5}
        shadow="sm"
        borderWidth="1px"
        borderRadius="2xl"
        w="full"
        bg={useColorModeValue('white', 'gray.800')}
      >
        <VStack>
        <Image src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="Ethereum Logo" boxSize="50px" mr={3} />
          <Stat>
            <StatLabel fontSize="sm" textAlign="center">Ethereum Price</StatLabel>
            <StatNumber fontSize="2xl" textAlign="center">${ethereumPrice}</StatNumber>
            <StatHelpText textAlign="center">As of now</StatHelpText>
          </Stat>
          <Icon as={bitcoinPriceDirection === 'up' ? FiTrendingUp : FiTrendingDown} color={useColorModeValue('green.500', 'red.500')} boxSize="6" />  
          <Image src="https://s3.coinmarketcap.com/generated/sparklines/web/7d/2781/1027.svg" alt="ethereum-7d-price-graph" class="sc-14cb040a-0 dmOeak" loading="lazy"/>
        </VStack>
    </Box>
      <Box
       p={5}
       shadow="sm"
       borderWidth="1px"
       borderRadius="2xl"
       w="full"
       bg={useColorModeValue('white', 'gray.800')}
      >
      <Stat>
        <StatLabel textAlign="center">Net Worth</StatLabel>
        <StatNumber textAlign="center">${netWorth ? parseFloat(netWorth).toFixed(2) : '...'}</StatNumber>
        <StatHelpText textAlign="center">As for now</StatHelpText>
        <Box w="full" maxW="300px" mx="auto" p={5}>
      {tokens.length > 0 && <Pie data={chartData} key="unique-key" />}
</Box>
      </Stat>
    </Box>

    </HStack>


        <Box w="full">
          <Flex justifyContent="space-between" mb={4}>
            <Text fontWeight="bold">{showGainers ? 'Top Gainers' : 'Top Losers'}</Text>
            <Switch isChecked={showGainers} onChange={() => setShowGainers(!showGainers)} />
          </Flex>
          {pageTokens.map((token, index) => (
            <Flex key={index} bg={hoverTrColor} p={4} mb={2} borderRadius="lg" align="center">
              <Image src={token.token_logo} alt={`${token.token_name} Logo`} boxSize="30px" mr={4}/>
              <Box flex="1">
                <Text fontWeight="bold">{token.token_name} ({token.token_symbol})</Text>
                <Text>Price: ${parseFloat(token.price_usd).toFixed(2)} - 24h Change: {parseFloat(token.price_24h_percent_change).toFixed(2)}%</Text>
              </Box>
              <Link href={`https://www.coingecko.com/en/coins/${token.contract_address}`} isExternal>
                <ExternalLinkIcon />
              </Link>
            </Flex>
          ))}
          <HStack justifyContent="center" mt={4}>
          <Button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} leftIcon={<ChevronLeftIcon />}>
  Previous
</Button>
{Array.from({ length: totalPages }, (_, i) => (
  <Button key={i} onClick={() => changePage(i + 1)} isActive={currentPage === i + 1}>
    {i + 1}
  </Button>
))}
<Button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} rightIcon={<ChevronRightIcon />}>
  Next
</Button>
          </HStack>
        </Box>
        
      </VStack>
    </Flex>
  );
};

export default Home;