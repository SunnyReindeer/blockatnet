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
import { Box, Heading } from '@chakra-ui/react';

const CoinPriceChart = ({ coinDetails }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = coinDetails.map((item) => ({
      timestamp: moment(item.timestamp).format('MMM DD, YYYY'),
      price: parseFloat(item.price.toFixed(2)),
      volume: parseFloat(item.vol_spot_24h.toFixed(2)),
    }));
    setChartData(data);
  }, [coinDetails]);

  return (
    <Box>
      <Heading size="md" mb={4}>Coin Price Chart</Heading>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} layout="horizontal">
          {/* X 軸: 顯示時間戳,從舊到新排序 */}
          <XAxis dataKey="timestamp" type="category" reversed tick={{ fontSize: 14 }} />
          {/* 底部 Y 軸: 顯示價格 */}
          <YAxis yAxisId="left" orientation="left" domain={['dataMin', 'dataMax']} tick={{ fontSize: 14, format: '.2f' }}>
            <Text
              fontSize="sm"
              position="insideLeft"
              style={{ textAnchor: 'end' }}
              color="gray.600"
            >
              Price (USD)
            </Text>
          </YAxis>
          {/* 左側 Y 軸: 顯示交易量 */}
          <YAxis yAxisId="right" orientation="right" domain={['dataMin', 'dataMax']} tick={{ fontSize: 14, format: '.2f' }}>
            <Text
              fontSize="sm"
              transform="rotate(-90deg)"
              position="insideRight"
              style={{ textAnchor: 'middle' }}
              color="gray.600"
            >
              Volume (24h)
            </Text>
          </YAxis>
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
          
          <Line yAxisId="left" type="monotone" dataKey="price" stroke="#4299e1" strokeWidth={2} />
          
          <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#38a169" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CoinPriceChart;