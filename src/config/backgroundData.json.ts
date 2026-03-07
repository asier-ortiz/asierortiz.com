export interface academicItem {
  title: string;
  center: string;
  description: string;
  date: string;
}

const academicData: academicItem[] = [
  {
    date: '2025',
    title: 'Professional Program in Artificial Intelligence and Data Science',
    center: 'UNIR - International University of La Rioja',
    description:
      'Machine Learning model design and deployment, working with Python, TensorFlow, PyTorch, and NLP ' +
      'to build scalable AI solutions for business applications.',
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
      'Cross-platform development for Android, iOS, and Windows with hands-on experience ' +
      'in programming, UI design, and database management through real-world projects.',
  },
];

export default academicData;
