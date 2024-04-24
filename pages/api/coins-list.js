// pages/api/coins-list.js
import axios from 'axios';

export default async function handler(req, res) {
  const options = {
    headers: {
      'TI_API_KEY': process.env.TOKENINSIGHT_API_KEY,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await axios.get('https://api.tokeninsight.com/api/v1/coins/list', options);
    //console.log(`success:${JSON.stringify(response.data)}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.response) {
      // The API made a response, but it was not successful
      console.error('API Response:', error.response.data);
      console.error('API Status:', error.response.status);
      console.error('API Headers:', error.response.headers);
      res.status(error.response.status).json({ message: 'Error fetching coin data', details: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
      res.status(500).json({ message: 'Error fetching coin data', details: 'No response received' });
    } else {
      // Something happened in setting up the request
      console.error('Error Setting Up Request:', error.message);
      res.status(500).json({ message: 'Error fetching coin data', details: error.message });
    }
  }
}