import type { ImageMetadata } from 'astro';
import ArabaMarket from '@images/projects/araba-market.webp';
import AlconFoldable from '@images/projects/alcon-foldable.webp';
import AlconPhones from '@images/projects/alcon-phones.webp';
import AlconTablet from '@images/projects/alcon-tablet.webp';
import Nieves from '@images/projects/nieves.webp';
import FlareWatch from '@images/projects/flarewatch.webp';
import VGarbi from '@images/projects/vgarbi.webp';

export interface GalleryFrame {
  src: ImageMetadata;
  /** What the screenshot shows; the project name is already the heading next to it. */
  alt: string;
}

export interface ProjectItem {
  /** Gallery frames; the first one is shown on load and a single frame means no carousel. */
  images: GalleryFrame[];
  title: string;
  description: string;
  /** A same-site path such as /blog/<slug>/, or an absolute URL, which opens in a new tab. */
  href?: string;
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
    images: [
      {
        src: FlareWatch,
        alt: 'FlareWatch on two phones: a flare-risk score with recommendations, and monthly symptom and lifestyle trend charts.',
      },
    ],
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
      { language: 'PostgreSQL', color: '#336791' },
      { language: 'SQLAlchemy', color: '#D71F00' },
      { language: 'Alembic', color: '#6BA81E' },
      { language: 'scikit-learn', color: '#F7931E' },
      { language: 'PyTorch', color: '#EE4C2C' },
      { language: 'MLflow', color: '#0194E2' },
      { language: 'Docker', color: '#2496ED' },
    ],
    type: ['mobile & web development', 'data science & machine learning'],
    buttonText: 'In Development',
    buttonIcon: 'tdesign:code',
  },
  {
    images: [
      {
        src: AlconFoldable,
        alt: 'ALCON on a foldable: live patrol tracking on the N-622 with speed and distance, and a finished surveillance with its route and the roads covered.',
      },
      {
        src: AlconPhones,
        alt: 'ALCON on three phones: the home screen with surveillances, incidents and emergencies, the list of past patrols, and the settings menu.',
      },
      {
        src: AlconTablet,
        alt: 'ALCON on a tablet: patrol tracking on the A-1 with speed, distance, kilometre point, and pause and stop controls.',
      },
    ],
    title: 'ALCON',
    description: `An offline-first Android app for road surveillance teams at the Provincial Council of Álava.
    Features real-time GPS tracking with automatic road and kilometer-point detection, incident and emergency reporting with photos,
    voice commands for hands-free operation, biometric authentication, and automatic sync when connectivity is restored.
    `,
    href: '/blog/building-offline-first-android-field-ops/',
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
    images: [
      {
        src: Nieves,
        alt: 'The winter road operations platform on a desktop, a tablet and a phone: the shift schedule, weather station readings and road status.',
      },
    ],
    title: 'Nieves',
    description: `A web platform for coordinating critical winter road operations at the Provincial Council of Álava.
    Modernizes a 15-year-old legacy desktop system with real-time GPS vehicle tracking, IoT weather sensor integration,
    a complex shift coordination calendar, automated weather alerts via WebSockets, document generation,
    multi-factor authentication with role-based access, and a responsive UI.
    `,
    href: '/blog/schema-only-existed-in-production/',
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
    images: [
      {
        src: VGarbi,
        alt: 'The WhatsApp bot on two phones: a chat asking for the location of a problem, and the report form with type, details and a photo.',
      },
    ],
    title: 'VGarbi',
    description: `A WhatsApp bot for reporting street-cleaning and waste-collection problems in Vitoria-Gasteiz.
    Features a bilingual Spanish and Basque conversation, a native WhatsApp form with the full incident taxonomy and a photo,
    address geocoding with service-area validation, tracking references for every report,
    and automatic forwarding to the cleaning contractor's incident platform.
    `,
    href: '/blog/whatsapp-as-the-front-end/',
    languages: [
      { language: 'Python', color: '#3776AB' },
      { language: 'FastAPI', color: '#009688' },
      { language: 'PostgreSQL', color: '#336791' },
      { language: 'PostGIS', color: '#65974A' },
      { language: 'WhatsApp Cloud API', color: '#25D366' },
      { language: 'WhatsApp Flows', color: '#128C7E' },
      { language: 'Docker', color: '#2496ED' },
    ],
    type: 'mobile & web development',
    buttonText: 'Read Blog Post',
  },
  {
    images: [
      {
        src: ArabaMarket,
        alt: "Araba Market on three phones: a map of nearby shops, a producer's profile, and the list of local businesses.",
      },
    ],
    title: 'Araba Market',
    description: `A hybrid mobile app for discovering local shops, producers, and services across the province of Álava.
    Features an interactive map, business directory organized by districts, and a promotional voucher system to boost local commerce.
    `,
    href: 'https://apps.apple.com/es/app/arabamarket/id1574698689/',
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
