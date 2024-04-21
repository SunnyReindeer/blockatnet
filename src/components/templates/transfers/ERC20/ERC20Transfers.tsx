import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  Heading,
  Box,
  useColorModeValue,
  Flex,
  Icon,
  Text,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { useEvmWalletTokenTransfers } from '@moralisweb3/next';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getEllipsisTxt } from 'utils/format';
import { useNetwork } from 'wagmi';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import Cookies from 'js-cookie';

const ERC20Transfers = () => {
  const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
  const { data } = useSession();
  const { chain } = useNetwork();
  const { data: transfers } = useEvmWalletTokenTransfers({
    address: data?.user?.address,
    chain: chain?.id,
  });
  const [highlightedTransfers, setHighlightedTransfers] = useState([]);
  const [pinnedTransfers, setPinnedTransfers] = useState([]);

  useEffect(() => {
    console.log('transfers: ', transfers);
    // Load highlighted and pinned transfers from cookies
    const savedHighlightedTransfers = Cookies.get('highlightedTransfers');
    const savedPinnedTransfers = Cookies.get('pinnedTransfers');
    if (savedHighlightedTransfers) {
      setHighlightedTransfers(JSON.parse(savedHighlightedTransfers));
    }
    if (savedPinnedTransfers) {
      setPinnedTransfers(JSON.parse(savedPinnedTransfers));
    }
  }, [transfers]);

  const handleStarClick = (index) => {
    if (highlightedTransfers.includes(index)) {
      setHighlightedTransfers(highlightedTransfers.filter((i) => i !== index));
    } else {
      setHighlightedTransfers([...highlightedTransfers, index]);
    }
    // Save highlighted transfers to cookies
    Cookies.set('highlightedTransfers', JSON.stringify([...highlightedTransfers, index]));
  };

  const handlePinClick = (index) => {
    if (pinnedTransfers.includes(index)) {
      setPinnedTransfers(pinnedTransfers.filter((i) => i !== index));
    } else {
      setPinnedTransfers([...pinnedTransfers, index]);
    }
    // Save pinned transfers to cookies
    Cookies.set('pinnedTransfers', JSON.stringify([...pinnedTransfers, index]));
  };

  return (
    <>
      <Heading size="lg" marginBottom={6}>
        ERC20 Transfers
      </Heading>
      {transfers?.length ? (
        <Box border="2px" borderColor={hoverTrColor} borderRadius="xl" padding="24px 18px">
          <TableContainer w={'full'}>
            <Table>
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th>Token</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Date</Th>
                  <Th isNumeric>Value</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {transfers?.map((transfer, key) => (
                  <Tr
                    key={key}
                    _hover={{ bgColor: hoverTrColor }}
                    cursor="pointer"
                    bgColor={
                      highlightedTransfers.includes(key)
                        ? 'yellow.400'
                        : pinnedTransfers.includes(key)
                        ? 'blue.200'
                        : 'transparent'
                    }
                  >
                    <Td onClick={() => handleStarClick(key)}>
                      <Flex alignItems="center">
                        <Icon
                          as={FaStar}
                          color={highlightedTransfers.includes(key) ? 'yellow.500' : 'gray.400'}
                          mr={2}
                        />
                        <Text>{highlightedTransfers.includes(key) ? 'Marked' : 'Mark'}</Text>
                      </Flex>
                    </Td>
                    <Td>{getEllipsisTxt(transfer?.address.checksum)}</Td>
                    <Td>{getEllipsisTxt(transfer?.fromAddress.checksum)}</Td>
                    <Td>{getEllipsisTxt(transfer?.toAddress.checksum)}</Td>
                    <Td>{new Date(transfer.blockTimestamp).toLocaleDateString()}</Td>
                    <Td isNumeric>{transfer.value.toString()}</Td>
                    <Td>
                      <Tooltip label="Pin Transfer">
                        <Button
                          size="sm"
                          colorScheme={pinnedTransfers.includes(key) ? 'blue' : 'gray'}
                          onClick={() => handlePinClick(key)}
                        >
                          <Icon as={FaExternalLinkAlt} />
                        </Button>
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
              <Tfoot>
                <Tr>
                  <Th></Th>
                  <Th>Token</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Date</Th>
                  <Th isNumeric>Value</Th>
                  <Th></Th>
                </Tr>
              </Tfoot>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box>Looks Like you do not have any ERC20 Transfers</Box>
      )}
    </>
  );
};

export default ERC20Transfers;