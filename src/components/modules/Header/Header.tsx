import React, { useState, useEffect } from 'react';
import {
  Box, Container, Flex, HStack, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Button,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton,
  DrawerHeader, DrawerBody, FormControl, FormLabel, Select, Input, RadioGroup, Radio, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useColorModeValue, Image, Link
} from '@chakra-ui/react';
import { ColorModeButton, Logo, NavBar } from 'components/elements';
import { ConnectButton } from '../ConnectButton';
import { FaBell as BellIcon, FaEnvelope as EmailIcon } from 'react-icons/fa';
import axios from 'axios';

const Header = () => {
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
        const response = await axios.get('/api/rating-coins');
        console.log("Response received:", response.data);
        if (response.data && response.data.data && response.data.data.items) {
          setCoinsData(response.data.data.items);
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
                <EmailIcon boxSize={6} color="orange.500" />
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
          <DrawerHeader>{`latest crypto-related`}</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap="4">
              {isLoading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : (
                coinsData.map((coin, index) => (
                  <Box key={index} border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                    <Flex align="center" mb={2}>
                      <Image src={coin.image_url} alt={coin.title} boxSize="80px" mr={4} />
                      <Link href={coin.url} isExternal color={primaryColor} fontWeight="bold">
                        {coin.title}
                      </Link>
                    </Flex>
                    {/* Render content as HTML */}
                    <Box mb={2} dangerouslySetInnerHTML={{ __html: coin.content }} />
                    <Flex justify="space-between" align="center">
                      <Link href={coin.source_url} isExternal color={secondaryColor}>
                        Source
                      </Link>
                      <p color={secondaryColor}>
                        {new Date(coin.timestamp).toLocaleString()}
                      </p>
                    </Flex>
                    <Box mt={2}>
                      <p color={secondaryColor}>Tags: {coin.tags.map(tag => tag.name).join(', ')}</p>
                    </Box>
                  </Box>
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
