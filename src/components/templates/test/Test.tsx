import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, Image, Flex,
  Button, List, ListItem, ListIcon, Divider, Heading, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText,
  Icon, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react';
import { MdCheckCircle, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import axios from 'axios';

const Test = () => {
  const [coinsData, setCoinsData] = useState([]);
  const [coinDetails, setCoinDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const widgetRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    axios.get('/api/coins-list')
      .then(response => {
        if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
          setCoinsData(response.data.data.items);
        } else {
          setError('Data format is incorrect, no items array found.');
        }
        setIsLoading(false);
      })
      .catch(error => {
        setError(error.toString());
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedCoinId) {
      axios.get(`/api/Coin-history?id=${selectedCoinId}`)
        .then(response => {
          console.log("API response for coin history:", response.data);
          if (response.data && response.data.data) {
            setCoinDetails(response.data.data.market_chart);
          } else {
            throw new Error('Failed to fetch coin details');
          }
        })
        .catch(error => {
          console.error('Error fetching coin details:', error);
          setError('Failed to fetch coin details');
        });
        loadWidget();
    }
  }, [selectedCoinId]);

  const loadWidget = () => {
    const script = document.createElement('script');
    script.src = "https://s2.tokeninsight.com/widgets/tokeninsight-rating-widget/index.js";
    script.async = true;
    script.onload = () => {
      if (widgetRef.current) {
        widgetRef.current.innerHTML = ''; // Clear previous content
        const widget = document.createElement('tokeninsight-rating-widget');
        widget.setAttribute('subject', 'black');
        widget.setAttribute('language', 'en');
        widget.setAttribute('token', selectedCoinId);
        widgetRef.current.appendChild(widget);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  };

  const handleRowClick = (coinId) => {
    setSelectedCoinId(coinId);
  };

  const handlePrevHistory = () => {
    setCurrentHistoryIndex(Math.max(currentHistoryIndex - 1, 0));
  };

  const handleNextHistory = () => {
    setCurrentHistoryIndex(Math.min(currentHistoryIndex + 1, coinDetails.length - 1));
  };

  const sortedData = coinsData; // Placeholder for sorting logic if needed

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <Box p={8}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <Flex h="100vh" direction="column">
          {/* Coins List */}
          <Box>
            <TableContainer>
              <Table variant="striped" colorScheme="teal" size="md">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Name</Th>
                    <Th>Price</Th>
                    <Th isNumeric>Change (24H)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentItems.map((coin, index) => (
                    <Tr key={index} onClick={() => handleRowClick(coin.id)} cursor="pointer" _hover={{ bg: 'gray.100' }}>
                      <Td>{coin.id}</Td>
                      <Td>
                        <Flex align="center">
                          <Image src={coin.logo} boxSize="30px" mr="12px" alt={`${coin.name} logo`} />
                          {coin.name} ({coin.symbol})
                        </Flex>
                      </Td>
                      <Td>${coin.price.toFixed(2)}</Td>
                      <Td isNumeric>
                        <Box
                          px={3}
                          py={1}
                          borderRadius="md"
                          bg={coin.price_change_percentage_24h > 0 ? 'green.500' : 'red.500'}
                          color="white"
                          display="inline-block"
                        >
                          {(coin.price_change_percentage_24h * 100).toFixed(2)}%
                        </Box>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Flex justify="space-between" mt={8}>
              <Button onClick={prevPage} disabled={currentPage === 0} colorScheme="teal">
                Previous
              </Button>
              <Button onClick={nextPage} disabled={indexOfLastItem >= sortedData.length} colorScheme="teal">
                Next
              </Button>
            </Flex>
          </Box>
  
          {/* Widget and History */}
          <Flex flex="1" mt={8}>
            {/* Widget */}
            <Box flex="1" mr={8}>
              <Box ref={widgetRef} />
            </Box>
  
            {/* History */}
            <Box flex="1">
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Coin Details</Heading>
                <Flex>
                  <Button onClick={() => setHistoryPage(historyPage - 1)} disabled={historyPage === 0} colorScheme="teal" mr={4}>
                    Previous
                  </Button>
                  <Button onClick={() => setHistoryPage(historyPage + 1)} disabled={(historyPage + 1) * 10 >= coinDetails.length} colorScheme="teal">
                    Next
                  </Button>
                </Flex>
              </Flex>
              <Accordion defaultIndex={[0]} allowMultiple>
                {coinDetails.slice(historyPage * 10, (historyPage + 1) * 10).map((item, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontSize="sm" fontWeight="bold">Timestamp</Text>
                          <Text>{new Date(item.timestamp).toLocaleString()}</Text>
                        </Box>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">Market Cap</Text>
                          <Text>${item.market_cap.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">Price</Text>
                          <Text>${item.price.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">Volume (24H)</Text>
                          <Text>{item.vol_spot_24h.toFixed(2)}</Text>
                        </Box>
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default Test;