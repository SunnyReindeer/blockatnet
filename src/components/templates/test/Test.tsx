import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  useToast,
  FormControl,
  FormLabel,
  Flex,
  useColorModeValue,
  Select,
  GridItem,
  Grid,
  Icon
} from '@chakra-ui/react';
import { FaBitcoin, FaEthereum, FaSun, FaMoon, FaGlobeAmericas, FaGlobeAsia, FaTether } from 'react-icons/fa';

const Test = () => {
  const { data: sessionData } = useSession();
  const toast = useToast();
  const primaryColor = useColorModeValue('teal.500', 'teal.300');
  const secondaryColor = useColorModeValue('gray.700', 'gray.400');
  const [selectedToken, setSelectedToken] = useState('bitcoin');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTheme, setSelectedTheme] = useState('white');
  const widgetContainerRef = useRef(null);

  const handleTokenChange = (event) => {
    setSelectedToken(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value);
  };

  useEffect(() => {
    // 在 React 中動態加載 TokenInsight 評級小部件的 JavaScript 文件
    const script = document.createElement('script');
    script.src = 'https://s2.tokeninsight.com/widgets/tokeninsight-rating-widget/index.js?343243434';
    script.async = true;
    document.body.appendChild(script);

    // 在小部件加載完成後渲染它
    const widget = document.createElement('tokeninsight-rating-widget');
    widget.setAttribute('subject', selectedTheme);
    widget.setAttribute('language', selectedLanguage);
    widget.setAttribute('token', selectedToken);
    widgetContainerRef.current?.appendChild(widget);

    // 清理小部件
    return () => {
      document.body.removeChild(script);
      widgetContainerRef.current?.removeChild(widget);
    };
  }, [selectedToken, selectedLanguage, selectedTheme]);

  return (
    <Grid
      templateColumns="repeat(2, 1fr)"
      gap={6}
      p={8}
      borderRadius="lg"
      maxW="3xl"
      mx="auto"
      bg={useColorModeValue('gray.100', 'gray.800')}
    >
      <GridItem w="100%">
        {/* Input controls here */}
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.700')}
        >
          <FormControl mr={4} mb={4}>
            {/* Token FormControl */}
            <FormLabel color={secondaryColor} display="flex" alignItems="center">
              <Icon as={FaBitcoin} mr={2} color={primaryColor} />
              Token
            </FormLabel>
            <Select
              placeholder="Select token"
              color={primaryColor}
              onChange={handleTokenChange}
              value={selectedToken}
              icon={
                <Icon
                  as={
                    selectedToken === 'bitcoin' ? FaBitcoin :
                    selectedToken === 'ethereum' ? FaEthereum :
                    selectedToken === 'tether' ? FaTether :
                    null
                  }
                  color={primaryColor}
                  mr={2}
                />
              }
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="tether">Tether (USDT)</option>
              <option value="binance-coin">Binance (BNB)</option>
              <option value="solana">Solana (SOL)</option>
              <option value="ripple">Ripple XRP (XRP)</option>
              <option value="usd-coin">USD Coin (USDC)</option>
              <option value="lido-staked-ether">Lido Staked Ether (stETH)</option>
              <option value="cardano">Cardano (ADA)</option>
            </Select>
          </FormControl>
          <FormControl mr={4} mb={4}>
            {/* Language FormControl */}
            <FormLabel color={secondaryColor} display="flex" alignItems="center">
              <Icon as={FaGlobeAmericas} mr={2} color={primaryColor} />
              Language
            </FormLabel>
            <Select
              color={primaryColor}
              onChange={handleLanguageChange}
              value={selectedLanguage}
              icon={
                <Icon
                  as={selectedLanguage === 'en' ? FaGlobeAmericas : FaGlobeAsia}
                  color={primaryColor}
                  mr={2}
                />
              }
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </Select>
          </FormControl>
          <FormControl mr={4} mb={4}>
            {/* Theme FormControl */}
            <FormLabel color={secondaryColor} display="flex" alignItems="center">
              <Icon as={FaSun} mr={2} color={primaryColor} />
              Theme
            </FormLabel>
            <Select
              color={primaryColor}
              onChange={handleThemeChange}
              value={selectedTheme}
              icon={<Icon as={selectedTheme === 'white' ? FaSun : FaMoon} color={primaryColor} mr={2} />}
            >
              <option value="white">Light</option>
              <option value="black">Dark</option>
            </Select>
          </FormControl>
        </Box>
      </GridItem>
      <GridItem w="100%">
        {/* Display Widget Here */}
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.700')}
          height="100%"
          overflowY="auto"
        >
          <div ref={widgetContainerRef} />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default Test;