
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


  const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjU5ZTQ5YWYyLTkwMTAtNGIwMi1iMTU0LWU5YWFhNTNiMjgyMiIsIm9yZ0lkIjoiMzg0NjA1IiwidXNlcklkIjoiMzk1MTc5IiwidHlwZUlkIjoiMWUzOGMxOWItNTljNi00MWRjLWE2NzAtNTdkOTExZjM2YjQ2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEzNTY0MzUsImV4cCI6NDg2NzExNjQzNX0.-qwxoVBF8ZnqFKYGLua3zkgp8iuLR-3rguHLeytEg8o';
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
      processTransactions(data.result); 
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
          return acc; 
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

    const nodeIds = new Set(transactions.flatMap(tx => [`${tx.from_address}`, `${tx.to_address}`]));
    const nodes = Array.from(nodeIds).map(id => ({ id }));
    const links = transactions.map(tx => ({
      source: `${tx.from_address}`,
      target: `${tx.to_address}`,
      value: tx.value || 1, 
    }));

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const container = svg.append('g');

    svg.call(d3.zoom().scaleExtent([0.5, 4]).on("zoom", (event) => {
      container.attr("transform", event.transform);
    }));

    container.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter().append("line");

    const linkForce = d3.forceLink(links)
      .id(d => d.id)
      .distance(d => 50); 

    const simulation = d3.forceSimulation(nodes)
      .force("link", linkForce)
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const node = container.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 5)
      .attr("fill", d => d.id === clickedNodeId ? "green" : "blue")
      .on("click", (event, d) => handleNodeClick(event, d))
      .call(d3.drag()
        .on("start", (event, d) => dragstarted(event, d, simulation))
        .on("drag", dragged)
        .on("end", (event, d) => dragended(event, d, simulation)));

    node.append("title").text(d => d.id);

    simulation.on("tick", () => {
      container.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    function dragstarted(event, d, simulation) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d, simulation) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const handleNodeClick = useCallback((event, node) => {
    console.log("Node clicked:", node);

    // Update the state to reflect the currently active (clicked) node
    setClickedNodeId(node.id);

    // Reset all nodes to their default color
    d3.select(svgRef.current).selectAll("circle")
      .attr('fill', d => d.id === sessionData?.user?.address ? "blue" : "blue"); 

    // Highlight the clicked node
    d3.select(event.currentTarget)
      .attr('fill', 'green');  // Set the clicked node to green

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
  }, [transactions, isLocked, sessionData?.user?.address]);



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
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Viewing Transactions for Address: {inputAddress || sessionData?.user?.address || 'Not set'}
            </Text>
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