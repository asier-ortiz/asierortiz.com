export interface usesSubItem {
    title: string;
    items: string[];
}

export interface usesItem {
    sectionTitle: string;
    items: (string | usesSubItem)[];
}

const usesData: usesItem[] = [
    {
        sectionTitle: "Development",
        items: [
            {
                title: "Languages",
                items: ["PHP", "Java", "Python", "JavaScript", "TypeScript"],
            },
            {
                title: "Frontend",
                items: ["Vue 2, 3", "Angular 14, 15"],
            },
            {
                title: "Backend",
                items: ["Laravel 9, 10", "Symfony 6", "Django 4"],
            },
            {
                title: "Styling",
                items: ["CSS3", "Bootstrap 5"],
            },
            {
                title: "Database",
                items: ["MySQL", "Oracle"],
            },
            {
                title: "IDE",
                items: ["Cursor", "WebStorm", "PhpStorm", "PyCharm", "Android Studio", "Xcode"],
            },
            {
                title: "Terminal",
                items: ["iTerm2", "OhMyZsh", "Powerlevel10k", "zsh-autosuggestions", "zsh-completions", "zsh-fast-syntax-highlighting"],
            },
            {
                title: "Services & Tools",
                items: ["Docker", "Git", "GitHub", "GitKraken", "Postman", "ChatGPT"],
            },
            {
                title: "Applications",
                items: ["Mozilla Firefox", "Tidal Music", "Discord"],
            },
            {
                title: "Learning",
                items: ["Astro", "TailwindCSS", "Redis"],
            },
        ],
    },
    {
        sectionTitle: "Setup",
        items: [
            "Mac Studio M1 Max 10-core CPU 32-core GPU 32GB Unified Memory 1TB SSD Storage",
            "MacBook Air M1 8-core CPU 8-Core GPU 16GB Unified Memory 512GB SSD Storage (Rose Gold 😎)",
            "LG Ergo 32UN880W-B 3840x2160 @60Hz",
            "Dell UltraSharp UW3417W 3440x1440 @60Hz",
            "BenQ PD2700U 3840x2160 @60Hz (Portrait)",
            "BenQ ScreenBar Plus",
            "Logitech MX Keys",
            "Logitech G502 X",
            "Logitech Master MX 3",
            "Focusrite Scarlett Solo 2nd gen",
            "Sennheiser HD 598",
            "Rode NT1 Signature Black",
            "HomePod mini",
            "AirPods Pro 2nd gen",
            "LaCie Rugged USB3 4TB (Time Machine)",
            "iPhone 13 Pro",
            "iPhone 11 Pro (Continuity Camera)",
            "Synology RT2600AC",
            "Noblechairs Legend Black Edition",
        ],
    },
];

export default usesData;
