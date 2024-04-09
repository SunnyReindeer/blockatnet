import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, useToast } from '@chakra-ui/react';
import anychart from 'anychart';

const Track = () => {
  const { data: sessionData } = useSession();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);

  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI5N2Y2Mjc1LWVhZDQtNDNiOC04MmU2LWQyOTc2NDFkODdlYiIsIm9yZ0lkIjoiMzg0NjAyIiwidXNlcklkIjoiMzk1MTc2IiwidHlwZUlkIjoiZmZhOWY5NjAtZjZjMy00Y2JhLThhYTgtNWNhYzNkMTFkMGJmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEzNTQ1MTksImV4cCI6NDg2NzExNDUxOX0.h9-OeF5VKg4jPHXylfBaXphHk_Hm1ljzxYEDPtlx_BU';

  useEffect(() => {
    if (!sessionData?.user?.address) return;

    const fetchTransactionHistory = async () => {
      const address = sessionData.user.address;
      const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/history?chain=eth&from_date=2023-01-01&to_date=2024-04-01&include_internal_transactions=true&nft_metadata=true&order=DESC`;
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

        console.log("Transaction data:", data); 

        setTransactions(data.result); 
      } catch (error) {
        console.error("Failed to fetch transaction history:", error);
        toast({
          title: "An error occurred",
          description: "Unable to fetch transaction history.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    };

    fetchTransactionHistory();
  }, [sessionData?.user?.address, toast]);

  useEffect(() => {
    if (transactions.length > 0) {
      anychart.onDocumentReady(() => {
        const uniqueAddresses = new Set();
        const nodes = [];
        const edges = [];
  
        transactions.forEach((tx) => {
          // IDs for from and to nodes
          const fromId = tx.from_address;
          const toId = tx.to_address;
  
          // Add nodes if they don't exist yet
          if (!uniqueAddresses.has(fromId)) {
            nodes.push({ id: fromId, address: fromId });
            uniqueAddresses.add(fromId);
          }
          if (!uniqueAddresses.has(toId)) {
            nodes.push({ id: toId, address: toId });
            uniqueAddresses.add(toId);
          }
  
          // Add edges
          edges.push({
            from: fromId,
            to: toId,
            summary: tx.summary
          });
        });
  
        // Map nodes to the required format and highlight the user's node
        const mappedNodes = nodes.map((node) => ({
          id: node.id,
          label: node.address === sessionData.user.address ? `User: ${node.address}` : node.address
        }));
  
        const mappedEdges = edges.map((edge, index) => ({
          from: edge.from,
          to: edge.to,
          label: edge.summary,
          id: `edge_${index}` // Ensure each edge has a unique ID
        }));
  
        // Construct the graph data
        const data = { nodes: mappedNodes, edges: mappedEdges };
  
        // Instantiate and draw the chart
        const chart = anychart.graph(data);
        chart.title("Transactions");
  
        // Customizing nodes and edges
        chart.nodes().labels().enabled(true).format("{%label}");
        chart.edges().labels().enabled(true).format("{%label}");
  
        // Layout adjustments and drawing
        chart.layout({ iterationCount: 0 });
        chart.nodes().labels().fontSize(12).enabled(true).anchor('auto').autoRotate(true);
        chart.container("container");
        chart.draw();
  
        // Auto-zoom to fit the graph on screen
        chart.zoom(
          0.68,
          chart.getPixelBounds().width / 2,
          chart.getPixelBounds().height / 2
        );
      });
    }
  }, [transactions, sessionData?.user?.address]);

  return (
    <Box id="container" style={{ width: "100%", height: "1500px" }}></Box>
  );
};

export default Track;
