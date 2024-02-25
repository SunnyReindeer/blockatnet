import { ISubNav } from '../SubNav/SubNav';
import { Stream } from 'components/Streams';
import { Track } from 'components/Track';

const NAV_LINKS: ISubNav[] = [
  {
    label: 'Home',
    href: '/transfers',
    children: [
      {
        label: 'Dashboard',
        subLabel: 'Dashboard',
        href: '../',
        logo: 'token',
      },
      {
        label: 'ERC20',
        subLabel: 'Get your ERC20 transfers',
        href: '/transfers/erc20',
        logo: 'token',
      },
      {
        label: 'NFT',
        subLabel: 'Get your ERC721 an ERC1155 transfers',
        href: '/transfers/nft',
        logo: 'lazyNft',
      },
      {
        label: 'Transactions',
        subLabel: 'Get your ERC721 an ERC1155 transfers',
        href: '/transactions',
        logo: 'lazyNft',
      },
      {
        label: 'ERC20',
        subLabel: 'Get your ERC20 balances',
        href: '/balances/erc20',
        logo: 'token',
      },
      {
        label: 'NFT',
        subLabel: 'Get your ERC721 an ERC1155 balances',
        href: '/balances/nft',
        logo: 'pack',
      },
    ],
  },
  { label: 'Alert', href: '/components/Alert' ,},
  {
    label: 'Track',
    href: '/components/Track',
  },

  {
    label: 'Stream',
    href: '/components/Stream',
  },
];

export default NAV_LINKS;
