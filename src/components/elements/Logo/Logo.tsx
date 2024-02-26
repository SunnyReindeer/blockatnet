import { useColorMode } from '@chakra-ui/react';
import Image from 'next/image';

const Logo = () => {
  const { colorMode } = useColorMode();

  return (
    <Image
      src={colorMode === 'dark' ? '/logo_Dark.png' : '/logo_Light.png'}
      height={45}
      width={150}
      alt="Blockatnet"
    />
  );
};

export default Logo;
