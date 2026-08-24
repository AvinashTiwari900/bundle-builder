// Pre-seeded directories of Colleges, Companies, Roles, and Country Codes

export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', format: '10 digits' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', format: '10 digits' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', format: '10-11 digits' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', format: '8 digits' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', format: '9 digits' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', format: '9 digits' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', format: '10-11 digits' },
  { code: '+33', country: 'France', flag: '🇫🇷', format: '9 digits' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', format: '10 digits' },
  { code: '+86', country: 'China', flag: '🇨🇳', format: '11 digits' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', format: '9 digits' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', format: '9 digits' }
]

export const PREDEFINED_COLLEGES = [
  'Indian Institute of Technology (IIT) Bombay',
  'Indian Institute of Technology (IIT) Delhi',
  'Indian Institute of Technology (IIT) Madras',
  'Indian Institute of Technology (IIT) Kharagpur',
  'Indian Institute of Technology (IIT) Roorkee',
  'Indian Institute of Technology (IIT) Kanpur',
  'Indian Institute of Technology (IIT) Guwahati',
  'Indian Institute of Technology (IIT) Hyderabad',
  'Birla Institute of Technology and Science (BITS) Pilani',
  'National Institute of Technology (NIT) Trichy',
  'National Institute of Technology (NIT) Surathkal',
  'National Institute of Technology (NIT) Warangal',
  'Delhi Technological University (DTU)',
  'Netaji Subhas University of Technology (NSUT)',
  'International Institute of Information Technology (IIIT) Hyderabad',
  'International Institute of Information Technology (IIIT) Bangalore',
  'Vellore Institute of Technology (VIT) Vellore',
  'SRM Institute of Science and Technology',
  'Manipal Institute of Technology (MIT Manipal)',
  'Thapar Institute of Engineering and Technology',
  'University of Delhi (DU)',
  'Mumbai University',
  'Anna University Chennai',
  'Pune University (SPPU)',
  'Jadavpur University Kolkata',
  'Stanford University',
  'Massachusetts Institute of Technology (MIT)',
  'Harvard University',
  'University of California, Berkeley (UC Berkeley)',
  'Carnegie Mellon University (CMU)',
  'National University of Singapore (NUS)',
  'Nanyang Technological University (NTU)',
  'University of Oxford',
  'University of Cambridge',
  'Imperial College London',
  'University of Toronto',
  'University of Waterloo'
]

export const PREDEFINED_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Netflix',
  'Adobe',
  'Salesforce',
  'Uber',
  'Flipkart',
  'Zomato',
  'Swiggy',
  'Paytm',
  'Ola Cabs',
  'Razorpay',
  'Cred',
  'Infosys',
  'Tata Consultancy Services (TCS)',
  'Wipro',
  'HCL Technologies',
  'Cognizant',
  'Accenture',
  'Deloitte',
  'PwC',
  'EY (Ernst & Young)',
  'KPMG',
  'JPMorgan Chase & Co.',
  'Goldman Sachs',
  'Morgan Stanley',
  'Barclays',
  'McKinsey & Company',
  'Boston Consulting Group (BCG)',
  'Bain & Company',
  'Northstar Analytics',
  'Astra Digital',
  'Lattice Labs',
  'ByteCraft Solutions',
  'Zenith Solutions'
]

export const PREDEFINED_ROLES = [
  'Student',
  'Lead Business Analyst & Product Strategist',
  'Senior Business Analyst',
  'Business Analyst',
  'Associate Business Analyst',
  'Product Manager',
  'Associate Product Manager',
  'Product Analyst',
  'Data Scientist',
  'Senior Data Scientist',
  'Data Analyst',
  'Machine Learning Engineer',
  'AI Engineer',
  'Full Stack Developer',
  'Frontend Developer (React / Next.js)',
  'Backend Developer (Node.js / Python / Java)',
  'Software Development Engineer (SDE-1)',
  'Senior Software Engineer (SDE-2 / SDE-3)',
  'DevOps & Cloud Engineer',
  'UI/UX Designer',
  'QA & Test Automation Engineer',
  'Cybersecurity Analyst',
  'Management Trainee'
]

const CUSTOM_COLLEGES_KEY = 'rap_custom_colleges'
const CUSTOM_COMPANIES_KEY = 'rap_custom_companies'

export const directoryService = {
  getColleges(): string[] {
    const custom = JSON.parse(localStorage.getItem(CUSTOM_COLLEGES_KEY) || '[]')
    return Array.from(new Set([...custom, ...PREDEFINED_COLLEGES]))
  },

  addCustomCollege(college: string) {
    if (!college.trim()) return
    const custom: string[] = JSON.parse(localStorage.getItem(CUSTOM_COLLEGES_KEY) || '[]')
    if (!custom.includes(college.trim()) && !PREDEFINED_COLLEGES.includes(college.trim())) {
      custom.unshift(college.trim())
      localStorage.setItem(CUSTOM_COLLEGES_KEY, JSON.stringify(custom))
    }
  },

  getCompanies(): string[] {
    const custom = JSON.parse(localStorage.getItem(CUSTOM_COMPANIES_KEY) || '[]')
    return Array.from(new Set([...custom, ...PREDEFINED_COMPANIES]))
  },

  addCustomCompany(company: string) {
    if (!company.trim()) return
    const custom: string[] = JSON.parse(localStorage.getItem(CUSTOM_COMPANIES_KEY) || '[]')
    if (!custom.includes(company.trim()) && !PREDEFINED_COMPANIES.includes(company.trim())) {
      custom.unshift(company.trim())
      localStorage.setItem(CUSTOM_COMPANIES_KEY, JSON.stringify(custom))
    }
  },

  getRoles(): string[] {
    return PREDEFINED_ROLES
  },

  getCountryCodes() {
    return COUNTRY_CODES
  }
}
