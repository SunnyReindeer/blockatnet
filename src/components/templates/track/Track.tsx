import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Input, Flex, Box, useToast, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Button, InputGroup, InputRightElement, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import * as d3 from 'd3';
import { ethers } from 'ethers';

const Track = () => {
  const { data: sessionData } = useSession();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [interactionDetails, setInteractionDetails] = useState(null);
  const [inputAddress, setInputAddress] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const svgRef = useRef(null);
  const [fromDate, setFromDate] = useState("2023-01-01");
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [clickedNodeId, setClickedNodeId] = useState(null);



  // Fetch transaction history based on address input or user's address
  useEffect(() => {
    if (inputAddress) {
      fetchTransactionHistory(inputAddress);
    } else if (sessionData?.user?.address) {
      fetchTransactionHistory(sessionData.user.address);
    }
  }, [sessionData?.user?.address, inputAddress]);

  // Handle address input change
  const handleAddressChange = (e) => setInputAddress(e.target.value);

  // Submit address for fetching data
  const handleAddressSubmit = () => {
    const addressToUse = inputAddress.trim() || sessionData?.user?.address;
    if (addressToUse) {
      fetchTransactionHistory(addressToUse);
    } else {
      toast({
        title: "Error",
        description: "Please enter an address or log in.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };


  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImVhYTg0YTFjLTY0Y2QtNDFmMS1iNGJmLTc2Nzc5NGM1YmI0ZSIsIm9yZ0lkIjoiMzY1MzU2IiwidXNlcklkIjoiMzc1NDkyIiwidHlwZUlkIjoiMGU2NDIxN2MtNzg2OS00MTc5LThhNWItM2YyNDhkZmY2NzU3IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDA2MzIyMjYsImV4cCI6NDg1NjM5MjIyNn0.DylRjEqP-V0hBx09pJl75NYY1gAWvWf_wq4j2RerLkQ';

  // Fetch transaction history from Moralis API
  const fetchTransactionHistory = async (address) => {
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/history?chain=eth&from_date=${fromDate}&to_date=${toDate}&include_internal_transactions=true&nft_metadata=true&order=DESC`;
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
      processTransactions(data.result); // Processing to handle null addresses
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

  const processTransactions = (transactions) => {
    const processed = transactions.reduce((acc, tx) => {
      // Filter out transactions involving the null address in any significant role
      if (tx.from_address === "0x0000000000000000000000000000000000000000") {
        if (tx.erc20_transfers && tx.erc20_transfers.length > 0) {
          tx.from_address = tx.erc20_transfers[0].from_address;
        } else {
          return acc; // Skip adding this transaction if we can't resolve a real address
        }
      }
      
      // Similar handling could be added for to_address if necessary
      if (tx.to_address === "0x0000000000000000000000000000000000000000" && tx.erc20_transfers && tx.erc20_transfers.length > 0) {
        tx.to_address = tx.erc20_transfers[0].to_address;
      }
  
      acc.push(tx);
      return acc;
    }, []);
    setTransactions(processed);
    updateGraph(processed);
  };

  const handleNodeClick = useCallback((node) => {
    console.log("Node clicked:", node);

    setClickedNodeId(node.id);

    const relatedTransactions = transactions.filter(tx =>
      tx.from_address === node.id || tx.to_address === node.id
    );

    if (relatedTransactions.length > 0) {
      const totalInteractions = transactions.length;
      const interactionCount = relatedTransactions.length;
      const interactionPercentage = (interactionCount / totalInteractions * 100).toFixed(2);

      setInteractionDetails({
        address: node.id,
        interactionCount,
        interactionPercentage
      });

      setSelectedNode({
        address: node.id,
        transactions: relatedTransactions.map(tx => ({
          ...tx,
          transactionFeeEth: ethers.utils.formatEther(ethers.BigNumber.from(tx.gas_price).mul(tx.gas))
        }))
      });

    } else {
      setInteractionDetails(null);
      setSelectedNode(null);
    }
  }, [transactions, isLocked]); 






  // Update graph visualization
  useEffect(() => {
    if (!svgRef.current) return;
    if (transactions.length > 0) {
      updateGraph(transactions);
    }
  }, [transactions, svgRef.current]);



  

  // Update graph visualization
  const updateGraph = (transactions) => {
    if (!svgRef.current) return;


    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Setup nodes and links
    const nodeIds = new Set(transactions.flatMap(tx => [`${tx.from_address}`, `${tx.to_address}`]));
    const nodes = Array.from(nodeIds).map(id => ({ id }));
    const links = transactions.map(tx => ({
      source: `${tx.from_address}`,
      target: `${tx.to_address}`
    }));

    // Setup simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const svg = d3.select(svgRef.current)
      .call(d3.zoom().on("zoom", (event) => {
        svg.attr("transform", event.transform);
      }))
      .append('g');

    // Draw links
    svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter().append("line");

    // Draw nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => d.id === sessionData?.user?.address ? 10 : (d.id === clickedNodeId ? 6 : 5))
      .attr("fill", d => d.id === clickedNodeId ? "green" : "blue")
      .on("click", handleNodeClick)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    if (isLocked) {
      node.on("click", null); 
    } else {
      node.on("click", (event, d) => handleNodeClick(d));
    }

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
      svg.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };


  useEffect(() => {
    if (transactions.length > 0) {
      updateGraph(transactions);
    }
  }, [transactions, svgRef.current, isLocked]); 




  return (
    <Flex>
      <Box flex="1" p={4} overflowY="auto" maxW="600px">
        <Box mb={4}>
          <Box mb={4}>
            <FormLabel htmlFor="from-date">From Date</FormLabel>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <FormLabel htmlFor="to-date">To Date</FormLabel>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <Button mt={4} colorScheme="blue" onClick={handleAddressSubmit}>Load</Button>
          </Box>



          <Input
            placeholder="Enter wallet address"
            value={inputAddress}
            onChange={handleAddressChange}
          />

        </Box>
        {interactionDetails && (
          <Box mb={4}>
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
                      {tx.summary} on {new Date(tx.block_timestamp).toLocaleString()}
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
      <Box flex="3" id="container" style={{ height: '1150px' }}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </Box>
    </Flex>
  );
};


export default Track;