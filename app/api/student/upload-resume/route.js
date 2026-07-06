import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Parse PDF
    const buffer = await file.arrayBuffer();
    const pdfData = await pdf(Buffer.from(buffer));
    const text = pdfData.text;

    console.log(' PDF Text extracted, length:', text.length);
    console.log(' First 500 chars:', text.substring(0, 500));

    // Extract skills (case-insensitive matching) - COMPREHENSIVE LIST
    const skillKeywords = [
      // Core Programming Languages
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Golang', 'Rust',
      'TypeScript', 'Scala', 'Perl', 'Haskell', 'Elixir', 'Dart', 'R', 'MATLAB', 'Objective-C', 'Assembly',
      'VB.NET', 'Visual Basic', 'Fortran', 'COBOL', 'Lua', 'Julia', 'Groovy', 'F#', 'Clojure', 'Erlang',
      
      // Web Frontend
      'React', 'ReactJS', 'React.js', 'React Native', 'Next.js', 'NextJS', 'Angular', 'AngularJS', 'Vue', 'VueJS', 'Vue.js',
      'Svelte', 'SvelteKit', 'Ember', 'Ember.js', 'Backbone.js', 'jQuery', 'HTML', 'HTML5', 'CSS', 'CSS3',
      'Tailwind', 'TailwindCSS', 'Bootstrap', 'Material UI', 'MUI', 'Ant Design', 'Chakra UI', 'Sass', 'SCSS', 'Less',
      'Styled Components', 'Emotion', 'Web Components', 'Shadow DOM', 'WebAssembly', 'WASM',
      
      // Web Backend
      'Node.js', 'NodeJS', 'Express', 'ExpressJS', 'Koa', 'Fastify', 'NestJS', 'Django', 'Flask', 'FastAPI',
      'Spring', 'SpringBoot', 'Spring Boot', 'ASP.NET', 'ASP.NET Core', '.NET', '.NET Core', 'Laravel', 'Symfony',
      'Ruby on Rails', 'Rails', 'Sinatra', 'Phoenix', 'Gin', 'Echo', 'Fiber', 'Actix', 'Rocket',
      
      // Databases
      'MongoDB', 'SQL', 'MySQL', 'PostgreSQL', 'SQLite', 'Oracle', 'Microsoft SQL Server', 'MSSQL', 'MariaDB',
      'Redis', 'Memcached', 'Cassandra', 'DynamoDB', 'CouchDB', 'Neo4j', 'InfluxDB', 'TimescaleDB',
      'Elasticsearch', 'Solr', 'Firebase', 'Firestore', 'Supabase', 'PlanetScale', 'Fauna',
      
      // State Management
      'Redux', 'Redux Toolkit', 'MobX', 'Zustand', 'Recoil', 'Jotai', 'Context API', 'Vuex', 'Pinia', 'NgRx',
      
      // ORM & Query Builders
      'Prisma', 'Mongoose', 'Sequelize', 'TypeORM', 'Drizzle', 'Knex', 'Bookshelf', 'Hibernate', 'JPA',
      'Entity Framework', 'Dapper', 'ActiveRecord', 'SQLAlchemy', 'Peewee',
      
      // API & GraphQL
      'REST', 'RESTful', 'API', 'GraphQL', 'Apollo', 'Relay', 'GRPC', 'SOAP', 'WebSocket', 'Socket.io',
      'tRPC', 'Swagger', 'OpenAPI', 'Postman', 'Insomnia',
      
      // Cloud Platforms
      'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP', 'Google Cloud', 'IBM Cloud',
      'DigitalOcean', 'Linode', 'Heroku', 'Vercel', 'Netlify', 'Railway', 'Render', 'Fly.io', 'Cloudflare',
      
      // AWS Services
      'EC2', 'S3', 'Lambda', 'RDS', 'DynamoDB', 'CloudFront', 'Route 53', 'ECS', 'EKS', 'Elastic Beanstalk',
      'API Gateway', 'SNS', 'SQS', 'CloudWatch', 'IAM', 'VPC', 'CloudFormation', 'SAM',
      
      // DevOps & CI/CD
      'Docker', 'Kubernetes', 'K8s', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jenkins', 'CircleCI', 'Travis CI',
      'GitHub Actions', 'GitLab CI', 'Azure DevOps', 'TeamCity', 'Bamboo', 'ArgoCD', 'Terraform', 'Ansible',
      'Puppet', 'Chef', 'Vagrant', 'Helm', 'Nginx', 'Apache', 'CI/CD', 'Continuous Integration',
      
      // Testing
      'Jest', 'Mocha', 'Chai', 'Jasmine', 'Karma', 'Cypress', 'Playwright', 'Selenium', 'Puppeteer', 'TestCafe',
      'JUnit', 'TestNG', 'PyTest', 'unittest', 'RSpec', 'PHPUnit', 'Vitest', 'Testing Library', 'Enzyme',
      
      // Build Tools
      'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild', 'SWC', 'Babel', 'Turbopack', 'Gulp', 'Grunt',
      'npm', 'yarn', 'pnpm', 'Maven', 'Gradle', 'Make', 'CMake', 'Cargo',
      
      // Code Quality
      'ESLint', 'Prettier', 'TSLint', 'StyleLint', 'SonarQube', 'CodeClimate', 'Husky', 'lint-staged',
      
      // Machine Learning & AI
      'Machine Learning', 'ML', 'AI', 'Artificial Intelligence', 'Deep Learning', 'Neural Networks', 'CNN', 'RNN',
      'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'NLTK', 'spaCy',
      'Hugging Face', 'Transformers', 'BERT', 'GPT', 'Computer Vision', 'NLP', 'Natural Language Processing',
      'OpenCV', 'YOLO', 'ResNet', 'GANs', 'Reinforcement Learning', 'AutoML',
      
      // Data Science & Analytics
      'Data Science', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Bokeh', 'Jupyter', 'JupyterLab',
      'Apache Spark', 'Hadoop', 'Hive', 'Pig', 'Tableau', 'Power BI', 'Looker', 'Databricks', 'Airflow',
      'dbt', 'Great Expectations', 'Snowflake', 'BigQuery', 'Redshift',
      
      // Mobile Development
      'React Native', 'Flutter', 'Ionic', 'Xamarin', 'SwiftUI', 'UIKit', 'Android Studio', 'Jetpack Compose',
      'Cordova', 'Capacitor', 'Expo', 'NativeScript',
      
      // Design & UI/UX
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Blender',
      'UI/UX', 'User Experience', 'User Interface', 'Wireframing', 'Prototyping', 'Design Systems',
      
      // Operating Systems
      'Linux', 'Ubuntu', 'Debian', 'CentOS', 'RHEL', 'Fedora', 'Arch Linux', 'macOS', 'Windows', 'Unix',
      
      // Shell & Scripting
      'Bash', 'Shell Script', 'PowerShell', 'Zsh', 'Fish', 'Awk', 'Sed', 'grep',
      
      // Project Management & Agile
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Trello', 'Asana', 'Monday.com', 'ClickUp',
      'Azure Boards', 'Linear', 'Shortcut', 'Basecamp',
      
      // Version Control
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'Perforce',
      
      // Security & Authentication
      'OAuth', 'JWT', 'Auth0', 'Okta', 'SAML', 'SSO', 'LDAP', 'SSL', 'TLS', 'HTTPS', 'Encryption',
      'Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'OWASP', 'Security Auditing',
      
      // Blockchain & Web3
      'Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3', 'Bitcoin', 'NFT', 'DeFi',
      'Hyperledger', 'Truffle', 'Hardhat', 'Metamask',
      
      // Game Development
      'Unity', 'Unreal Engine', 'Godot', 'GameMaker', 'Phaser', 'Three.js', 'WebGL', 'OpenGL', 'DirectX',
      
      // IoT & Embedded
      'IoT', 'Arduino', 'Raspberry Pi', 'ESP32', 'MQTT', 'Embedded Systems', 'ARM', 'STM32',
      
      // Communication & Collaboration
      'Slack', 'Microsoft Teams', 'Discord', 'Zoom', 'Google Meet', 'Notion', 'Miro', 'FigJam',
      
      // Other Technologies
      'Microservices', 'Serverless', 'Event-Driven', 'Message Queue', 'RabbitMQ', 'Kafka', 'Celery',
      'WebRTC', 'PWA', 'Progressive Web Apps', 'SEO', 'Accessibility', 'WCAG', 'Responsive Design',
      'Performance Optimization', 'Code Review', 'Pair Programming', 'TDD', 'BDD', 'DDD',
      'Clean Code', 'SOLID', 'Design Patterns', 'Algorithms', 'Data Structures', 'OOP', 'Functional Programming',
      
      // Certifications (common in resumes)
      'AWS Certified', 'Google Cloud Certified', 'Azure Certified', 'Cisco Certified', 'CompTIA',
      'Oracle Certified', 'Certified Kubernetes', 'PMP', 'Scrum Master', 'Product Owner', 'Six Sigma',
    ];
    
    const textLower = text.toLowerCase();
    const foundSkills = new Set();
    
    skillKeywords.forEach(skill => {
      // Create regex pattern for case-insensitive whole word matching
      // Handle special characters in skill names (like . + # / )
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
      
      if (pattern.test(textLower)) {
        // Normalize the skill name (use the standard version from our list)
        if (skill.toLowerCase().includes('react') && !skill.toLowerCase().includes('native')) {
          foundSkills.add('React');
        } else if (skill.toLowerCase().includes('next')) {
          foundSkills.add('Next.js');
        } else if (skill.toLowerCase().includes('node')) {
          foundSkills.add('Node.js');
        } else if (skill.toLowerCase().includes('express')) {
          foundSkills.add('Express');
        } else if (skill.toLowerCase().includes('tailwind')) {
          foundSkills.add('Tailwind CSS');
        } else if (skill.toLowerCase().includes('typescript')) {
          foundSkills.add('TypeScript');
        } else if (skill.toLowerCase() === 'ml' || skill.toLowerCase() === 'machine learning') {
          foundSkills.add('Machine Learning');
        } else if (skill.toLowerCase() === 'ai' || skill.toLowerCase() === 'artificial intelligence') {
          foundSkills.add('AI');
        } else if (skill.toLowerCase().includes('golang')) {
          foundSkills.add('Go');
        } else if (skill.toLowerCase().includes('springboot') || skill.toLowerCase().includes('spring boot')) {
          foundSkills.add('Spring Boot');
        } else if (skill.toLowerCase() === 'k8s') {
          foundSkills.add('Kubernetes');
        } else if (skill.toLowerCase().includes('aws')) {
          foundSkills.add('AWS');
        } else if (skill.toLowerCase().includes('azure')) {
          foundSkills.add('Azure');
        } else if (skill.toLowerCase().includes('gcp') || skill.toLowerCase().includes('google cloud')) {
          foundSkills.add('Google Cloud');
        } else {
          foundSkills.add(skill);
        }
      }
    });
    
    // Additional: Extract from SKILLS section (common format in resumes)
    const skillsSection = text.match(/(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|TECHNOLOGIES)[\s:]*\n([^\n]*(?:\n(?![A-Z]{4,})[^\n]*)*)/i);
    if (skillsSection && skillsSection[1]) {
      const skillsText = skillsSection[1];
      // Split by common separators: comma, pipe, bullet, semicolon
      const extractedSkills = skillsText.split(/[,|•·\n;]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 50);
      
      extractedSkills.forEach(skill => {
        // Check if this extracted skill matches any of our known skills (fuzzy match)
        const skillLower = skill.toLowerCase();
        skillKeywords.forEach(knownSkill => {
          if (skillLower.includes(knownSkill.toLowerCase()) || knownSkill.toLowerCase().includes(skillLower)) {
            foundSkills.add(knownSkill);
          }
        });
        
        // Also add the skill as-is if it looks like a valid skill (capitalized, tech-like)
        if (/^[A-Z]/.test(skill) && !/^(and|or|with|using|in|at|for|the|a|an)$/i.test(skill)) {
          foundSkills.add(skill);
        }
      });
      console.log(' Skills section found, extracted additional skills');
    }
    
    const skills = Array.from(foundSkills);
    console.log(' Total skills found:', skills.length);
    console.log(' Skills:', skills);

    // Extract LinkedIn
    let linkedin_url = null;
    const linkedinMatch = text.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?)/i);
    if (linkedinMatch) {
      linkedin_url = linkedinMatch[1];
    }
    console.log(' LinkedIn found:', linkedin_url);

    // Extract Email (NEW!)
    let email = null;
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      email = emailMatch[1];
    }
    console.log(' Email found:', email);

    // Extract GitHub (NEW!)
    let github_url = null;
    const githubMatch = text.match(/(https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9-]+\/?)/i);
    if (githubMatch) {
      github_url = githubMatch[1];
    }
    console.log(' GitHub found:', github_url);

    // Extract GPA/CGPA - Keep ORIGINAL value (NO conversion!)
    let gpa = null;
    const gpaPatterns = [
      /CGPA[:\s-]*(\d+\.?\d*)/i,           // CGPA: 8.9 or CGPA - 8.9
      /GPA[:\s-]*(\d+\.?\d*)/i,            // GPA: 3.8
      /(\d\.\d+)\s*\/\s*4\.?0?/i,          // 3.8/4.0
      /(\d\.\d+)\s*\/\s*10\.?0?/i,         // 8.9/10.0
      /Grade[:\s-]*(\d+\.?\d*)/i,          // Grade: 8.9
    ];
    for (const pattern of gpaPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        gpa = match[1]; // Store AS-IS, no conversion
        break;
      }
    }
    console.log(' GPA/CGPA found (original):', gpa);

    // Extract University - Enhanced patterns
    let university = null;
    const universityPatterns = [
      // Specific known universities
      /(?:Army Institute of Technology|AIT Pune)/i,
      /(?:Indian Institute of Technology|IIT)\s*[A-Za-z]*/i,
      /(?:National Institute of Technology|NIT)\s*[A-Za-z]*/i,
      /(?:Birla Institute of Technology|BIT)/i,
      /(?:VIT|Vellore Institute of Technology)/i,
      /(?:MIT|Massachusetts Institute of Technology)/i,
      /(?:Stanford University|Stanford)/i,
      /(?:Harvard University|Harvard)/i,
      // Generic patterns
      /([A-Za-z\s]+University)(?:\n|,|Bachelor|B\.E\.|B\.S\.|B\.Tech|Degree|20\d{2})/i,
      /([A-Za-z\s]+Institute of Technology)(?:\n|,|Bachelor|B\.E\.|B\.S\.|B\.Tech|20\d{2})/i,
      /([A-Za-z\s]+College of Engineering)/i,
      /([A-Za-z\s]+Engineering College)/i,
      // Education section header
      /EDUCATION[:\s\n]+([A-Za-z\s,]+?)(?:\n|Bachelor|B\.E\.|B\.S\.|B\.Tech|20\d{2})/i,
    ];
    for (const pattern of universityPatterns) {
      const match = text.match(pattern);
      if (match) {
        university = match[1] ? match[1].trim() : match[0].trim();
        // Clean up university name
        university = university.replace(/EDUCATION[:\s]*/i, '').trim();
        if (university.length > 5 && university.length < 100) {
          break;
        }
      }
    }
    console.log(' University found:', university);

    // Extract Degree - Enhanced patterns
    let degree = null;
    const degreePatterns = [
      // Full degree names
      /(Bachelor of Engineering in [A-Za-z\s&]+)/i,
      /(Bachelor of Technology in [A-Za-z\s&]+)/i,
      /(Bachelor of Science in [A-Za-z\s&]+)/i,
      /(Bachelor of Computer Science)/i,
      /(Bachelor of Arts in [A-Za-z\s&]+)/i,
      /(Master of [A-Za-z\s&]+)/i,
      // Abbreviated forms
      /(B\.?E\.?\s*(?:in\s+)?[A-Za-z\s&]+(?:Engineering|Science|Technology))/i,
      /(B\.?Tech\.?\s*(?:in\s+)?[A-Za-z\s&]+)/i,
      /(B\.?S\.?\s*(?:in\s+)?[A-Za-z\s&]+)/i,
      /(M\.?Tech\.?\s*(?:in\s+)?[A-Za-z\s&]+)/i,
      /(M\.?S\.?\s*(?:in\s+)?[A-Za-z\s&]+)/i,
      /(M\.?B\.?A\.?)/i,
      /(B\.?B\.?A\.?)/i,
      // Common specific degrees
      /(B\.?E\.?\s*-?\s*Computer Science)/i,
      /(B\.?Tech\s*-?\s*Information Technology)/i,
    ];
    for (const pattern of degreePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        degree = match[1].trim();
        // Clean up degree name
        degree = degree.replace(/\s+/g, ' ').trim();
        if (degree.length > 3 && degree.length < 100) {
          break;
        }
      }
    }
    console.log(' Degree found:', degree);

    // Extract Major - Enhanced extraction
    let major = null;
    if (degree && degree.includes(' in ')) {
      major = degree.split(' in ')[1].trim();
      // Clean up common suffixes
      major = major.replace(/(?:Engineering|Technology|Science)$/, '').trim();
    } else {
      // Look for common majors even without degree context
      const majorPatterns = [
        /(?:Information Technology|IT)/i,
        /(?:Computer Science|CS)/i,
        /(?:Software Engineering|SE)/i,
        /(?:Computer Engineering|CE)/i,
        /(?:Electronics and Communication|ECE|E&C)/i,
        /(?:Electrical and Electronics|EEE|E&E)/i,
        /(?:Mechanical Engineering|ME)/i,
        /(?:Civil Engineering)/i,
        /(?:Data Science)/i,
        /(?:Artificial Intelligence|AI)/i,
        /(?:Machine Learning|ML)/i,
        /(?:Cybersecurity)/i,
        /(?:Business Administration)/i,
      ];
      for (const pattern of majorPatterns) {
        const majorMatch = text.match(pattern);
        if (majorMatch) {
          major = majorMatch[0];
          // Normalize abbreviations
          if (major.toLowerCase() === 'it') major = 'Information Technology';
          else if (major.toLowerCase() === 'cs') major = 'Computer Science';
          else if (major.toLowerCase() === 'se') major = 'Software Engineering';
          else if (major.toLowerCase() === 'ce') major = 'Computer Engineering';
          break;
        }
      }
    }
    console.log(' Major found:', major);

    // Extract Graduation Year
    let graduation_year = null;
    const yearPatterns = [
      /(20\d{2})\s*-\s*(20\d{2})/g,
      /(?:Expected|Graduation)[:\s]+(20\d{2})/gi,
      /\b(202[0-9])\b/g,
    ];
    for (const pattern of yearPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[matches.length - 1];
        graduation_year = match[2] || match[1];
        break;
      }
    }
    console.log(' Graduation year found:', graduation_year);

    // Calculate Current Year
    let current_year = null;
    if (graduation_year) {
      const gradYear = parseInt(graduation_year);
      const now = 2025;
      const yearsRemaining = gradYear - now;
      
      if (yearsRemaining >= 3) current_year = '1st Year';
      else if (yearsRemaining >= 2) current_year = '2nd Year';
      else if (yearsRemaining >= 1) current_year = '3rd Year';
      else if (yearsRemaining >= 0) current_year = '4th Year';
      else current_year = 'Graduate';
    }
    console.log(' Current year calculated:', current_year);

    // Extract Phone - Enhanced patterns
    let phone = null;
    const phonePatterns = [
      /(\+91[-.\s]?\d{10})/,  // Indian format with +91
      /(\+\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/,  // International
      /(\d{10})/,  // Simple 10-digit
      /(Phone|Mobile|Contact)[:\s]+(\+?\d{1,3}[-.\s]?\d{10}|\d{10})/i,  // With label
    ];
    for (const pattern of phonePatterns) {
      const phoneMatch = text.match(pattern);
      if (phoneMatch) {
        phone = phoneMatch[2] || phoneMatch[1];
        // Validate phone number (at least 10 digits)
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 10) {
          break;
        }
      }
    }
    console.log(' Phone found:', phone);

    // Extract Experience - New feature for better accuracy
    const experience = [];
    const expSection = text.match(/(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|INTERNSHIPS?)[\s\S]*?(?=EDUCATION|PROJECTS|SKILLS|ACHIEVEMENTS|$)/i);
    
    if (expSection) {
      const expText = expSection[0];
      
      // Pattern 1: Company name followed by role and duration
      const expPattern1 = /([A-Za-z\s&,\.]+(?:Inc|Ltd|LLC|Corporation|Corp|Pvt|Private|Limited|Solutions|Technologies|Services))[^\n]*\n([A-Za-z\s]+(?:Engineer|Developer|Intern|Analyst|Manager|Designer|Consultant))[^\n]*\n(?:.*?)((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\n]+(?:20\d{2}|Present))/gi;
      
      const matches1 = expText.matchAll(expPattern1);
      for (const match of matches1) {
        if (experience.length < 5) {
          experience.push({
            company: match[1].trim(),
            role: match[2].trim(),
            duration: match[3].trim()
          });
        }
      }
      
      // Pattern 2: Alternative format - Role at Company
      const expPattern2 = /([A-Za-z\s]+(?:Engineer|Developer|Intern|Analyst|Manager))\s*(?:at|@)\s*([A-Za-z\s&,\.]+)[^\n]*\n(?:.*?)((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\n]+(?:20\d{2}|Present))/gi;
      
      if (experience.length === 0) {
        const matches2 = expText.matchAll(expPattern2);
        for (const match of matches2) {
          if (experience.length < 5) {
            experience.push({
              role: match[1].trim(),
              company: match[2].trim(),
              duration: match[3].trim()
            });
          }
        }
      }
    }
    console.log(' Experience entries found:', experience.length);

    // Extract Certifications - New feature
    const certifications = [];
    const certKeywords = [
      'AWS Certified',
      'Google Cloud Certified',
      'Azure Certified',
      'Cisco Certified',
      'CompTIA',
      'Oracle Certified',
      'Certified Kubernetes',
      'PMP',
      'Scrum Master',
      'Product Owner',
      'Six Sigma',
    ];
    
    certKeywords.forEach(cert => {
      const pattern = new RegExp(`(${cert}[^\n]{0,50})`, 'i');
      const match = text.match(pattern);
      if (match) {
        certifications.push(match[1].trim());
      }
    });
    console.log(' Certifications found:', certifications.length);

    // Extract Achievements - ENHANCED for professional resumes
    const achievements = [];
    
    // Pattern 1: Hackathon/Competition achievements
    const hackathonPattern = /(?:Finalist|Winner|Ranked|Selected|Participated|Achieved)[^.!?\n]*(?:Hackathon|Competition|Contest|Challenge)[^.!?\n]*[.!?]/gi;
    const hackathonMatches = text.match(hackathonPattern) || [];
    hackathonMatches.forEach(match => {
      if (match.length > 20 && match.length < 400) {
        // Extract short title (first part before comma/colon)
        const titleMatch = match.match(/^([^:,]{10,80})/);
        const shortTitle = titleMatch ? titleMatch[1].trim() : match.substring(0, 80).trim();
        
        achievements.push({
          title: shortTitle,
          description: match.trim(),
          date: 'Extracted from resume'
        });
      }
    });
    
    // Pattern 2: Competitive Programming achievements
    const programmingPattern = /(?:Ranked|Rating|Solved|Achieved)[^.!?\n]*(?:LeetCode|Codeforces|CodeChef|HackerRank|GeeksforGeeks|InterviewBit)[^.!?\n]*[.!?]/gi;
    const programmingMatches = text.match(programmingPattern) || [];
    programmingMatches.forEach(match => {
      if (match.length > 20 && match.length < 400 && achievements.length < 10) {
        const titleMatch = match.match(/^([^:,]{10,80})/);
        const shortTitle = titleMatch ? titleMatch[1].trim() : match.substring(0, 80).trim();
        
        achievements.push({
          title: shortTitle,
          description: match.trim(),
          date: 'Extracted from resume'
        });
      }
    });
    
    // Pattern 3: ACHIEVEMENTS section parsing (NEW!)
    const achievementSection = text.match(/(?:ACHIEVEMENTS?|AWARDS?|HONORS?)[\s:]*\n([\s\S]*?)(?=\n[A-Z]{2,}|\n\n|$)/i);
    if (achievementSection && achievementSection[1]) {
      const sectionText = achievementSection[1];
      // Split by bullet points, dashes, or line breaks
      const lines = sectionText.split(/[\n]/).filter(line => line.trim().length > 20);
      
      lines.forEach(line => {
        const cleanLine = line.replace(/^[-–•*]\s*/, '').trim();
        if (cleanLine.length > 20 && cleanLine.length < 500 && achievements.length < 10) {
          // Extract year if present
          const yearMatch = cleanLine.match(/\((\d{4})\)/);
          const year = yearMatch ? yearMatch[1] : 'Extracted from resume';
          
          // Extract short title (before colon or first 60 chars)
          const titleMatch = cleanLine.match(/^([^:,]{10,60})/);
          const shortTitle = titleMatch ? titleMatch[1].trim() : cleanLine.substring(0, 60).trim();
          
          achievements.push({
            title: shortTitle,
            description: cleanLine.trim(),
            date: year
          });
        }
      });
    }
    
    // Pattern 4: Percentage/ranking achievements
    const rankPattern = /(?:top|among|ranked)\s+\d+[%\w\s]*(?:globally|nationwide|participants|students|teams)/gi;
    const rankMatches = text.match(rankPattern) || [];
    rankMatches.forEach(match => {
      if (achievements.length < 10) {
        // Find the sentence containing this match
        const sentencePattern = new RegExp(`[^.!?]*${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^.!?]*[.!?]`, 'i');
        const fullSentence = text.match(sentencePattern);
        if (fullSentence && fullSentence[0].length > 20 && fullSentence[0].length < 400) {
          // Extract short title
          const titleMatch = fullSentence[0].match(/^([^:,]{10,60})/);
          const shortTitle = titleMatch ? titleMatch[1].trim() : fullSentence[0].substring(0, 60).trim();
          
          achievements.push({
            title: shortTitle,
            description: fullSentence[0].trim(),
            date: 'Extracted from resume'
          });
        }
      }
    });
    
    console.log(' Achievements extracted:', achievements.length);

    await connectDB();

    const student = await Student.findOne({ user_id: decoded.userId });
    
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Update student profile
    student.resume_url = blob.url;
    
    // Auto-fill basic fields if not already set
    if (phone && !student.phone) {
      student.phone = phone;
      console.log(' Phone auto-filled:', phone);
    }
    if (linkedin_url && !student.linkedin_url) {
      student.linkedin_url = linkedin_url;
      console.log(' LinkedIn auto-filled:', linkedin_url);
    }
    if (current_year && !student.current_year) {
      student.current_year = current_year;
      console.log(' Current year auto-filled:', current_year);
    }
    
    // Save parsed resume data
    student.resume_parsed_data = {
      skills,
      education: {
        degree,
        major,
        university,
        graduation_year,
        gpa
      },
      experience,
      certifications
    };
    
    // Auto-fill achievements - ALWAYS REPLACE (not just when empty)
    if (achievements && achievements.length > 0) {
      student.achievements = achievements;
      console.log(' Achievements auto-filled:', achievements.length);
      console.log(' Achievement titles:', achievements.map(a => a.title));
    } else {
      console.log('️ No achievements extracted from resume');
    }
    
    student.markModified('resume_parsed_data');
    
    await student.save();

    console.log(' Student profile updated successfully');
    console.log('   - Phone:', phone);
    console.log('   - Email:', email);
    console.log('   - LinkedIn:', linkedin_url);
    console.log('   - GitHub:', github_url);
    console.log('   - Current Year:', current_year);
    console.log('   - Skills:', skills.length);
    console.log('   - GPA:', gpa);
    console.log('   - University:', university);
    console.log('   - Degree:', degree);
    console.log('   - Major:', major);
    console.log('   - Graduation Year:', graduation_year);
    console.log('   - Experience:', experience.length);
    console.log('   - Certifications:', certifications.length);
    console.log('   - Achievements:', achievements.length);
    if (achievements.length > 0) {
      console.log('   - Achievement Titles:');
      achievements.forEach((ach, idx) => {
        console.log(`     ${idx + 1}. ${ach.title}`);
      });
    }

    return NextResponse.json({
      message: 'Resume uploaded and parsed successfully',
      resume_url: blob.url,
      parsed_data: student.resume_parsed_data,
      achievements_added: achievements.length,
      achievements: achievements, // Send full achievements array
      auto_filled: {
        phone: phone || null,
        linkedin_url: linkedin_url || null,
        email: email || null,
        github_url: github_url || null,
        current_year: current_year || null
      },
      extracted_fields: {
        phone,
        email,
        linkedin_url,
        github_url,
        current_year,
        gpa,
        university,
        degree,
        major,
        graduation_year,
        skills: skills.length,
        experience: experience.length,
        certifications: certifications.length,
        achievements: achievements.length
      }
    });

  } catch (error) {
    console.error(' Resume upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
