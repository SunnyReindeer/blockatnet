import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Box, useToast, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, LinkOverlay,Button, ButtonGroup  } from '@chakra-ui/react';
import anychart from 'anychart';
import { ethers } from 'ethers';

const Track = () => {
  const { data: sessionData } = useSession();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [interactionDetails, setInteractionDetails] = useState(null);


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

const handleNodeClick = useCallback((event) => {
    const clickedNodeId = event?.domTarget?.tag?.id;
    if (clickedNodeId) {
        const relatedTransactions = transactions.filter(tx => 
            tx.from_address === clickedNodeId || tx.to_address === clickedNodeId
        );

        if (relatedTransactions.length > 0) {
            const totalInteractions = transactions.length;
            const interactionCount = relatedTransactions.length;
            const interactionPercentage = (interactionCount / totalInteractions * 100).toFixed(2);

            setInteractionDetails({
                address: clickedNodeId,
                interactionCount,
                interactionPercentage
            });

            setSelectedNode({
                address: clickedNodeId,
                transactions: relatedTransactions.map(tx => ({
                    ...tx,
                    transactionFeeEth: ethers.utils.formatEther(ethers.BigNumber.from(tx.gas_price).mul(tx.gas))
                }))
            });
        } else {
            console.log("No transactions found for this node.");
            setSelectedNode(null);
            setInteractionDetails(null);
        }
    } else {
        console.error("Clicked element does not have a valid 'id'.");
        setSelectedNode(null);
        setInteractionDetails(null);
    }
}, [transactions]);

  
  

  useEffect(() => {
    // Ensure we have the required user data before attempting to fetch transaction history
    if (transactions.length > 0 && sessionData?.user?.address) {
      anychart.onDocumentReady(() => {
        const nodes = [];
        const edges = [];
        const uniqueAddresses = new Set([sessionData.user.address]);
  
        transactions.forEach(tx => {
          const fromId = tx.from_address;
          const toId = tx.to_address;
  
          if (!uniqueAddresses.has(fromId)) {
            nodes.push({ id: fromId, address: fromId });
            uniqueAddresses.add(fromId);
          }
          if (!uniqueAddresses.has(toId)) {
            nodes.push({ id: toId, address: toId });
            uniqueAddresses.add(toId);
          }
  
          edges.push({
            from: fromId,
            to: toId,

          });
        });
  
        const mappedNodes = nodes.map(node => ({
          id: node.id,

          size: uniqueAddresses.has(node.id) ? 10 : 5  // Example: Larger size for more interactions
        }));
  
        const mappedEdges = edges.map((edge, index) => ({
          from: edge.from,
          to: edge.to,

          id: `edge_${index}`  // Unique ID for each edge
        }));
  
        const data = { nodes: mappedNodes, edges: mappedEdges };
  
        const chart = anychart.graph(data);
        chart.title("Transactions");
  
        chart.nodes().labels().enabled(true).format("{%label}");
        chart.edges().labels().enabled(true).format("{%label}");
  
        chart.layout({ iterationCount: 0 });
        chart.nodes().labels().fontSize(12).enabled(true).anchor('auto').autoRotate(true);
        chart.container("container");
        chart.draw();
  
        chart.zoom(
          0.68,
          chart.getPixelBounds().width / 2,
          chart.getPixelBounds().height / 2
        );
        chart.listen('click', handleNodeClick);
      });
    }
  }, [transactions, sessionData?.user?.address, handleNodeClick]);  // Use optional chaining here to prevent errors
  

return (
    <Box>
        <Box id="container" style={{ width: '50%', height: '1000px' }} />
        {interactionDetails && (
            <Box p={4}>
                <Text fontWeight="bold">Address: {interactionDetails.address}</Text>
                <Text>Interactions: {interactionDetails.interactionCount}</Text>
                <Text>Percentage of Total Interactions: {interactionDetails.interactionPercentage}%</Text>
                <Button onClick={() => setSelectedNode(prev => ({ ...prev, showDetails: !prev.showDetails }))}>
                    {selectedNode?.showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
            </Box>
        )}
        {selectedNode?.showDetails && (
            <Accordion allowToggle>
                {selectedNode.transactions.map((tx, index) => (
                    <AccordionItem key={index}>
                        <h2>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    Transaction on {new Date(tx.block_timestamp).toLocaleString()}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <Text>From: {tx.from_address}</Text>
                            <Text>To: {tx.to_address}</Text>
                            <Text>Value: {ethers.utils.formatEther(tx.value)} ETH</Text>
                            <Text>Gas Used: {tx.gas} units</Text>
                            <Text>Transaction Fee: {tx.transactionFeeEth} ETH</Text>

                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        )}
    </Box>
);

  
  
};

export default Track;
