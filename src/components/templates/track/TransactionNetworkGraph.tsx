import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import Graph from 'graphology';
import ForceAtlas2 from 'graphology-layout-forceatlas2';
import { fetchTransactionHistory } from './fetchTransactionHistory'; // Assume this is your function to fetch transactions

const TransactionNetworkGraph = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const container = containerRef.current;

      // Fetch transaction history
      const transactions = await fetchTransactionHistory('YOUR_WALLET_ADDRESS');

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
