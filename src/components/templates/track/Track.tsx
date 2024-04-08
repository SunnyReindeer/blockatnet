// Track.js or Track.tsx if you're using TypeScript
import dynamic from 'next/dynamic';
import React, { useEffect, useRef } from 'react';
import { Flex, useToast } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import Sigma from 'sigma';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
const TransactionNetworkGraph = dynamic(() => import('./TransactionNetworkGraph'), { ssr: false });

// Define the fetch function outside of the component and export it
export const fetchTransactionHistory = async (address, MORALIS_API_KEY) => {
  const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/history?chain=eth&from_date=2022-06-01&to_date=2022-08-01&include_internal_transactions=true&nft_metadata=true&order=DESC`;
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'X-API-Key': MORALIS_API_KEY,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.result; // Assuming the data is in the `result` property
  } catch (error) {
    throw new Error(`Failed to fetch transaction history: ${error}`);
  }
};

const Track = () => {
  const { data: sessionData } = useSession();
  const toast = useToast();
  const containerRef = useRef(null);
  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjU5ZTQ5YWYyLTkwMTAtNGIwMi1iMTU0LWU5YWFhNTNiMjgyMiIsIm9yZ0lkIjoiMzg0NjA1IiwidXNlcklkIjoiMzk1MTc5IiwidHlwZUlkIjoiMWUzOGMxOWItNTljNi00MWRjLWE2NzAtNTdkOTExZjM2YjQ2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEzNTY0MzUsImV4cCI6NDg2NzExNjQzNX0.-qwxoVBF8ZnqFKYGLua3zkgp8iuLR-3rguHLeytEg8o';

  useEffect(() => {
    const setupGraph = async () => {
      if (!sessionData?.user?.address) {
        console.error("No wallet address found");
        return;
      }

      try {
        const transactions = await fetchTransactionHistory(sessionData.user.address, MORALIS_API_KEY);

        if (transactions.length === 0) {
          console.log("No transactions to display.");
          return;
        }

        const graph = new Graph();
        transactions.forEach((tx, index) => {
          const fromNode = `from-${index}`;
          const toNode = `to-${index}`;
          graph.addNode(fromNode, { label: tx.from_address, size: 10, color: '#FF5733' });
          graph.addNode(toNode, { label: tx.to_address, size: 10, color: '#33FF57' });
          graph.addEdge(fromNode, toNode, { size: 1, color: '#0000FF' });
        });

        forceAtlas2.assign(graph);
        new Sigma(graph, containerRef.current);
      } catch (error) {
        console.error(error);
        toast({
          title: "An error occurred",
          description: "Unable to fetch transaction history.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    };

    if (sessionData?.user?.address) {
      setupGraph();
    }
  }, [sessionData?.user?.address, toast, MORALIS_API_KEY]);

  return (
        <Flex direction="column" p={5} align="center" justify="center">
            <Suspense fallback={<div>Loading graph...</div>}>
                <TransactionNetworkGraph />
            </Suspense>
        </Flex>
  );
};

export default Track;
