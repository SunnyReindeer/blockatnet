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

} from '@chakra-ui/react';
import { FaBitcoin, FaEthereum, FaSun, FaMoon, FaGlobeAmericas, FaGlobeAsia } from 'react-icons/fa';
const Alert = () => {
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
    templateColumns="repeat(2, 1fr)" // Two columns with equal width
    gap={6} // Adjust the gap as needed
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

<FormLabel color={useColorModeValue('gray.600', 'gray.400')} display="flex" alignItems="center">
<FaBitcoin style={{ marginRight: '0.5rem' }} />
Token
</FormLabel>
<Select
placeholder="Select token"
color={useColorModeValue('gray.800', 'gray.200')}
onChange={handleTokenChange}
value={selectedToken}
icon={selectedToken === 'bitcoin' ? <FaBitcoin /> : selectedToken === 'ethereum' ? <FaEthereum /> : null}
>
<option value="bitcoin">Bitcoin (BTC)</option>
<option value="ethereum">Ethereum (ETH)</option>
<option value="tether">Tether (USDT)</option>
<option value="binance-coin">binance (BNB)</option>
<option value="solana">Solana (SOL)</option>
<option value="ripple">Ripple XRP (XRP)</option>
<option value="usd-coin">USD Coin (USDC)</option>
<option value="lido-staked-ether">Lido Staked Ether (stETH)</option>
<option value="cardano">Cardano (ADA)</option>
</Select>


        </FormControl>
        <FormControl mr={4} mb={4}>
          {/* Language FormControl */}

<FormLabel color={useColorModeValue('gray.600', 'gray.400')} display="flex" alignItems="center">
<FaGlobeAmericas style={{ marginRight: '0.5rem' }} />
Language
</FormLabel>
<Select
color={useColorModeValue('gray.800', 'gray.200')}
onChange={handleLanguageChange}
value={selectedLanguage}
icon={selectedLanguage === 'en' ? <FaGlobeAmericas /> : <FaGlobeAsia />}
>
<option value="en">English</option>
<option value="zh">中文</option>
</Select>

        </FormControl>
        <FormControl mr={4} mb={4}>
          {/* Theme FormControl */}

<FormLabel color={useColorModeValue('gray.600', 'gray.400')} display="flex" alignItems="center">
<FaSun style={{ marginRight: '0.5rem' }} />
Theme
</FormLabel>
<Select
color={useColorModeValue('gray.800', 'gray.200')}
onChange={handleThemeChange}
value={selectedTheme}
icon={selectedTheme === 'white' ? <FaSun /> : <FaMoon />}
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
        height="100%" // Make sure both columns are the same height
        overflowY="auto" // Add scroll to the display box if content exceeds the height
      >
        <div ref={widgetContainerRef} />
      </Box>
    </GridItem>
  </Grid>
  
);

};

export default Alert;