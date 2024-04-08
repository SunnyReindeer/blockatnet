import React, { useEffect, useRef } from 'react';
import { Flex, useToast } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import Sigma from 'sigma';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';

const Track = () => {
  const { data } = useSession();
  const toast = useToast();
  const containerRef = useRef(null);
  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjU5ZTQ5YWYyLTkwMTAtNGIwMi1iMTU0LWU5YWFhNTNiMjgyMiIsIm9yZ0lkIjoiMzg0NjA1IiwidXNlcklkIjoiMzk1MTc5IiwidHlwZUlkIjoiMWUzOGMxOWItNTljNi00MWRjLWE2NzAtNTdkOTExZjM2YjQ2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEzNTY0MzUsImV4cCI6NDg2NzExNjQzNX0.-qwxoVBF8ZnqFKYGLua3zkgp8iuLR-3rguHLeytEg8o';

  const fetchTransactionHistory = async () => {
    const address = data?.user?.address;
    if (!address) {
      console.error("No wallet address found");
      return [];
    }

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
      const transactionData = await response.json();
      return transactionData.result; // Assuming the data is in the `result` property
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      toast({
        title: "An error occurred",
        description: "Unable to fetch transaction history.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return [];
    }
  };

  useEffect(() => {
    const setupGraph = async () => {
      const transactions = await fetchTransactionHistory();

      if (transactions.length === 0) {
        console.log("No transactions to display.");
        return;
      }

      const graph = new Graph();
      transactions.forEach((tx, index) => {
        // Add nodes and edges based on transactions here
        const fromNode = `from-${index}`;
        const toNode = `to-${index}`;
        graph.addNode(fromNode, { label: tx.from_address, size: 10, color: '#FF5733' });
        graph.addNode(toNode, { label: tx.to_address, size: 10, color: '#33FF57' });
        graph.addEdge(fromNode, toNode, { size: 1, color: '#0000FF' });
      });

      forceAtlas2.assign(graph);
      new Sigma(graph, containerRef.current);
    };

    if (data?.user?.address) {
      setupGraph();
    }
  }, [data?.user?.address]);

  return (
    <Flex direction="column" p={5} align="center" justify="center">
      <div ref={containerRef} style={{ height: '500px', width: '100%' }}></div>
    </Flex>
  );
};

export default Track;
