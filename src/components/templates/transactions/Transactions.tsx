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
    Link,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { ExternalLinkIcon, StarIcon } from '@chakra-ui/icons';
  import { useEvmWalletTransactions } from '@moralisweb3/next';
  import { useSession } from 'next-auth/react';
  import { useEffect, useState } from 'react';
  import { getEllipsisTxt } from 'utils/format';
  import { useNetwork } from 'wagmi';
  import Cookies from 'js-cookie';

  const Transactions = () => {
    const hoverTrColor = useColorModeValue('gray.100', 'gray.700');
    const { data } = useSession();
    const { chain } = useNetwork();
    const { data: transactions } = useEvmWalletTransactions({
      address: data?.user?.address,
      chain: chain?.id,
    });
    const [highlightedTransactions, setHighlightedTransactions] = useState([]);

    useEffect(() => {
      // Load highlighted transactions from cookies
      const savedHighlightedTransactions = Cookies.get(`highlightedTransactions-${data?.user?.address}`);
      if (savedHighlightedTransactions) {
        setHighlightedTransactions(JSON.parse(savedHighlightedTransactions));
      }
    }, [transactions, data?.user?.address]);

    
    const handleStarClick = (tx, key) => {
      const isHighlighted = highlightedTransactions.some((t) => t.key === key);
      if (isHighlighted) {
        setHighlightedTransactions(highlightedTransactions.filter((t) => t.key !== key));
        const updatedHighlightedTransactions = highlightedTransactions.filter((t) => t.key !== key);
        Cookies.set(`highlightedTransactions-${data?.user?.address}`, JSON.stringify(updatedHighlightedTransactions));
      } else {
        setHighlightedTransactions([...highlightedTransactions, { tx, key }]);
        Cookies.set(`highlightedTransactions-${data?.user?.address}`, JSON.stringify([...highlightedTransactions, { tx, key }]));
      }
    };


    return (
      <>
        <Heading size="lg" marginBottom={6}>
          Transactions
        </Heading>
        {transactions?.length ? (
          <Box border="2px" borderColor={hoverTrColor} borderRadius="xl" padding="24px 18px">
            <TableContainer w={'full'}>
              <Table>
                <Thead>
                  <Tr>
                    <Th></Th>
                    <Th>Hash</Th>
                    <Th>From</Th>
                    <Th>To</Th>
                    <Th>Gas used</Th>
                    <Th>Date</Th>
                    <Th isNumeric>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions?.map((tx, key) => (
                    <Tr
                      key={key}
                      _hover={{ bgColor: hoverTrColor }}
                      cursor="pointer"
                      bgColor={highlightedTransactions.some((t) => t.key === key) ? 'yellow.400' : 'transparent'}
                    >
                      <Td onClick={() => handleStarClick(tx, key)}>
                        <StarIcon color={highlightedTransactions.some((t) => t.key === key) ? 'yellow.500' : 'gray.400'} />
                      </Td>
                      <Td>
                        {getEllipsisTxt(tx?.hash)}
                        <Link href={`https://etherscan.io/tx/${tx?.hash}`} isExternal><ExternalLinkIcon mx='2px' /> </Link>
                      </Td>
                      <Td>{getEllipsisTxt(tx?.from.checksum)}</Td>
                      <Td>{getEllipsisTxt(tx?.to?.checksum)}</Td>
                      <Td>{tx?.gasUsed?.toString()}</Td>
                      <Td>{tx?.blockTimestamp ? new Date(tx.blockTimestamp).toLocaleDateString() : '-'}</Td>
                      <Td isNumeric>{tx?.receiptStatus}</Td>
                    </Tr>
                  ))}
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Th></Th>
                    <Th>Hash</Th>
                    <Th>From</Th>
                    <Th>To</Th>
                    <Th>Gas used</Th>
                    <Th>Date</Th>
                    <Th isNumeric>Status</Th>
                  </Tr>
                </Tfoot>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box>Looks Like you do not have any transactions</Box>
        )}
      </>
    );
  };

  export default Transactions;