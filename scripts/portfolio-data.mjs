export const defaultLanguage = "en";

export const uiCopy = {
  en: {
    eyebrow: "Interactive Lab",
    enableGesture: "Enable gesture mode",
    disableGesture: "Disable gesture mode",
    browseMode: "Browse manually",
    helpTitle: "Gesture controls",
    permissionTitle: "Gesture mode uses your camera in-browser",
    permissionBody: "Nothing is uploaded. You can continue browsing without camera access."
  },
  cn: {
    eyebrow: "互动实验室",
    enableGesture: "启用手势模式",
    disableGesture: "关闭手势模式",
    browseMode: "手动浏览",
    helpTitle: "手势控制",
    permissionTitle: "手势模式会在浏览器内使用相机",
    permissionBody: "不会上传任何内容，你也可以继续手动浏览。"
  }
};

const techIcon = (name, url) => `<div class="tech-icon-wrap"><img src="${url}" alt="${name}">${name}</div>`;

export const portfolioRecords = [
  {
    id: 0,
    indexStr: "01",
    title: "PROFILE",
    brief: "Jens Liew<br>Cloud & Software Engineer<br>Full-Stack Developer",
    cover: "./images/profile.png",
    details: `
      <div class="detail-hero" style="background-image: url('./images/profile.png')"></div>
      <div class="detail-content-wrap">
        <h1>Liew Shen Wei</h1>
        <div class="subtitle">Cloud Engineering & Software Development</div>
        <div class="subtitle">Full-Stack Developer</div>

        <div class="contact-tags">
          <span class="contact-tag">jensliew0704@gmail.com</span>
          <span class="contact-tag">+60186634699</span>
          <a href="https://www.linkedin.com/in/shen-wei-liew-9341a430b" target="_blank" style="text-decoration:none;"><span class="contact-tag" style="cursor:pointer;border-color:rgba(0,119,181,0.5);color:#0077b5;">LinkedIn</span></a>
        </div>
        <h2>CORE TECH STACK</h2>
        <div class="tech-stack">
          ${techIcon("AWS", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg")}
          ${techIcon("React", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg")}
          ${techIcon("Node.js", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg")}
          ${techIcon("Python", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg")}
          ${techIcon("GitHub Actions", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/githubactions/githubactions-original.svg")}
        </div>
        <h2>EDUCATION</h2>
        <h3>Asia Pacific University (APU)</h3>
        <p><strong>Degree (2025):</strong> BSc in IT (Cloud Engineering) - Current GPA: 3.88</p>
        <p><strong>Diploma (2022):</strong> Diploma in IT (Software Engineering) - CGPA: 3.77</p>
      </div>
    `
  },
  {
    id: 1,
    indexStr: "02",
    title: "EXPERIENCE",
    brief: "Professional Internships<br>Software Engineering",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800",
    details: `
      <div class="detail-hero" style="background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600')"></div>
      <div class="detail-content-wrap">
        <h1>Work Experience</h1>
        <div class="subtitle">Professional Software Engineering Journey</div>
        <h2>Kinslabs Sdn. Bhd.</h2>
        <h3>Software Engineering Intern (Dec 2025 - May 2026)</h3>
        <ul>
          <li>Performed bug investigation, testing, and issue verification across internal systems.</li>
          <li>Resolved DNS/SPF and WordPress hosting configuration issues.</li>
          <li>Designed an IP geolocation caching approach to reduce API usage.</li>
        </ul>
        <h2>Skrine</h2>
        <h3>System Developer Intern (Aug 2024 - Oct 2024)</h3>
        <ul>
          <li>Worked on a team project to digitalize manual forms within Malaysia's top legal firm.</li>
          <li>Utilized Microsoft Power Apps, Power Automate, and SharePoint.</li>
        </ul>
      </div>
    `
  },
  {
    id: 2,
    indexStr: "03",
    title: "SEATONG",
    brief: "AI-Powered Eco-Safe<br>Ocean Cleanup System",
    cover: "./images/seatong1.png",
    details: `
      <div class="detail-hero" style="background-image: url('./images/seatong1.png')"></div>
      <div class="detail-content-wrap">
        <h1>SeaTong AI System</h1>
        <div class="subtitle">3rd APU Sustainability Hackathon - Top 12 Finalist</div>
        <div class="tech-stack">
          ${techIcon("TypeScript", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg")}
          ${techIcon("React", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg")}
          ${techIcon("Flask", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg")}
          ${techIcon("Three.js", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg")}
        </div>
        <h2>SYSTEM OVERVIEW</h2>
        <p>Developed an intelligent monitoring dashboard for SeaBin devices deployed in Port Klang. The system merges AI computer vision with real-time IoT sensor data to enable smarter, eco-safe marine debris collection.</p>
        <h2>ARCHITECTURE & FEATURES</h2>
        <ul>
          <li><strong>Real-time AI Vision (YOLOv8):</strong> Classifies marine debris and identifies fish to prevent accidental trapping.</li>
          <li><strong>Eco-Safe Automation:</strong> Automated seabin pause when a high fish population is detected.</li>
          <li><strong>Live Spatial Data:</strong> Monitoring of seabin locations with contamination risk levels per area.</li>
          <li><strong>Digital Twin:</strong> 3D seabin model visualization using Three.js.</li>
        </ul>
      </div>
    `
  },
  {
    id: 3,
    indexStr: "04",
    title: "AWS RSVP",
    brief: "Serverless Event App<br>Cloud Architecture",
    cover: "./images/awsRSVP1.png",
    details: `
      <div class="detail-hero" style="background-image: url('./images/awsRSVP1.png')"></div>
      <div class="detail-content-wrap">
        <h1>AWS Event RSVP</h1>
        <div class="subtitle">Cloud Native Application Architecture</div>
        <div class="tech-stack">
          ${techIcon("AWS", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg")}
          ${techIcon("Node.js", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg")}
          ${techIcon("DynamoDB", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg")}
          ${techIcon("Lambda", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg")}
          ${techIcon("S3", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg")}
          ${techIcon("Cloud Front", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg")}
          ${techIcon("Stripe API", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/stripe/stripe-original.svg")}
        </div>
        <h2>INFRASTRUCTURE DETAILS</h2>
        <ul>
          <li>Developed and deployed a completely <strong>serverless web application</strong> on AWS Cloud.</li>
          <li>Built robust backend APIs for event listing and RSVP processing using <strong>Node.js in AWS Lambda</strong>.</li>
          <li>Hosted a static frontend on Amazon S3 distributed via CloudFront.</li>
          <li>Demonstrated hybrid data storage patterns using both relational and NoSQL databases.</li>
        </ul>
      </div>
    `
  },
  {
    id: 4,
    indexStr: "05",
    title: "LMS CORE",
    brief: "Full-Stack System FYP<br>WebSockets Integration",
    cover: "images/lms1.png.webp",
    details: `
      <div class="detail-hero" style="background-image: url('images/lms1.png.webp')"></div>
      <div class="detail-content-wrap">
        <h1>Learning Management</h1>
        <div class="subtitle">Diploma Final Year Project (2023)</div>
        <div class="tech-stack">
          ${techIcon("React", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg")}
          ${techIcon("Node.js", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg")}
          ${techIcon("MongoDB", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg")}
        </div>
        <h2>DEVELOPMENT HIGHLIGHTS</h2>
        <ul>
          <li>Developed a modern full-stack Learning Management System (LMS).</li>
          <li>Spearheaded the <strong>Live Messaging System</strong> enabling instant communication.</li>
          <li>Implemented real-time chat using <strong>WebSockets</strong>, supporting message history retrieval.</li>
        </ul>
      </div>
    `
  },
  {
    id: 5,
    indexStr: "06",
    title: "HONORS & AWARDS",
    brief: "Hackathons &<br>Certifications",
    cover: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800",
    details: `
      <div class="detail-hero" style="background-image: url('https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1600')"></div>
      <div class="detail-content-wrap">
        <h1>Awards & Certs</h1>
        <div class="subtitle">Competitive Programming & Accreditations</div>
        <h2>HACKATHON TRACK RECORD</h2>
        <ul>
          <li><strong>MyHack 2026 by GDGKL</strong> Built Nexora AI - Ecosystem Platform</li>
          <li><strong>3rd APU Sustainability Hackathon (Finalist):</strong> Built the SeaTong AI System.</li>
          <li><strong>AWS Great AI Hackathon (2025):</strong> Built an Agentic Billing Intelligence System leveraging Lambda and Stripe API.</li>
        </ul>
        <h2>CLOUD CERTIFICATIONS</h2>
        <ul>
          <li>AWS Certified Cloud Practitioner</li>
          <li>AWS Introduction to Gen AI & Job Roles in the Cloud</li>
          <li>AWS Academy Graduate Generative AI Foundations Skill Badge</li>
          <li>IBM Z Xplore Concepts Skill Badge</li>
          <li>Zero to Cyber Hero: Hands-on Hacking Workshop</li>

        </ul>
      </div>
    `
  }
];
