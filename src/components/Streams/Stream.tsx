import { CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Box,
} from "@chakra-ui/react";  
import {
  useColorModeValue,
} from '@chakra-ui/react';
import { useEvmWalletTokenBalances } from '@moralisweb3/next';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { useNetwork } from 'wagmi';
import CryptoPieChart from '../templates/home/CryptoPieChart';
import PortfolioPerformanceChart from '../templates/home/PortfolioPerformanceChart';

const Home = () => {
  const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
  const { data } = useSession();
  const { chain } = useNetwork();
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

  fetchPrices();


  return (
    <Flex direction="column">
      {/* First Row: Portfolio Performance Chart */}
      <Box flex="1" p={5}>
        <PortfolioPerformanceChart />
      </Box>

      {/* Second Row: Other Content */}
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
            <StatLabel>Balance</StatLabel>
            <StatNumber>$</StatNumber>
            <StatHelpText>NYaaaa</StatHelpText>
          </Stat> 
        </Box>

        <Box flex="1" p={5}>
          <CryptoPieChart labels={chartLabels} balances={chartData} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Stream;
