export interface UsesGroup<Item = string> {
  title: string;
  items: Item[];
}

/** A piece of hardware and, optionally, its specs or what it is used for. */
export interface Device {
  name: string;
  details?: string[];
}

/** Array order is the page order. Names only: the page lists each group on one line. */
export const development: UsesGroup[] = [
  {
    title: 'Languages',
    items: ['Python', 'Java', 'Kotlin', 'JavaScript', 'TypeScript', 'PHP'],
  },
  {
    title: 'Frontend',
    items: ['Angular', 'Vue', 'Astro'],
  },
  {
    title: 'Backend',
    items: ['Node.js', 'Spring Boot', 'Laravel', 'Symfony'],
  },
  {
    title: 'Mobile',
    items: ['Android', 'Ionic'],
  },
  {
    title: 'Styling',
    items: ['CSS', 'Bootstrap', 'Tailwind CSS'],
  },
  {
    title: 'Database',
    items: ['PostgreSQL', 'MySQL', 'Oracle', 'Redis'],
  },
  {
    title: 'Data',
    items: ['pandas', 'DuckDB', 'TensorFlow', 'PyTorch', 'scikit-learn'],
  },
  {
    title: 'Cloud',
    items: ['AWS', 'Firebase'],
  },
  {
    title: 'DevOps & tools',
    items: ['Docker', 'Git', 'GitHub', 'GitKraken', 'Postman', 'Claude'],
  },
  {
    title: 'IDE',
    items: ['WebStorm', 'PyCharm', 'IntelliJ IDEA', 'PhpStorm', 'Android Studio'],
  },
  {
    title: 'Terminal',
    items: [
      'iTerm2',
      'Oh My Zsh',
      'Powerlevel10k',
      'Homebrew',
      'fzf',
      'bat',
      'eza',
      'tldr',
      'zoxide',
      'lazygit',
    ],
  },
];

/** Array order is the page order. */
export const setup: UsesGroup<Device>[] = [
  {
    title: 'Computers',
    items: [
      {
        name: 'Mac Studio',
        details: ['M1 Max', '10-core CPU', '32-core GPU', '32 GB RAM', '1 TB SSD'],
      },
      {
        name: 'MacBook Air',
        details: ['M1', '8-core CPU', '8-core GPU', '16 GB RAM', '512 GB SSD'],
      },
    ],
  },
  {
    title: 'Displays',
    items: [
      { name: 'LG Ergo 32UN880W-B', details: ['3840×2160'] },
      { name: 'Dell UltraSharp UW3417W', details: ['3440×1440'] },
      { name: 'BenQ PD2700U', details: ['3840×2160', 'portrait'] },
    ],
  },
  {
    title: 'Input',
    items: [
      { name: 'Keychron K5 Pro RGB', details: ['Gateron Red switches'] },
      { name: 'Logitech G502 X' },
      { name: 'Logitech MX Master 3' },
    ],
  },
  {
    title: 'Audio',
    items: [
      { name: 'Focusrite Scarlett Solo', details: ['2nd gen'] },
      { name: 'Rode NT1 Signature Black' },
      { name: 'Sennheiser HD 598' },
      { name: 'AirPods Pro', details: ['2nd gen'] },
      { name: 'HomePod mini' },
    ],
  },
  {
    title: 'Phones',
    items: [{ name: 'iPhone 13 Pro' }, { name: 'iPhone 11 Pro', details: ['Continuity Camera'] }],
  },
  {
    title: 'Storage & network',
    items: [
      { name: 'LaCie Rugged USB3', details: ['4 TB', 'Time Machine'] },
      { name: 'Synology RT2600ac', details: ['router'] },
    ],
  },
  {
    title: 'Desk',
    items: [
      { name: 'BenQ ScreenBar Plus', details: ['monitor light'] },
      { name: 'Noblechairs Legend Black Edition' },
    ],
  },
];
