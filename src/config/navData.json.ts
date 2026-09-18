export interface navLinkItem {
  text: string;
  label: string;
  href: string;
}

const navConfig = [
  {
    text: 'Projects',
    label: 'projects',
    href: '/#projects',
  },
  {
    text: 'Background',
    label: 'background',
    href: '/#background',
  },
  {
    text: '/ uses',
    href: '/uses/',
  },
  {
    text: '/ blog',
    href: '/blog/',
  },
];

export default navConfig;
