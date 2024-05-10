import React, { useState, useEffect } from 'react';
import moment from 'moment';
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
  Cell,
} from 'recharts';
import { Box, Heading, Button, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, useDisclosure } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import _ from 'lodash';

const TIME_RANGES = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  '1y': 365,
};

const CoinPriceChart = ({ coinDetails }) => {
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('price');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedDate, setSelectedDate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    updateChartData(timeRange);
  }, [coinDetails, timeRange]);

  const filterDataByTimeRange = (data, range) => {
    const endDate = new Date();
    const startTime = endDate.getTime() - TIME_RANGES[range] * 24 * 60 * 60 * 1000;
    return data.filter((item) => item.timestamp >= startTime);
  };

  const formatData = (data) => {
    return data.map((item) => ({
      timestamp: moment(item.timestamp).format('MMM DD, YYYY'),
      price: parseFloat(item.price.toFixed(2)),
      volume: parseFloat(item.vol_spot_24h.toFixed(2)),
      marketCap: parseFloat(item.market_cap.toFixed(2)),
    }));
  };

  const updateChartData = (range) => {
    const data = filterDataByTimeRange(coinDetails, range);
    const formattedData = formatData(data);
    setChartData(formattedData);
    setTimeRange(range);
    setSelectedDate(null);
  };

  const handleDateChange = (date) => {
    const data = filterDataByMonth(coinDetails, date);
    const formattedData = formatData(data);
    setChartData(formattedData);
    setSelectedDate(date);
    onClose();
  };

  const filterDataByMonth = (data, date) => {
    const month = moment(date).format('MMMM');
    return data.filter((item) => moment(item.timestamp).format('MMMM') === month);
  };

  const renderLine = () => {
    const starIcon = (
      <Text
        x={selectedDate ? 0 : undefined}
        y={selectedDate ? 0 : undefined}
        fontSize={14}
        textAnchor="end"
        verticalAnchor="middle"
        dy={-5}
        dx={-5}
        fontWeight="bold"
        fill="gold"
      >
        ★
      </Text>
    );
    return (
      <Line
        yAxisId={chartType}
        type="monotone"
        dataKey={chartType}
        stroke="#4299e1"
        strokeWidth={2}
        strokeDasharray={selectedDate ? '5 5' : '0 0'}
        activeDot={{
          fill: selectedDate ? '#4299e1' : 'none',
          r: selectedDate ? 6 : 0,
        }}
      >
        {chartData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={selectedDate && moment(entry.timestamp).isSame(moment(selectedDate), 'day') ? 'gold' : undefined}
          />
        ))}
        {starIcon}
      </Line>
    );
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Coin Price Chart
      </Heading>
      <Flex justifyContent="space-between" mb={4}>
        <Box>
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
        <Box>
          {Object.keys(TIME_RANGES).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'solid' : 'outline'}
              colorScheme="blue"
              mr={2}
              onClick={() => updateChartData(range)}
            >
              {range}
            </Button>
          ))}
          <Button colorScheme="blue" onClick={onOpen}>
            Select Date
          </Button>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a Date</ModalHeader>
          <ModalBody>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="MMM d, yyyy"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} layout="horizontal">
          <XAxis dataKey="timestamp" type="category" reversed tick={{ fontSize: 14 }} />
          {chartType === 'price' && (
            <YAxis
              yAxisId="price"
              orientation="left"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 14, format: '.2f' }}
            >
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
            <YAxis
              yAxisId="volume"
              orientation="left"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 14, format: '.2f' }}
            >
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
            <YAxis
              yAxisId="marketCap"
              orientation="left"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 14, format: '.2f' }}
            >
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
          {renderLine()}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CoinPriceChart;