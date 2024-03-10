import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Box,
} from "@chakra-ui/react";
import { useColorModeValue, Button, ButtonGroup } from '@chakra-ui/react';
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
  const [tokens, setTokens] = useState({ gainers: [], losers: [] });
  const [showGainers, setShowGainers] = useState(true);
  const { data: tokenBalances } = useEvmWalletTokenBalances({
    address: data?.user?.address,
    chain: chain?.id,
  });
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [ethereumPrice, setEthereumPrice] = useState(null);
  useEffect(() => console.log('tokenBalances: ', tokenBalances), [tokenBalances]);

  // Use chartLabels instead of tokenSymbols
  const chartLabels = tokenBalances?.map(token => token.token.symbol || 'Unknown Token');
  const chartData = tokenBalances?.map(token => parseFloat(token.value));

  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjgxZGRhMTUyLTJjNjItNDM3MS1hMWYxLThiNjBkNmFmOGY0NCIsIm9yZ0lkIjoiMzY1MzUyIiwidXNlcklkIjoiMzc1NDg4IiwidHlwZUlkIjoiNDVhYTUzYTItMTZiYy00ZTUyLThhYzQtN2Y1MDMxZDU2NDE4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDA2MzE1MTAsImV4cCI6NDg1NjM5MTUxMH0.CZoF2bzrUxc5Lz1EynGjFPnG5Cxy2MXj4MSpFr6RAlQ';

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
      const data = await response.json();
      console.log("Fetched top tokens by price change:", data);
      setTokens({ gainers: data.gainers, losers: data.losers });
    } catch (error) {
      console.error('Error fetching top tokens by price change:', error);
    }
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
  }, [data?.user?.address, chain?.id]);;



  return (
    <Flex direction="column">
      {/*Portfolio Performance Chart */}
      <Box flex="1" p={5}>
        <PortfolioPerformanceChart />
      </Box>

      {/* Other Content */}
      <Flex wrap="wrap" >
        <Box width="30%" p={5} bg="gray.100">
          {/* Sidebar Content */}
          <Stat>
            <StatLabel>Bitcoin Price</StatLabel>
            <StatNumber>${bitcoinPrice}</StatNumber>
            <StatHelpText>As of now</StatHelpText>
          </Stat>

        </Box>

        <Box flex="1" p={5}>
          {/* Main Content - Placeholder or additional content */}
        </Box>

        <Box width="30%" p={5} bg="gray.100">
          {/* Sidebar Content */}
          <Stat>
            <StatLabel>Ethereum Price</StatLabel>
            <StatNumber>${ethereumPrice}</StatNumber>
            <StatHelpText>As of now</StatHelpText>
          </Stat>
        </Box>

        <Box flex="1" p={5}>
          {/* Main Content - Placeholder or additional content */}
        </Box>

        <Box width="30%" p={5} bg="gray.100">
          {/* Sidebar Content */}
          <Stat>
            <StatLabel>Net Worth</StatLabel>
            <StatNumber>${netWorth ? parseFloat(netWorth).toFixed(2) : '...'}</StatNumber>
            <StatHelpText>As for now</StatHelpText>
          </Stat>
        </Box>
        <Flex direction="row" wrap="wrap" width="100%">
          <Box flex="1" p={5}>
            <CryptoPieChart labels={chartLabels} balances={chartData} />
          </Box>
          <Box flex="1" p={5}>
            <ButtonGroup gap='4'>
              <Button onClick={() => setShowGainers(true)}>Show Gainers</Button>
              <Button onClick={() => setShowGainers(false)}>Show Losers</Button>
              </ButtonGroup>
            <Stat>
              <StatLabel>{showGainers ? 'Top Gainers' : 'Top Losers'}</StatLabel>
              <StatHelpText>
                <ul>
                  {(showGainers ? tokens.gainers : tokens.losers).map((token, index) => (
                    <li key={index}>
                      {token.token_name} ({token.token_symbol}): ${parseFloat(token.price_usd).toFixed(2)} - 24h Change: {parseFloat(token.price_24h_percent_change).toFixed(2)}%
                    </li>
                  ))}
                </ul>
              </StatHelpText>

            </Stat>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;
