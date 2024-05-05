import { FC, ReactNode } from 'react';
import { Container } from '@chakra-ui/react';
import { Footer, Header } from 'components/modules';
import Head from 'next/head';


const TrackLayout: FC<{ children: ReactNode; pageName: string }> = ({ children, pageName }) => (
  <>
    <Head>
      <title>{`${pageName} | Blockatnet`}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    
    <Header />
    <Container maxW="100%" p={3} marginTop={25} as="main" minH="70vh">
        {children}
        </Container>
      <Footer></Footer>

  </>
);

export default TrackLayout;
