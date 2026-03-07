export interface usesSubItem {
  title: string;
  items: string[];
}

export interface usesItem {
  sectionTitle: string;
  items: (string | usesSubItem)[];
}

const usesData: usesItem[] = [
  {
    sectionTitle: 'Development',
    items: [
      {
        title: 'Languages',
        items: ['Python', 'Java', 'Kotlin', 'JavaScript', 'TypeScript', 'PHP'],
      },
      {
        title: 'Frontend',
        items: ['Vue', 'Angular', 'Astro'],
      },
      {
        title: 'Backend',
        items: ['Node.js', 'Laravel', 'Symfony'],
      },
      {
        title: 'Mobile',
        items: ['Android', 'Ionic'],
      },
      {
        title: 'Styling',
        items: ['CSS3', 'Bootstrap', 'Tailwind CSS'],
      },
      {
        title: 'Database',
        items: ['PostgreSQL', 'MySQL', 'Oracle'],
      },
      {
        title: 'IDE',
        items: [
          'WebStorm',
          'PhpStorm',
          'PyCharm',
          'IntelliJ IDEA',
          'Android Studio',
        ],
      },
      {
        title: 'Terminal',
        items: [
          'iTerm2',
          'OhMyZsh',
          'Powerlevel10k',
          'Homebrew',
          'fzf',
          'bat',
          'eza',
          'tldr',
          'zoxide',
          'lazygit',
          'zsh-autosuggestions',
          'zsh-completions',
          'zsh-fast-syntax-highlighting',
        ],
      },
      {
        title: 'DevOps & Tools',
        items: ['Docker', 'Git', 'GitHub', 'GitKraken', 'Postman', 'Claude'],
      },
      {
        title: 'ML & AI',
        items: ['TensorFlow', 'PyTorch', 'scikit-learn', 'Redis', 'AWS', 'Qdrant', 'Firebase'],
      },
    ],
  },
  {
    sectionTitle: 'Setup',
    items: [
      'Mac Studio M1 Max 10-core CPU 32-core GPU 32GB Unified Memory 1TB SSD Storage',
      'MacBook Air M1 8-core CPU 8-Core GPU 16GB Unified Memory 512GB SSD Storage (Rose Gold 😎)',
      'LG Ergo 32UN880W-B 3840x2160 @60Hz',
      'Dell UltraSharp UW3417W 3440x1440 @60Hz',
      'BenQ PD2700U 3840x2160 @60Hz (Portrait)',
      'BenQ ScreenBar Plus',
      'Logitech MX Keys',
      'Logitech G502 X',
      'Logitech Master MX 3',
      'Focusrite Scarlett Solo 2nd gen',
      'Sennheiser HD 598',
      'Rode NT1 Signature Black',
      'HomePod mini',
      'AirPods Pro 2nd gen',
      'LaCie Rugged USB3 4TB (Time Machine)',
      'iPhone 13 Pro',
      'iPhone 11 Pro (Continuity Camera)',
      'Synology RT2600AC',
      'Noblechairs Legend Black Edition',
    ],
  },
];

export default usesData;
