import { Default } from 'components/layouts/Default';
import { Cryptocurrencies } from 'components/templates/Cryptocurrencies';

const CryptocurrenciesPage = () => {
  return (
    <Default pageName="Test">
      <Cryptocurrencies />
    </Default>
  );
};

export default CryptocurrenciesPage;
