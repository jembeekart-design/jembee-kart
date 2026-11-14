export type ExploreCategoryRecord = {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  topics: string[];
  schoolSpecial?: boolean;
};

export const DEFAULT_EXPLORE_CATEGORIES: ExploreCategoryRecord[] = [
  { id: "school", name: "School", description: "Nursery se Class 12 tak", iconKey: "graduation-cap", schoolSpecial: true, topics: ["Boards & Curriculums", "Schools", "Classes", "Books", "Subjects", "Chapters", "Question Answers", "Tests & Homework"] },
  { id: "agriculture", name: "कृषि", description: "खेती और किसान शिक्षा", iconKey: "sprout", topics: ["फसल और बीज", "जैविक खेती", "खाद और मिट्टी", "सिंचाई", "कृषि मशीनें", "सरकारी योजनाएँ"] },
  { id: "college", name: "College", description: "Graduation, PG aur Diploma", iconKey: "book-open", topics: ["Courses", "Subjects", "Semester", "Study Notes", "Lectures", "Exams"] },
  { id: "competitive", name: "Competitive Exams", description: "प्रतियोगी परीक्षा की तैयारी", iconKey: "trophy", topics: ["JEE & NEET", "SSC & Railway", "UPSC & State PSC", "Banking", "CUET", "Mock Tests"] },
  { id: "technology", name: "Computer & AI", description: "Digital aur technology skills", iconKey: "laptop", topics: ["Basic Computer", "Coding", "AI Tools", "Web Development", "Cyber Safety"] },
  { id: "skills", name: "Skill Training", description: "काम सीखें और हुनर बढ़ाएँ", iconKey: "wrench", topics: ["Electrician", "Plumbing", "Mobile Repair", "Graphic Design", "Digital Marketing"] },
  { id: "animal", name: "पशुपालन", description: "डेयरी और पशु देखभाल", iconKey: "paw-print", topics: ["गाय-भैंस", "बकरी पालन", "मुर्गी पालन", "डेयरी प्रबंधन", "पशु पोषण"] },
  { id: "health", name: "Health Education", description: "सामान्य स्वास्थ्य जागरूकता", iconKey: "stethoscope", topics: ["स्वास्थ्य जागरूकता", "प्राथमिक उपचार", "पोषण", "स्वच्छता"] },
  { id: "languages", name: "Languages", description: "भाषाएँ सीखें", iconKey: "languages", topics: ["Spoken English", "Hindi Grammar", "Reading", "Writing", "अन्य भाषाएँ"] },
  { id: "business", name: "Business", description: "व्यवसाय और उद्यमिता", iconKey: "briefcase-business", topics: ["Business Basics", "Accounting", "Marketing", "Entrepreneurship"] },
  { id: "arts", name: "Art & Craft", description: "रचनात्मक कला और डिजाइन", iconKey: "palette", topics: ["Drawing", "Painting", "Craft", "Fashion Design"] },
  { id: "sports", name: "Sports & Fitness", description: "खेल, योग और फिटनेस", iconKey: "trophy", topics: ["Cricket", "Football", "Yoga", "Fitness", "Sports Skills"] },
  { id: "music", name: "Music & Dance", description: "संगीत और नृत्य सीखें", iconKey: "music", topics: ["Singing", "Instruments", "Dance", "Music Theory"] },
  { id: "environment", name: "Environment & Gardening", description: "प्रकृति, पर्यावरण और बागवानी", iconKey: "leaf", topics: ["पेड़-पौधे", "जल संरक्षण", "कचरा प्रबंधन", "जलवायु", "Kitchen Garden"] },
  { id: "general-knowledge", name: "General Knowledge & History", description: "सामान्य ज्ञान और इतिहास", iconKey: "history", topics: ["भारत का इतिहास", "विश्व इतिहास", "Current Affairs", "General Knowledge"] },
  { id: "cooking", name: "Cooking & Nutrition", description: "खाना बनाना और पोषण", iconKey: "chef-hat", topics: ["Home Cooking", "Healthy Food", "Food Safety", "Nutrition Basics"] },
  { id: "home-diy", name: "Home Skills & DIY", description: "घर के काम और DIY कौशल", iconKey: "house", topics: ["Home Repair", "Cleaning", "Basic Tools", "DIY Projects"] },
  { id: "career", name: "Career & Job Preparation", description: "करियर और नौकरी की तैयारी", iconKey: "briefcase", topics: ["Interview Skills", "Resume Writing", "Job Search", "Workplace Skills"] },
  { id: "legal-civic", name: "Legal & Civic Awareness", description: "कानूनी और नागरिक जागरूकता", iconKey: "scale", topics: ["Citizen Rights", "Public Services", "Digital Safety", "Basic Legal Awareness"] },
  { id: "kids-learning", name: "Kids Learning", description: "बच्चों के लिए सुरक्षित सीखने की सामग्री", iconKey: "baby", topics: ["Early Learning", "Stories", "Basic Maths", "Reading & Writing"] },
];
