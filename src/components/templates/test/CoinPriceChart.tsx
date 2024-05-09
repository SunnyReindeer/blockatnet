import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text,
} from 'recharts';
import moment from 'moment';
import { Box, Heading, Button } from '@chakra-ui/react';

const CoinPriceChart = ({ coinDetails }) => {
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('price');

  useEffect(() => {
    const data = coinDetails.map((item) => ({
      timestamp: moment(item.timestamp).format('MMM DD, YYYY'),
      price: parseFloat(item.price.toFixed(2)),
      volume: parseFloat(item.vol_spot_24h.toFixed(2)),
      marketCap: parseFloat(item.market_cap.toFixed(2)),
    }));
    setChartData(data);
  }, [coinDetails]);

  return (
    <Box>
      <Heading size="md" mb={4}>Coin Price Chart</Heading>
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <Button
          variant={chartType === 'price' ? 'solid' : 'outline'}
          colorScheme="blue"
          mr={2}
          onClick={() => setChartType('price')}
        >
          Price
        </Button>
        <Button
          variant={chartType === 'volume' ? 'solid' : 'outline'}
          colorScheme="blue"
          mr={2}
          onClick={() => setChartType('volume')}
        >
          Volume
        </Button>
        <Button
          variant={chartType === 'marketCap' ? 'solid' : 'outline'}
          colorScheme="blue"
          onClick={() => setChartType('marketCap')}
        >
          Market Cap
        </Button>
      </Box>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} layout="horizontal">
          <XAxis dataKey="timestamp" type="category" reversed tick={{ fontSize: 14 }} />
          {chartType === 'price' && (
            <YAxis yAxisId="price" orientation="left" domain={['dataMin', 'dataMax']} tick={{ fontSize: 14, format: '.2f' }}>
              <Text
                fontSize="sm"
                position="insideLeft"
                style={{ textAnchor: 'end' }}
                color="gray.600"
              >
                Price (USD)
              </Text>
            </YAxis>
          )}
          {chartType === 'volume' && (
            <YAxis yAxisId="volume" orientation="left" domain={['dataMin', 'dataMax']} tick={{ fontSize: 14, format: '.2f' }}>
              <Text
                fontSize="sm"
                position="insideLeft"
                style={{ textAnchor: 'end' }}
                color="gray.600"
              >
                Volume (24h)
              </Text>
            </YAxis>
          )}
          {chartType === 'marketCap' && (
            <YAxis yAxisId="marketCap" orientation="left" domain={['dataMin', 'dataMax']} tick={{ fontSize: 14, format: '.2f' }}>
              <Text
                fontSize="sm"
                position="insideLeft"
                style={{ textAnchor: 'end' }}
                color="gray.600"
              >
                Market Cap (USD)
              </Text>
            </YAxis>
          )}
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0' }}
            itemStyle={{ color: '#333' }}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 14, color: 'gray.600' }}
            iconType="circle"
            iconSize={10}
          />
          {chartType === 'price' && (
            <Line yAxisId="price" type="monotone" dataKey="price" stroke="#4299e1" strokeWidth={2} />
          )}
          {chartType === 'volume' && (
            <Line yAxisId="volume" type="monotone" dataKey="volume" stroke="#38a169" strokeWidth={2} />
          )}
          {chartType === 'marketCap' && (
            <Line yAxisId="marketCap" type="monotone" dataKey="marketCap" stroke="#6b46c1" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CoinPriceChart;