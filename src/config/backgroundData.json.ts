export interface academicItem {
  title: string;
  center: string;
  description: string;
  /** Year of completion; the expected one while `ongoing`. */
  date: string;
  /** Still in progress: the timeline marks it live and labels its year "Expected". */
  ongoing?: boolean;
}

const academicData: academicItem[] = [
  {
    date: '2027',
    ongoing: true,
    title: 'Advanced Program in Cloud Architecture',
    center: 'UNIR - International University of La Rioja',
    description:
      'Cloud architecture design and deployment on AWS and Azure, ' +
      'covering microservices, serverless, containers, and DevOps, ' +
      'building scalable and secure systems with infrastructure as code.',
  },
  {
    date: '2025',
    title: 'Professional Program in Artificial Intelligence and Data Science',
    center: 'UNIR - International University of La Rioja',
    description:
      'Machine Learning model design and deployment, working with TensorFlow and PyTorch ' +
      'to build AI systems applied to real business problems.',
  },
  {
    date: '2023',
    title: 'Higher Vocational Diploma in Web Application Development',
    center: 'UNIR - International University of La Rioja',
    description:
      'Full-stack web development covering frontend, backend, and server management, ' +
      'building dynamic and secure web applications with modern frameworks.',
  },
  {
    date: '2021',
    title: 'Higher Vocational Diploma in Cross-Platform Application Development',
    center: 'Egibide',
    description:
      'Hands-on development of Android, iOS, and Windows applications, covering UI design, ' +
      'database management, and end-to-end project delivery.',
  },
];

export default academicData;
