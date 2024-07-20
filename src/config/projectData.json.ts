import type {ImageMetadata} from "astro";
import AirportFinder from "@images/projects/airport-finder.webp"
import RunningTracker from "@images/projects/running-tracker.webp"
import Trivial from "@images/projects/trivial.webp"
import ArabaMarket from "@images/projects/araba-market.webp"

export interface ProjectItem {
  image: ImageMetadata;
  title: string;
  description: string;
  href: URL;
  languages: Language[];
}

export interface Language {
  language: string;
  color: string;
}

export const projectData: ProjectItem[] = [
  {
    image: AirportFinder,
    title: "Airport Finder",
    description: `Airport finder is a web application that lets you to search among hundreds of airports around 
    the world and track thousands of flights in real time.
    `,
    href: new URL("https://github.com/asier-ortiz/airport-finder/"),
    "languages": [
      { "language": "JavaScript", "color": "#f1e05a" },
      { "language": "HTML", "color": "#e34c26" },
      { "language": "Sass", "color": "#CC6699" }
    ]
  },
  {
    image: RunningTracker,
    title: "Running Tracker",
    description: `Running Tracker is an iPhone app to track your running workouts. 
    It allows you to view your route on a map in real time, see the steps and distance traveled, 
    check the number of calories burned and save each training session into an embedded database.
    `,
    href: new URL("https://github.com/asier-ortiz/running-tracker/"),
    "languages": [
      { "language": "Swift", "color": "#F05138" },
    ]
  },
  {
    image: Trivial,
    title: "Trivial",
    description: `Trivial for Android is a quiz-type game with dozens of questions divided into six different categories
      and that includes an embedded database that stores your best scores.
    `,
    href: new URL("https://github.com/asier-ortiz/trivial/"),
    "languages": [
      { "language": "Kotlin", "color": "#A97BFF" },
    ]
  },
  {
    image: ArabaMarket,
    title: "Araba Market",
    description: `Araba Market is a hybrid app to find shops and services in the province of Álava. 
    Developed with the help of my colleagues during my internship at Veiss Comunicación.
    `,
    href: new URL("https://apps.apple.com/es/app/arabamarket/id1574698689/"),
    "languages": [
      { "language": "JavaScript", "color": "#f1e05a" },
      { "language": "HTML", "color": "#e34c26" },
      { "language": "CSS", "color": "#563d7c" },
      { "language": "Ionic", "color": "#3880FF" },
      { "language": "Vue", "color": "#41B883" },
    ]
  },
];

export default projectData;
