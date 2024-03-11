import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Box,
  useColorModeValue,
  Button,
  Switch,
  Text,
  useToast,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useEvmWalletTokenBalances } from '@moralisweb3/next';
import { useSession } from 'next-auth/react';
import { useNetwork } from 'wagmi';
import CryptoPieChart from './CryptoPieChart';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';



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

  const { data: tokenBalances } = useEvmWalletTokenBalances({
    address: data?.user?.address,
    chain: chain?.id,
  });
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [ethereumPrice, setEthereumPrice] = useState(null);
  useEffect(() => console.log('tokenBalances: ', tokenBalances), [tokenBalances]);

  // chartLabels
  const chartLabels = tokenBalances?.map(token => token.token.symbol || 'Unknown Token');
  const chartData = tokenBalances?.map(token => parseFloat(token.value));

  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQ3ZDY2NWQzLTIyNDYtNDQ3Ni1iYmE2LTdkOWViZmI5OTkzYyIsIm9yZ0lkIjoiMzY0ODg4IiwidXNlcklkIjoiMzc1MDEwIiwidHlwZUlkIjoiMDNmYTExNTMtZmYzOC00ZjU3LTg4YTItMTk4MGVlMWQwZWUzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDAzMTUzMTAsImV4cCI6NDg1NjA3NTMxMH0.6heL_EFvR_PN7kN0lsL9g1kTzpK12q0rxpAn0JZuG_8';

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
      setTokens(movers); 
      setTotalPages(Math.ceil(movers.length / tokensPerPage));
      setPageTokens(movers.slice(0, tokensPerPage)); 
    } catch (error) {
      console.error('Error fetching top ERC20 tokens:', error);
    }
  };

  const changePage = (newPage) => {
    if (newPage < 1) {
      toast({
        title: "First Page",
        description: "You are already at the first page.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return; 
    } else if (newPage > totalPages) {
      toast({
        title: "Last Page",
        description: "You are already at the last page.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return; 
    }

    setCurrentPage(newPage);
  };

  const fetchPrices = async () => {
    try {
      const responseBitcoin = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const dataBitcoin = await responseBitcoin.json();
      const responseEthereum = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const dataEthereum = await responseEthereum.json();

      setBitcoinPrice(dataBitcoin.bitcoin.usd);
      setEthereumPrice(dataEthereum.ethereum.usd);
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


  return (
    <Flex direction="column">
      <Flex wrap="wrap" >
        <Box width="50%" p={5} >

          <Stat>
            <StatLabel>Bitcoin Price</StatLabel>
            <StatNumber>${bitcoinPrice}</StatNumber>
            <StatHelpText>As of now</StatHelpText>
            <br></br>
            <StatLabel>Ethereum Price</StatLabel>
            <StatNumber>${ethereumPrice}</StatNumber>
            <StatHelpText>As of now</StatHelpText>
          </Stat>

        </Box>



        <Box width="50%" p={5} >

          <Stat>
            <StatLabel>Net Worth</StatLabel>
            <StatNumber>${netWorth ? parseFloat(netWorth).toFixed(2) : '...'}</StatNumber>
            <StatHelpText>As for now</StatHelpText>
          </Stat>

        </Box>
        <Flex direction="row" wrap="wrap" width="100%">

          <Box flex="1" p={5}>


            {/* Toggle and Token Display Logic */}

            <Text>{showGainers ? 'Showing Top Gainers' : 'Showing Top Losers'}</Text>      <Switch isChecked={showGainers} onChange={() => setShowGainers(!showGainers)} />

            <Stat>
              <StatLabel>{showGainers ? 'Top Gainers' : 'Top Losers'}</StatLabel>
              <StatHelpText>
                <ul>
                  {pageTokens.map((token, index) => ( // Use pageTokens here instead of currentTokens
                    <li key={index}>
                      <img src={token.token_logo} alt={`${token.token_name} Logo`} style={{ width: '20px', height: '20px', marginRight: '10px' }}/>
                       {token.token_name} ({token.token_symbol}): ${parseFloat(token.price_usd).toFixed(2)} - 24h Change: {parseFloat(token.price_24h_percent_change).toFixed(2)}% <Link href={`https://www.coingecko.com/en/coins/${token?.contract_address}`} isExternal><ExternalLinkIcon mx='2px' /> </Link>
                    </li>
                    
                  ))}
                </ul>
                
              </StatHelpText>

            </Stat>
            {/* Pagination Controls */}
            <Flex justifyContent="space-between" m={4}>
              <Button onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1}>
                Previous
              </Button>

              {/* Dynamically generate page buttons */}
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} onClick={() => changePage(i + 1)} isActive={currentPage === i + 1}>
                  {i + 1}
                </Button>
              ))}

              <Button onClick={() => changePage(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next1
              </Button>
              
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;
