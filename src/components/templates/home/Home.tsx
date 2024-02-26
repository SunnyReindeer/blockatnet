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
import { useColorModeValue } from '@chakra-ui/react';
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

 // Calculate New Worth
 const fetchNetWorth = async () => {
  const address = data?.user?.address;
  const chainId = chain?.id || 'eth'; // Default to Ethereum if chain ID is not available
  if (!address) return;

  try {
    const response = await fetch(`https://deep-index.moralis.io/api/v2/${address}/balance?chain=${chainId}&to_block=latest`, {
      headers: {
        'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjgxZGRhMTUyLTJjNjItNDM3MS1hMWYxLThiNjBkNmFmOGY0NCIsIm9yZ0lkIjoiMzY1MzUyIiwidXNlcklkIjoiMzc1NDg4IiwidHlwZUlkIjoiNDVhYTUzYTItMTZiYy00ZTUyLThhYzQtN2Y1MDMxZDU2NDE4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDA2MzE1MTAsImV4cCI6NDg1NjM5MTUxMH0.CZoF2bzrUxc5Lz1EynGjFPnG5Cxy2MXj4MSpFr6RAlQ',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setNetWorth(data.balance); // Update your state variable accordingly
  } catch (error) {
    console.error("Failed to fetch net worth:", error);
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
    const intervalId = setInterval(fetchPrices, 60000); // Fetch prices every 60 seconds

    return () => clearInterval(intervalId); 
  },  [data?.user?.address, chain?.id]);; 

  

  return (
    <Flex direction="column">
      {/*Portfolio Performance Chart */}
      <Box flex="1" p={5}>
        <PortfolioPerformanceChart />
      </Box>

      {/* Other Content */}
      <Flex>
        <Box width="20%" p={5} bg="gray.100">
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

        <Box width="20%" p={5} bg="gray.100">
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

        <Box width="20%" p={5} bg="gray.100">
          {/* Sidebar Content */}
          <Stat>
            <StatLabel>Net Worth</StatLabel>
            <StatNumber>${netWorth ? (netWorth / 1e18).toFixed(2) : 'Loading...'}</StatNumber>
            <StatHelpText>...</StatHelpText>
          </Stat> 
        </Box>
    
        <Box flex="1" p={5}>
          <CryptoPieChart labels={chartLabels} balances={chartData} />
        </Box>

      </Flex>
    </Flex>
  );
};

export default Home;
