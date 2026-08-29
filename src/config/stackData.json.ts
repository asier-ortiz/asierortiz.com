export interface StackItem {
  /** Visible label and accessible name. */
  name: string;
  /** astro-icon id from a monochrome (currentColor) collection. */
  icon: `simple-icons:${string}` | `devicon-plain:${string}`;
  /** Brand colour revealed on hover. Dark brands use a legible stand-in for base-950. */
  color: `#${string}`;
}

/** Array order is the marquee order. */
const stackData: StackItem[] = [
  // Languages
  { name: 'Python', icon: 'simple-icons:python', color: '#3776AB' },
  { name: 'Java', icon: 'devicon-plain:java', color: '#F89820' },
  { name: 'Kotlin', icon: 'simple-icons:kotlin', color: '#7F52FF' },
  { name: 'TypeScript', icon: 'simple-icons:typescript', color: '#3178C6' },
  { name: 'JavaScript', icon: 'simple-icons:javascript', color: '#F7DF1E' },
  { name: 'PHP', icon: 'simple-icons:php', color: '#777BB4' },
  // Frontend
  { name: 'Vue', icon: 'simple-icons:vuedotjs', color: '#4FC08D' },
  { name: 'Angular', icon: 'simple-icons:angular', color: '#DD0031' },
  { name: 'Astro', icon: 'simple-icons:astro', color: '#BC52EE' },
  // Backend
  { name: 'Node.js', icon: 'simple-icons:nodedotjs', color: '#5FA04E' },
  { name: 'Laravel', icon: 'simple-icons:laravel', color: '#FF2D20' },
  { name: 'Symfony', icon: 'simple-icons:symfony', color: '#F5F5F5' },
  // Mobile
  { name: 'Android', icon: 'simple-icons:android', color: '#3DDC84' },
  { name: 'Ionic', icon: 'simple-icons:ionic', color: '#3880FF' },
  // Styling
  { name: 'Tailwind CSS', icon: 'simple-icons:tailwindcss', color: '#06B6D4' },
  // Data & cloud
  { name: 'PostgreSQL', icon: 'simple-icons:postgresql', color: '#4169E1' },
  { name: 'Qdrant', icon: 'simple-icons:qdrant', color: '#DC244C' },
  { name: 'AWS', icon: 'devicon-plain:amazonwebservices', color: '#FF9900' },
  // ML & AI
  { name: 'TensorFlow', icon: 'simple-icons:tensorflow', color: '#FF6F00' },
  { name: 'PyTorch', icon: 'simple-icons:pytorch', color: '#EE4C2C' },
  { name: 'scikit-learn', icon: 'simple-icons:scikitlearn', color: '#F7931E' },
  // DevOps & tools
  { name: 'Docker', icon: 'simple-icons:docker', color: '#2496ED' },
  { name: 'Git', icon: 'simple-icons:git', color: '#F05032' },
  { name: 'GitHub', icon: 'simple-icons:github', color: '#FFFFFF' },
  { name: 'JetBrains', icon: 'simple-icons:jetbrains', color: '#FF318C' },
  { name: 'Claude', icon: 'simple-icons:claude', color: '#D97757' },
];

export default stackData;
