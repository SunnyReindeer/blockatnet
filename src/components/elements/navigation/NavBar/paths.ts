import { ISubNav } from '../SubNav/SubNav';

const NAV_LINKS: ISubNav[] = [
  {
    label: 'Home',
    href: '/transfers',
    children: [
      {
        label: 'Dashboard',
        subLabel: 'Dashboard',
        href: '../',
        logo: 'servers',
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
        subLabel: 'Get your transactions',
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
        subLabel: 'Get your NFT balances',
        href: '/balances/nft',
        logo: 'pack',
      },
    ],
  },
  {
    label: 'Track',
    href: '/components/Track',
  },
];

export default NAV_LINKS;
