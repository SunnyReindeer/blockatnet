import Sidebar from 'components/elements/navigation/SideBar/sidebar';
import { Default } from 'components/layouts/Default';
import { Home } from 'components/templates/home';
import type { NextPage } from 'next';

const HomePage: NextPage = () => {
  return (
    <Default pageName="Home">
      <Home />
    </Default>
  );
};

export default HomePage;
