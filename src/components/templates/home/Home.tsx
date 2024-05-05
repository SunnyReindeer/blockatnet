import React, { useState, useEffect } from 'react';
import moment from 'moment';
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
  Center,
  Grid,
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
  const [bitcoinChange, setBitcoinChange] = useState(null);
  const [ethereumPrice, setEthereumPrice] = useState(null);
  const [ethereumChange, setEthereumChange] = useState(null);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [topTokens, setTopTokens] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);

  
  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjU5ZTQ5YWYyLTkwMTAtNGIwMi1iMTU0LWU5YWFhNTNiMjgyMiIsIm9yZ0lkIjoiMzg0NjA1IiwidXNlcklkIjoiMzk1MTc5IiwidHlwZUlkIjoiMWUzOGMxOWItNTljNi00MWRjLWE2NzAtNTdkOTExZjM2YjQ2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEzNTY0MzUsImV4cCI6NDg2NzExNjQzNX0.-qwxoVBF8ZnqFKYGLua3zkgp8iuLR-3rguHLeytEg8o';
  
  // Calculate New Worth
  const fetchNetWorth = async () => {
    const address = data?.user?.address;
    if (!address) return;

    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/net-worth?exclude_spam=true&exclude_unverified_contracts=true&to_block=17386660`;
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
      const responseBitcoin = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true');
      const dataBitcoin = await responseBitcoin.json();
      const responseEthereum = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true');
      const dataEthereum = await responseEthereum.json();


      setBitcoinPrice(dataBitcoin.bitcoin.usd);
      setBitcoinChange(dataBitcoin.bitcoin.usd_24h_change);
      setEthereumPrice(dataEthereum.ethereum.usd);
      setEthereumChange(dataEthereum.ethereum.usd_24h_change);
      
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
  
  const populateHistoricalData = async () => {
    let historicalData = [];
    for (let i = 11; i >= 0; i--) {
        const date = moment().subtract(i, 'months').startOf('month').unix();
        const url = `https://deep-index.moralis.io/api/v2.2/dateToBlock?chain=eth&date=${date}`;
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
            const data = await response.json();
            const block = data.block;
            historicalData.push({ date: moment.unix(date).format("YYYY-MM-DD"), block });
        } catch (error) {
            console.error("Failed to fetch block number for date:", moment.unix(date).format("YYYY-MM-DD"), error);
        }
    }


    const currentDate = moment().unix();
    const currentUrl = `https://deep-index.moralis.io/api/v2.2/dateToBlock?chain=eth&date=${currentDate}`;
    try {
        const response = await fetch(currentUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'X-API-Key': MORALIS_API_KEY,
            },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const currentData = await response.json();
        const currentBlock = currentData.block;
        historicalData.push({ date: moment().format("YYYY-MM-DD"), block: currentBlock });
    } catch (error) {
        console.error("Failed to fetch block number for today's date:", moment().format("YYYY-MM-DD"), error);
    }

    console.log("Historical data including today:", historicalData);
    return historicalData; 
};



useEffect(() => {
  
    fetchNetWorth().then(() => {
        populateHistoricalData();
    });
}, []); 

const fetchTokenBalancesAndCalculateValue = async () => {
  const address = data?.user?.address; 
  if (!address) {
    console.error("No wallet address found");
    return [];
  }

  const historicalData = await populateHistoricalData(); 
  let totalValuesAtBlocks = [];

  for (const entry of historicalData) {
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=eth&to_block=${entry.block}&exclude_spam=true&exclude_unverified_contracts=true`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY,
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      
      const totalUsdValue = data.result.reduce((acc, token) => acc + parseFloat(token.usd_value || 0), 0);
      totalValuesAtBlocks.push({ date: entry.date, totalUsdValue: totalUsdValue.toFixed(2) }); 
    } catch (error) {
      console.error(`Failed to fetch token balances for block ${entry.block}:`, error);
      totalValuesAtBlocks.push({ date: entry.date, totalUsdValue: "Data not available" });
    }
  }

  console.log("Total USD values at blocks:", totalValuesAtBlocks);
  return totalValuesAtBlocks;
};

useEffect(() => {
  if (data?.user?.address) {
    console.log('Address is available, now fetching data.');
    fetchTokenBalancesAndCalculateValue().then((totalValuesAtBlocks) => {

    });
  } else {
    console.log('Waiting for address to be available...');
  }
}, [data?.user?.address]); 

useEffect(() => {

  const fetchAndSetHistoricalData = async () => {
    const data = await fetchTokenBalancesAndCalculateValue();
    setHistoricalData(data);
  };

  fetchAndSetHistoricalData();
}, []);
  
  
return (
  <Flex direction="column" p={5}>
    <Grid templateColumns="2fr 2fr" gap={6}>
      {/* Left Top: Portfolio Performance Chart */}
      <Box>
        <PortfolioPerformanceChart historicalData={historicalData} />
      </Box>

      {/* Right Top: Bitcoin and Ethereum Boxes and Net Worth displayed horizontally */}
      <HStack spacing={5} align="stretch">
        {[{
          logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
          price: bitcoinPrice,
          change: bitcoinChange,
          label: 'Bitcoin Price',
          sparkline: 'https://s3.coinmarketcap.com/generated/sparklines/web/7d/2781/1.svg'
        }, {
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
          price: ethereumPrice,
          change: ethereumChange,
          label: 'Ethereum Price',
          sparkline: 'https://s3.coinmarketcap.com/generated/sparklines/web/7d/2781/1027.svg'
        }, {
          logo: 'data:image/png;base64,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',
          label: 'Net Worth',
          value: netWorth
        }].map((item, index) => (
          <Box
            key={index}
            p={5}
            shadow="sm"
            borderWidth="1px"
            borderRadius="2xl"
            bg={useColorModeValue('white', 'gray.800')}
            flex={1}
          >
            <VStack>
              {item.logo && <Image src={item.logo} alt={`${item.label} Logo`} boxSize="50px" mr={3} />}
              <Stat>
                <StatLabel fontSize="sm" textAlign="center">{item.label}</StatLabel>
                <StatNumber fontSize="2xl" textAlign="center">{item.price ? `$${item.price}` : `$${item.value ? parseFloat(item.value).toFixed(2) : '...'}`}</StatNumber>
                {item.change && <StatNumber fontSize="2xl" textAlign="center">{parseFloat(item.change).toFixed(2)}%</StatNumber>}
                <StatHelpText textAlign="center">{item.price ? 'As of now' : 'As for now'}</StatHelpText>
                {item.sparkline && (
                  <>
                    <Center>
                      <Icon as={item.change >= 0 ? FiTrendingUp : FiTrendingDown} color={useColorModeValue('green.500', 'red.500')} boxSize="6" />
                    </Center>
                    <Image src={item.sparkline} alt={`${item.label} 7d price graph`} loading="lazy"/>
                    <StatHelpText textAlign="center">Last 7 Days</StatHelpText>
                  </>
                )}
              </Stat>
            </VStack>
          </Box>
        ))}
      </HStack>
    </Grid>

    <Grid templateColumns="3fr 2fr" gap={6} mt={6}>
      {/* Left Bottom: Token List */}
      <Box>
        <Flex direction="column" gap={2}>
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
            <Button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} leftIcon={<ChevronLeftIcon />}>Previous</Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} onClick={() => changePage(i + 1)} isActive={currentPage === i + 1}>{i + 1}</Button>
            ))}
            <Button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} rightIcon={<ChevronRightIcon />}>Next</Button>
          </HStack>
        </Flex>
      </Box>

      {/* Right Bottom: Pie Chart */}
      <Box>
        {tokens.length > 0 && <Pie data={chartData} key="unique-key" />}
      </Box>
    </Grid>
  </Flex>
);
};

export default Home;