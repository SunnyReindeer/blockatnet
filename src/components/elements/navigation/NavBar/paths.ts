import { ISubNav } from '../SubNav/SubNav';

const NAV_LINKS: ISubNav[] = [
  {
    label: 'Home',
    href: '/transfers',
    children: [
      {
        label: 'Dashboard',
        href: '../',

      },
      {
        label: 'Transactions',
        href: '/transactions',

      },
      {
        label: 'ERC20 transfer',
        subLabel: 'Get your ERC20 transfers',
        href: '/transfers/erc20',

      },
      {
        label: 'NFT transfer',
        subLabel: 'Get your ERC721 an ERC1155 transfers',
        href: '/transfers/nft',

      },
      {
        label: 'ERC20 Balance',
        subLabel: 'Get your ERC20 balances',
        href: '/balances/erc20',

      },
      {
        label: 'NFT Balance',
        subLabel: 'Get your ERC721 an ERC1155 balances',
        href: '/balances/nft',

      },
    ],
  },
  {
    label: 'Track',
    href: '/track',
  },
  {
    label: 'Alert',
    href: '/alert',
  },
];

export default NAV_LINKS;
