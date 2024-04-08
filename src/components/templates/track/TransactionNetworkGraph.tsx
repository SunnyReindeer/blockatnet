import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import Graph from 'graphology';
import ForceAtlas2 from 'graphology-layout-forceatlas2';
import { fetchTransactionHistory } from './Track'; // Assume this is your function to fetch transactions

const TransactionNetworkGraph = () => {
  const containerRef = useRef(null);
  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjU5ZTQ5YWYyLTkwMTAtNGIwMi1iMTU0LWU5YWFhNTNiMjgyMiIsIm9yZ0lkIjoiMzg0NjA1IiwidXNlcklkIjoiMzk1MTc5IiwidHlwZUlkIjoiMWUzOGMxOWItNTljNi00MWRjLWE2NzAtNTdkOTExZjM2YjQ2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEzNTY0MzUsImV4cCI6NDg2NzExNjQzNX0.-qwxoVBF8ZnqFKYGLua3zkgp8iuLR-3rguHLeytEg8o';
// Modified fetchTransactionHistory to accept parameters
const fetchTransactionHistory = async (address, apiKey) => {
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/history?chain=eth&from_date=2022-06-01&to_date=2022-08-01&include_internal_transactions=true&nft_metadata=true&order=DESC`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': apiKey,
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
  
  // Accept walletAddress and moralisApiKey as props
  const TransactionNetworkGraph = ({ walletAddress, moralisApiKey }) => {
    const containerRef = useRef(null);
  
    useEffect(() => {
      (async () => {
        if (!walletAddress || !moralisApiKey) {
          console.error("Missing wallet address or Moralis API key");
          return;
        }
  
        const transactions = await fetchTransactionHistory(walletAddress, moralisApiKey);
        const graph = new Graph();
  
        transactions.forEach((transaction, index) => {
          const fromNode = `from-${index}`;
          const toNode = `to-${index}`;
          graph.addNode(fromNode, { label: transaction.from_address, size: 10, color: '#FF5733' });
          graph.addNode(toNode, { label: transaction.to_address, size: 10, color: '#33FF57' });
          graph.addEdge(fromNode, toNode, { size: 1, color: '#0000FF', summary: transaction.summary, gas_price: transaction.gas_price });
        });
  
        ForceAtlas2.assign(graph, { settings: ForceAtlas2.inferSettings(graph) });
        new Sigma(graph, containerRef.current);
      })();
    }, [walletAddress, moralisApiKey]); // Rerun effect if walletAddress or moralisApiKey changes
  
  useEffect(() => {
    (async () => {
      const container = containerRef.current;
      const YOUR_WALLET_ADDRESS = 'YOUR_WALLET_ADDRESS_HERE';
      const transactions = await fetchTransactionHistory(YOUR_WALLET_ADDRESS, MORALIS_API_KEY);

      // Prepare the graph
      const graph = new Graph();

      // Add the central node for the user's address
      graph.addNode('USER_ADDRESS', {
        label: 'You',
        x: 0.5,
        y: 0.5,
        size: 10,
        color: '#f00',
      });

      // Iterate over transactions and add them to the graph
      transactions.forEach((transaction, index) => {
        const targetId = `node${index}`;
        graph.addNode(targetId, {
          label: transaction.to_address === 'YOUR_WALLET_ADDRESS' ? `From: ${transaction.from_address}` : `To: ${transaction.to_address}`,
          x: Math.cos((2 * Math.PI * index) / transactions.length),
          y: Math.sin((2 * Math.PI * index) / transactions.length),
          size: 5,
          color: transaction.to_address === 'YOUR_WALLET_ADDRESS' ? '#00f' : '#0f0',
        });

        graph.addEdge('USER_ADDRESS', targetId, {
          size: 1,
          color: '#ccc',
          // Custom attributes for summary and gas_price
          summary: transaction.summary,
          gas_price: transaction.gas_price,
        });
      });

      // Apply a layout algorithm to the graph
      ForceAtlas2.assign(graph, {
        iterations: 50,
        settings: ForceAtlas2.inferSettings(graph),
      });

      // Initialize sigma
      const renderer = new Sigma(graph, container, {
        renderEdgeLabels: true,
        defaultEdgeLabelSize: 12,
        edgeLabelSize: 'proportional',
      });

      // Implement dragging and other interactions here based on the example code you've provided

      return () => {
        renderer.kill(); // Cleanup sigma instance on component unmount
      };
    })();
  }, []);

  return <div ref={containerRef} style={{ height: '500px', width: '100%' }}></div>;
};

export default TransactionNetworkGraph;
