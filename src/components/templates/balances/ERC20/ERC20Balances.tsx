import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Heading,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useEvmWalletTokenBalances } from '@moralisweb3/next';
import { useSession } from 'next-auth/react';
import { useNetwork } from 'wagmi';
import { getEllipsisTxt } from 'utils/format';

const ERC20Balances = () => {
  const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
  const { data } = useSession();
  const { chain } = useNetwork();
  const { data: tokenBalances } = useEvmWalletTokenBalances({
    address: data?.user?.address,
    chain: chain?.id,
  });
  const [tokenPrices, setTokenPrices] = useState({});
  const [liquidityIssues, setLiquidityIssues] = useState({});
  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6, notation: "compact" }).format(number);
  };
  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjUzZTI3YzZjLTE1YTUtNGE0My05NTVlLTYzODg0Nzk0MTNjNyIsIm9yZ0lkIjoiMzgzMzQxIiwidXNlcklkIjoiMzkzODg0IiwidHlwZUlkIjoiNmNkZDQxNGEtNGQ1NC00YTFiLWJjYmUtMTAzZTgwMTM1ZDM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA3MDY4NTQsImV4cCI6NDg2NjQ2Njg1NH0.Jd7LRPGqGDDl3e5OULPEAx9b7vS7xCcddVToICpYgvQ';

  useEffect(() => {
    const fetchTokenPrices = async () => {
      const prices = {};
      const liquidityErrors = {};
      for (const { token } of tokenBalances ?? []) {
        const address = token?.contractAddress.checksum;
        if (!address) continue; 
        try {
          const response = await fetch(`https://deep-index.moralis.io/api/v2/erc20/${address}/price?chain=eth`, {
            headers: {
              'X-API-Key': MORALIS_API_KEY,
              'Accept': 'application/json',
            },
          });          
        
          if (!response.ok) {
            throw new Error(`Error fetching price: ${response.status}`);
          }
        
          const data = await response.json();
          prices[address] = data.usdPrice; 
        } catch (error) {
          console.error('Error fetching price for token:', token?.symbol, error);
          if (data.message && data.message.includes('No pools found with enough liquidity')) {
            liquidityErrors[address] = 'No pools found with enough liquidity to calculate the price';
          } else {
            prices[address] = data.usdPrice || 'Price information unavailable';
          }
      }
    }
      setTokenPrices(prices);
      setLiquidityIssues(liquidityErrors);
    };

    if (tokenBalances?.length) {
      fetchTokenPrices();
    }
  }, [tokenBalances, chain?.id]);

  return (
    <>
      <Heading size="lg" marginBottom={6}>
        ERC20 Balances
      </Heading>
      {tokenBalances?.length ? (
        <Box border="2px" borderColor={hoverTrColor} borderRadius="xl" padding="24px 18px">
          <TableContainer w={'full'}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Token</Th>
                  <Th>Balance (USD)</Th>
                  <Th>Value</Th>
                  <Th>Price (USD)</Th>
                  <Th isNumeric>Address</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tokenBalances.map(({ token, value }, key) => (
                  <Tr key={`${token?.symbol}-${key}-tr`} _hover={{ bgColor: hoverTrColor }} cursor="pointer">
                    <Td>
                      <HStack>
                        <Avatar size="sm" src={token?.logo || ''} name={token?.name} />
                        <VStack alignItems={'flex-start'}>
                          <Text as={'span'}>{token?.name}</Text>
                          <Text fontSize={'xs'} as={'span'}>
                            {token?.symbol}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>{value * tokenPrices[token?.contractAddress.checksum]}</Td>
                    <Td>{formatNumber(value)}</Td>
                    <Td>
                      {liquidityIssues[token?.contractAddress.checksum] ? (
                        <Text color="red.500">{liquidityIssues[token?.contractAddress.checksum]}</Text>
                      ) : tokenPrices[token?.contractAddress.checksum] ? (
                        `$${tokenPrices[token?.contractAddress.checksum]}`
                      ) : (
                        'Price information unavailable'
                      )}
                    </Td>
                    <Td isNumeric>{getEllipsisTxt(token?.contractAddress.checksum)}<Link href={`https://etherscan.io/token/${token?.contractAddress.checksum}`} isExternal><ExternalLinkIcon mx='2px' /> </Link></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box>Looks Like you do not have any ERC20 tokens</Box>
      )}
    </>
  );
};

export default ERC20Balances;
