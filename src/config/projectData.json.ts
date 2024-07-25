import type { ImageMetadata } from "astro";
import AirportFinder from "@images/projects/airport-finder.webp";
import PollMaker from "@images/projects/poll-maker.webp";
import CumpleTuSuenio from "@images/projects/cumple-tu-suenio.webp";
import TasksApp from "@images/projects/tasks-app.webp";
import Euskoplan from "@images/projects/euskoplan.webp";
import RunningTracker from "@images/projects/running-tracker.webp";
import Trivial from "@images/projects/trivial.webp";
import ArabaMarket from "@images/projects/araba-market.webp";
import Arkanoid from "@images/projects/arkanoid.webp";
import Portfolio from "@images/projects/portfolio.webp";

export interface ProjectItem {
  image: ImageMetadata;
  title: string;
  description: string;
  href: URL;
  languages: Language[];
  type: string;
  buttonText: string;
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
    languages: [
      { language: "JavaScript", "color": "#f1e05a" },
      { language: "HTML", "color": "#e34c26" },
      { language: "Sass", "color": "#CC6699" },
      { language: "Leaflet", "color": "#76B041" }
    ],
    type: "web development",
    buttonText: "View on GitHub"
  },
  {
    image: PollMaker,
    title: "Poll Maker",
    description: `Poll Maker is a web application built with the Laravel framework for creating and managing polls, 
    featuring functions for different user roles.
    `,
    href: new URL("https://github.com/asier-ortiz/poll-maker/"),
    languages: [
      { language: "Laravel", "color": "#FF2D20" },
      { language: "PHP", "color": "#4F5D95" },
      { language: "MySQL", "color": "#00758F" },
      { language: "HTML", "color": "#E34F26" },
      { language: "Bootstrap", "color": "#7952B3" }
    ],
    type: "web development",
    buttonText: "View on GitHub"
  },
  {
    image: CumpleTuSuenio,
    title: "Cumple tu Sueño",
    description: `"Cumple tu sueño" is a project made with Django that allows the management of 
    employees, suppliers, products, keep the track of sales, visualize data in graphs and import and export files in 
    CSV format. It stores all the data in an embedded SQLite database.
    `,
    href: new URL("https://github.com/asier-ortiz/cumple-tu-suenio/"),
    languages: [
      { language: "Django", "color": "#092E20" },
      { language: "Python", "color": "#306998" },
      { language: "SQLite", "color": "#003B57" },
      { language: "HTML", "color": "#E34F26" },
      { language: "Bootstrap", "color": "#563D7C" }
    ],
    type: "web development",
    buttonText: "View on GitHub"
  },
  {
    image: TasksApp,
    title: "Tasks App",
    description: `Tasks App is an uncomplicated web application build with Angular and Material UI library that consumes
     Google Tasks API to store, edit, delete and view your own tasks.
    `,
    href: new URL("https://github.com/asier-ortiz/tasks-app/"),
    languages: [
      { language: "Angular", "color": "#DD0031" },
      { language: "TypeScript", "color": "#3178C6" },
      { language: "Material UI", "color": "#0081CB" },
      { language: "HTML", "color": "#E34F26" }
    ],
    type: "web development",
    buttonText: "View on GitHub"
  },
  {
    image: Euskoplan,
    title: "Euskoplan",
    description: `Discover the beauty of the Basque Country with Euskoplan, an interactive web platform designed for 
    tourism enthusiasts. Create personalized itineraries, explore popular destinations and share your travel plans 
    with other users.
    `,
    href: new URL("https://github.com/asier-ortiz/euskoplan-api/"),
    languages: [
      { language: "Laravel", "color": "#FF2D20" },
      { language: "Angular", "color": "#DD0031" },
      { language: "PHP", "color": "#4F5D95" },
      { language: "TypeScript", "color": "#3178C6" },
      { language: "Material UI", "color": "#0081CB" },
      { language: "Bootstrap", "color": "#563D7C" },
      { language: "CSS", "color": "#563d7c" },
      { language: "HTML", "color": "#E34F26" },
      { language: "Mapbox", "color": "#4264FB" }
    ],
    type: "web development",
    buttonText: "View on GitHub"
  },
  {
    image: Portfolio,
    title: "Meta Portfolio Project",
    description: `Ever wondered what it’s like to see a portfolio within a portfolio? Welcome to the Meta Portfolio, 
    where clicking on a project link takes you to... another portfolio! It's like "Inception" for web developers. 
    Dive into this rabbit hole and enjoy the recursive fun.
    `,
    href: new URL("https://asierortiz.dev/"),
    languages: [
      { language: "Astro", "color": "#FF5A03" },
      { language: "TypeScript", "color": "#3178C6" },
      { language: "HTML", "color": "#E34F26" },
      { language: "TailwindCSS", "color": "#06B6D4" },
      { language: "Sass", "color": "#CC6699" },
    ],
    type: "web development",
    buttonText: "Visit Website"
  },
  {
    image: RunningTracker,
    title: "Running Tracker",
    description: `Running Tracker is an iPhone app to track your running workouts. 
    It allows you to view your route on a map in real time, see the steps and distance traveled, 
    check the number of calories burned and save each training session into an embedded database.
    `,
    href: new URL("https://github.com/asier-ortiz/running-tracker/"),
    languages: [
      { language: "Swift", "color": "#F05138" },
      { language: "Realm Swift", "color": "#5C2D91" },
      { language: "Apple Maps", "color": "#007AFF" }
    ],
    type: "mobile development",
    buttonText: "View on GitHub"
  },
  {
    image: Trivial,
    title: "Trivial",
    description: `Trivial for Android is a quiz-type game with dozens of questions divided into six different categories
      and that includes an embedded database that stores your best scores.
    `,
    href: new URL("https://github.com/asier-ortiz/trivial/"),
    languages: [
      { language: "Kotlin", "color": "#A97BFF" },
      { language: "Realm Kotlin", "color": "#5C2D91" }
    ],
    type: "mobile development",
    buttonText: "View on GitHub"
  },
  {
    image: ArabaMarket,
    title: "Araba Market",
    description: `Araba Market is a hybrid app to find shops and services in the province of Álava. 
    Developed with the help of my colleagues during my internship at Veiss Comunicación.
    `,
    href: new URL("https://apps.apple.com/es/app/arabamarket/id1574698689/"),
    languages: [
      { language: "JavaScript", "color": "#f1e05a" },
      { language: "HTML", "color": "#e34c26" },
      { language: "CSS", "color": "#563d7c" },
      { language: "Ionic", "color": "#3880FF" },
      { language: "Vue", "color": "#41B883" },
      { language: "Leaflet", "color": "#76B041" }
    ],
    type: "mobile development",
    buttonText: "Download App"
  },
  {
    image: Arkanoid,
    title: "Arkanoid",
    description: `Arkanoid is a classic arcade game developed using Unity and Firebase. 
    Players can progress through multiple levels and see their scores in a ranking stored in Firebase.
  `,
    href: new URL("https://github.com/asier-ortiz/arkanoid"),
    languages: [
      { language: "Unity", color: "#f1e05a" },
      { language: "Firebase", color: "#FF7300" }
    ],
    type: "mobile development",
    buttonText: "View on GitHub"
  }

];

export default projectData;
