import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';

const Test = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState('md');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coinsData, setCoinsData] = useState([]);

  useEffect(() => {
    console.log("useEffect is triggered for fetching data.");
    const fetchData = async () => {
      console.log("Starting data fetch...");
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/coins-list');
        console.log("Response received:123", response.data);
        if (response.data && response.data.length > 0) {
          setCoinsData(response.data.items);
         } else {
           setError('No items found');
           setCoinsData([]);
         }
        setIsLoading(false);
        console.log("Data has been set.");
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = (newSize) => {
    setSize(newSize);
    onOpen();
  };

  return (
    <TableContainer>
      <Table variant='simple'>
        <TableCaption>Coin Data</TableCaption>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Price</Th>
            <Th isNumeric>24H</Th>
          </Tr>
        </Thead>
        <Tbody>
          {coinsData.map((coin) => (
            <Tr key={coin.id}>
              <Td>{coin.id}</Td>
              <Td>{coin.symbol} - {coin.name}</Td>
              <Td>{coin.price}</Td>
              <Td isNumeric>{coin.price_change_percentage_24h}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default Test;