export interface academicItem {
    title: string;
    center: string;
    description: string;
    date: string;
}

const academicData: academicItem[] = [
    {
        date: "2025",
        title: "Professional Program in Artificial Intelligence and Data Science",
        center: "UNIR - International University of La Rioja",
        description: "I am currently studying this program, specializing in Artificial Intelligence " +
            "and Data Science. Through it, I am developing skills in the design, programming, and deployment " +
            "of AI algorithms (Machine Learning) and intelligent systems applied in the business world. " +
            "I am gaining a deep understanding of AI implementation in companies and institutions, " +
            "learning to analyze risks, apply methodologies, and explore AI-driven solutions. " +
            "The curriculum covers essential topics such as neural networks, Natural Language Processing (NLP), " +
            "and scalable analytics. Additionally, I am working with industry-standard tools and frameworks, " +
            "including Python, TensorFlow, Keras, pandas, and NoSQL databases, equipping myself with " +
            "the necessary skills to tackle AI and Big Data challenges."
    },
    {
        date: "2023",
        title: "Higher Technician in Web Application Development",
        center: "BirtLH",
        description: "This degree focuses on the creation and maintenance of web applications and services, " +
            "covering both frontend and backend. I learned web programming languages, interface design, " +
            "and server management, which prepared me to develop dynamic and secure websites and web applications " +
            "tailored to the needs of the current market."
    },
    {
        date: "2021",
        title: "Higher Technician in Cross-Platform Application Development",
        center: "Egibide Arriaga",
        description: "In this degree, I studied techniques and tools to create applications that work on different " +
            "devices and operating systems, such as Android, iOS, and Windows. " +
            "I acquired knowledge in programming, interface design, and database management, " +
            "as well as gained practical experience in real-world environments to develop efficient " +
            "and functional cross-platform solutions."
    },
];


export default academicData;
