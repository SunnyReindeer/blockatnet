import React, { useState, useEffect } from 'react';
import {
  Box, Container, Flex, HStack, Popover, PopoverTrigger, PopoverContent,
  PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Button,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton,
  DrawerHeader, DrawerBody, FormControl, FormLabel, Select, Input, RadioGroup, Radio, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useColorModeValue, Image, Link, Card, CardBody, CardFooter, Stack, Text
} from '@chakra-ui/react';
import { ColorModeButton, Logo, NavBar } from 'components/elements';
import { ConnectButton } from '../ConnectButton';
import { FaBell as BellIcon, FaEnvelope as EmailIcon } from 'react-icons/fa';
import axios from 'axios';

const MAX_CONTENT_LENGTH = 200;

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
                  <Card
                    key={index}
                    direction={{ base: 'column', sm: 'row' }}
                    overflow="hidden"
                    variant="outline"
                    borderRadius="md"
                    boxShadow="lg"
                  >
                    <Image
                      objectFit="cover"
                      maxW={{ base: '100%', sm: '200px' }}
                      src={coin.image_url}
                      alt={coin.title}
                    />
                    <Stack>
                      <CardBody>
                        <Link href={coin.url} isExternal color={primaryColor} fontWeight="bold">
                          {coin.title}
                        </Link>
                        <Box mt={2}>
                          {coin.content.length <= MAX_CONTENT_LENGTH ? (
                            <Text dangerouslySetInnerHTML={{ __html: coin.content }} />
                          ) : (
                            <Box>
                              <Text dangerouslySetInnerHTML={{ __html: coin.content.slice(0, MAX_CONTENT_LENGTH) }} />...
                              <Link href={coin.url} isExternal color={primaryColor}>
                                Read more
                              </Link>
                            </Box>
                          )}
                        </Box>
                      </CardBody>
                      <CardFooter>
                        <Box mb={2}>
                          <p color={secondaryColor}>
                            Tags: {coin.tags.map(tag => tag.name).join(', ')}
                          </p>
                        </Box>
                        <Flex justify="space-between" align="center" w="100%">
                          <Link href={coin.source_url} isExternal color={secondaryColor}>
                            Source
                          </Link>
                          <p color={secondaryColor}>
                            {new Date(coin.timestamp).toLocaleString()}
                          </p>
                        </Flex>
                      </CardFooter>
                    </Stack>
                  </Card>
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