// pages/api/Coin-history.js
import axios from 'axios';

export default async function handler(req, res) {
  const { id } = req.query;
  const options = {
    headers: {
      'TI_API_KEY': process.env.TOKENINSIGHT_API_KEY,
      'Content-Type': 'application/json'
    },
    params: {
      interval: 'day',  
      length: 365,       
      vs_currency: 'usd' 
    }
  };

  try {
    const response = await axios.get(`https://api.tokeninsight.com/api/v1/history/coins/${id}`, options);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching coin data', details: error.message });
  }
}
