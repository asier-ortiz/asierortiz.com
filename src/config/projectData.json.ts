import type { ImageMetadata } from 'astro';
import ArabaMarket from '@images/projects/araba-market.webp';
import Alcon from '@images/projects/alcon.webp';
import Nieves from '@images/projects/nieves.webp';
import FlareWatch from '@images/projects/flarewatch.webp';

export interface ProjectItem {
  image: ImageMetadata;
  title: string;
  description: string;
  href?: URL;
  languages: Language[];
  type: string | string[];
  buttonText: string;
  buttonIcon?: string;
}

export interface Language {
  language: string;
  color: string;
}

export const projectData: ProjectItem[] = [
  {
    image: FlareWatch,
    title: 'FlareWatch',
    description: `An Android app for IBD patients to log daily symptoms, diet, and lifestyle habits.
    Uses machine learning models on the backend to predict flare risk, track symptom trends over time,
    and deliver personalized health recommendations based on each patient's data.
    `,
    languages: [
      { language: 'Kotlin', color: '#A97BFF' },
      { language: 'Jetpack Compose', color: '#4285F4' },
      { language: 'Material 3', color: '#757575' },
      { language: 'Vico', color: '#E91E63' },
      { language: 'FastAPI', color: '#009688' },
      { language: 'SQLAlchemy', color: '#D71F00' },
      { language: 'scikit-learn', color: '#F7931E' },
      { language: 'PyTorch', color: '#EE4C2C' },
      { language: 'MySQL', color: '#4479A1' },
      { language: 'Docker', color: '#2496ED' },
    ],
    type: ['mobile & web development', 'data science & machine learning'],
    buttonText: 'In Development',
    buttonIcon: 'tdesign:code',
  },
  {
    image: Alcon,
    title: 'ALCON',
    description: `An offline-first Android app for road surveillance teams at the Provincial Council of Álava.
    Features real-time GPS tracking with automatic road and kilometer-point detection, incident and emergency reporting with photos,
    voice commands for hands-free operation, biometric authentication, and automatic sync when connectivity is restored.
    `,
    href: new URL('https://asierortiz.com/blog/building-offline-first-android-field-ops/'),
    languages: [
      { language: 'Kotlin', color: '#A97BFF' },
      { language: 'Jetpack Compose', color: '#4285F4' },
      { language: 'Material 3', color: '#757575' },
      { language: 'Room', color: '#003B57' },
      { language: 'Node.js', color: '#339933' },
      { language: 'PostgreSQL', color: '#336791' },
      { language: 'GeoPackage', color: '#2E7D32' },
      { language: 'MapLibre', color: '#396CB2' },
      { language: 'Firebase', color: '#DD2C00' },
      { language: 'VOSK', color: '#FF6F00' },
    ],
    type: 'mobile & web development',
    buttonText: 'Read Blog Post',
  },
  {
    image: Nieves,
    title: 'Nieves',
    description: `A web platform for coordinating critical winter road operations at the Provincial Council of Álava.
    Modernizes a 15-year-old legacy desktop system with real-time GPS vehicle tracking, IoT weather sensor integration,
    a complex shift coordination calendar, automated weather alerts via WebSockets, document generation,
    multi-factor authentication with role-based access, and bilingual responsive UI.
    `,
    href: new URL('https://asierortiz.com/blog/rescuing-a-legacy-operations-platform/'),
    languages: [
      { language: 'Angular', color: '#DD0031' },
      { language: 'TypeScript', color: '#3178C6' },
      { language: 'Node.js', color: '#339933' },
      { language: 'Express', color: '#259dff' },
      { language: 'PostgreSQL', color: '#336791' },
      { language: 'PostGIS', color: '#65974A' },
      { language: 'Socket.io', color: '#25C2A0' },
      { language: 'OpenLayers', color: '#1F6B75' },
      { language: 'Docker', color: '#2496ED' },
      { language: 'JWT', color: '#FB015B' },
    ],
    type: 'mobile & web development',
    buttonText: 'Read Blog Post',
  },
  {
    image: ArabaMarket,
    title: 'Araba Market',
    description: `A hybrid mobile app for discovering local shops, producers, and services across the province of Álava.
    Features an interactive map, business directory organized by districts, and a promotional voucher system to boost local commerce.
    `,
    href: new URL('https://apps.apple.com/es/app/arabamarket/id1574698689/'),
    languages: [
      { language: 'Ionic', color: '#3880FF' },
      { language: 'Vue', color: '#41B883' },
      { language: 'Vuex', color: '#35495E' },
      { language: 'Symfony', color: '#333333' },
      { language: 'API Platform', color: '#38A9B4' },
      { language: 'PostgreSQL', color: '#336791' },
      { language: 'Leaflet', color: '#76B041' },
    ],
    type: 'mobile & web development',
    buttonText: 'Available on App Store',
    buttonIcon: 'tdesign:logo-apple-filled',
  },
];

export default projectData;
