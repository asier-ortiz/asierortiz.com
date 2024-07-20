export interface academicItem {
    title: string;
    center: string;
    description: string;
    date: string;
}

const academicData: academicItem[] = [
    {
        date: "2023",
        title: "Higher Technician in Web Application Development",
        center: "BirtLH",
        description: "This degree focuses on the creation and maintenance of web applications and services, " +
            "covering both frontend and backend. I learned web programming languages, interface design, " +
            "and server management, which prepared me to develop dynamic and secure websites and web applications " +
            "tailored to the needs of the current market."    },
    {
        date: "2021",
        title: "Higher Technician in Multiplatform Application Development",
        center: "Egibide Arriaga",
        description: "In this degree, I studied techniques and tools to create applications that work on different " +
            "devices and operating systems, such as Android, iOS, and Windows. " +
            "I acquired knowledge in programming, interface design, and database management, " +
            "as well as gained practical experience in real-world environments to develop efficient " +
            "and functional cross-platform solutions."
    },
];


export default academicData;
