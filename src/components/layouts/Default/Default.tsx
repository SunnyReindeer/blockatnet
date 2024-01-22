import { FC, ReactNode } from 'react';
import { Container } from '@chakra-ui/react';
import { Footer, Header } from 'components/modules';
import Head from 'next/head';
import Sidebar from 'components/elements/navigation/SideBar/sidebar';

const Default: FC<{ children: ReactNode; pageName: string }> = ({ children, pageName }) => (
  <>
    <Head>
      <title>{`${pageName} | Blockatnet`}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    
    <Header />
    

    <div style={{ display: 'flex' }}>
        <Sidebar />
        {children}
      </div>

    <Footer />
  </>
);

export default Default;
