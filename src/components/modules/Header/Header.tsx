import React, { useState, useEffect } from 'react';
import {
  Box, Container, Flex, HStack, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Button,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton,
  DrawerHeader, DrawerBody, FormControl, FormLabel, Select, Input, RadioGroup, Radio, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useColorModeValue
} from '@chakra-ui/react';
import { ColorModeButton, Logo, NavBar } from 'components/elements';
import { ConnectButton } from '../ConnectButton';
import { FaBell as BellIcon, FaStar as StarIcon } from 'react-icons/fa';
import axios from 'axios';

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState('md');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coinsData, setCoinsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/rating-coins');
        console.log('before setCoinsdata')
        console.log(JSON.stringify(response.data))
        setCoinsData(response.data || []);
        setIsLoading(false);
        console.log('after setCoinsdata')

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

  const primaryColor = useColorModeValue('gray.700', 'gray.100');
  const secondaryColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box borderBottom="1px" borderBottomColor="chakra-border-color">
      <Container maxW="container.xl" p={'10px'}>
        <Flex align="center" justify="space-between">
          <Logo />
          <NavBar />
          <HStack gap={'10px'}>
            {['xl'].map((size) => (
              <Button key={size} onClick={() => handleClick(size)}>
                <StarIcon boxSize={6} color="orange.500" />
              </Button>
            ))}
            <Popover>
              <PopoverTrigger>
                <Button>
                  <BellIcon boxSize={6} color="orange.500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Confirmation!</PopoverHeader>
                <PopoverBody>
                  <FormControl mb={4}>
                    <FormLabel color={secondaryColor}>Type</FormLabel>
                    <Select placeholder="Bitcoin (BTC)" color={primaryColor}>
                      <option>Ethereum (ETH)</option>
                    </Select>
                  </FormControl>

                  <FormControl mb={4} isRequired>
                    <FormLabel color={secondaryColor}>Currency</FormLabel>
                    <Input placeholder="Currency" color={primaryColor} />
                  </FormControl>

                  <FormControl as="fieldset" mb={4}>
                    <FormLabel color={secondaryColor} mb={2}>
                      Price Condition
                    </FormLabel>
                    <RadioGroup defaultValue="above">
                      <HStack spacing="24px" color={primaryColor}>
                        <Radio value="above">Above</Radio>
                        <Radio value="below">Below</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel color={secondaryColor}>Price</FormLabel>
                    <NumberInput max={50} min={10} color={primaryColor}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl mb={4} isRequired>
                    <FormLabel color={secondaryColor}>Email</FormLabel>
                    <Input placeholder="Email" color={primaryColor} />
                  </FormControl>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <ConnectButton />
            <ColorModeButton />
          </HStack>
        </Flex>
      </Container>

      <Drawer onClose={onClose} isOpen={isOpen} size={size}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{`Rating data`}</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap="4">
              {isLoading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                <p>Hello</p>
               coinsData.map((coin, index) => (
                  <div key={index}>
                    <p>title	: {coin.title}</p>
                    <p>content: {coin.content}</p>
                    <p>url: {coin.url}</p>
                    <p>image_url: {coin.image_url}</p>
                    <p>source_url: {coin.source_url}</p>
                    <p>timestamp: {coin.timestamp}</p>
                    <p>tags: {coin.tags}</p>
                  </div>
              )) 
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      
    </Box>
  );
};

export default Header;