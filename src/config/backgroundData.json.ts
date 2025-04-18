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
        description: "Specialized in Artificial Intelligence and Data Science, focusing on the design, programming, and deployment of AI algorithms (Machine Learning) and intelligent systems applied in the business world. " +
            "Developed a deep understanding of AI implementation in companies and institutions, including risk analysis, application of methodologies, and exploration of AI-driven solutions. " +
            "The curriculum covered key areas such as neural networks, Natural Language Processing (NLP), and scalable analytics. " +
            "Worked with industry-standard tools and frameworks like Python, TensorFlow, PyTorch, pandas, and NoSQL databases, building strong skills to tackle AI and Big Data challenges."
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
        center: "Egibide",
        description: "In this degree, I studied techniques and tools to create applications that work on different " +
            "devices and operating systems, such as Android, iOS, and Windows. " +
            "I acquired knowledge in programming, interface design, and database management, " +
            "as well as gained practical experience in real-world environments to develop efficient " +
            "and functional cross-platform solutions."
    },
];


export default academicData;
