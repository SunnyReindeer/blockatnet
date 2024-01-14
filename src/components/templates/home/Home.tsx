import { CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Box,
} from "@chakra-ui/react";  
import CryptoPieChart from './CryptoPieChart';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';

const Home = () => {
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
            <StatLabel>Balance</StatLabel>
            <StatNumber>$123.45</StatNumber>
            <StatHelpText>As of today</StatHelpText>
          </Stat> 
        </Box>

        <Box flex="1" p={5}>
          {/* Main Content - Placeholder or additional content */}
        </Box>

        <Box width="20%" p={5} bg="gray.100">
          {/* Sidebar Content */}
          <Stat>
            <StatLabel>Balance</StatLabel>
            <StatNumber>$123.45</StatNumber>
            <StatHelpText>As of today</StatHelpText>
          </Stat> 
        </Box>

        <Box flex="1" p={5}>
          {/* Main Content - Placeholder or additional content */}
        </Box>

        <Box width="20%" p={5} bg="gray.100">
          {/* Sidebar Content */}
          <Stat>
            <StatLabel>Balance</StatLabel>
            <StatNumber>$123.45</StatNumber>
            <StatHelpText>As of today</StatHelpText>
          </Stat> 
        </Box>

        <Box flex="1" p={5}>
          <CryptoPieChart />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Home;
