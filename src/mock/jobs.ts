// Generate 50 mock jobs across 10 companies and Indian locations
const companies = [
  { name: 'Northstar Analytics', logo: '', id: 'northstar' },
  { name: 'Astra Digital', logo: '', id: 'astra' },
  { name: 'Lattice Labs', logo: '', id: 'lattice' },
  { name: 'ByteCraft', logo: '', id: 'bytecraft' },
  { name: 'Zenith Solutions', logo: '', id: 'zenith' },
  { name: 'Navya Tech', logo: '', id: 'navya' },
  { name: 'DataVista', logo: '', id: 'datavista' },
  { name: 'InnoWorks', logo: '', id: 'innoworks' },
  { name: 'AlgoEdge', logo: '', id: 'algoedge' },
  { name: 'Prodigy Labs', logo: '', id: 'prodigy' }
]

const locations = ['Ahmedabad','Bhopal','Indore','Pune','Mumbai','Delhi','Bengaluru','Hyderabad','Noida','Lucknow']
const roles = ['Business Analyst','Junior Business Analyst','Data Analyst','ML Engineer','Software Engineer','Frontend Developer','Backend Developer','Product Analyst','Project Coordinator','AI Engineer']

function random(a:number,b:number){return Math.floor(Math.random()*(b-a+1))+a}

function pick(arr:any[]){return arr[random(0,arr.length-1)]}

export const jobs = Array.from({length:50}).map((_,i)=>{
  const company = pick(companies)
  const title = pick(roles)
  const exp = `${random(1,8)} yrs`
  const loc = pick(locations)
  const salaryMin = random(3,12)
  const salaryMax = salaryMin + random(2,10)
  const skillsPool = ['SQL','Python','Power BI','Excel','Communication','Stakeholder Management','Machine Learning','React','Node.js','Django','Tableau']
  const skills = Array.from(new Set([pick(skillsPool), pick(skillsPool), pick(skillsPool)])).slice(0,6)
  return {
    id: `job-${i+1}`,
    title,
    company: company.name,
    companyId: company.id,
    companyLogo: '',
    location: loc,
    workMode: ['Remote','Hybrid','Onsite'][random(0,2)],
    employmentType: ['Full-time','Contract','Internship'][random(0,2)],
    experience: exp,
    salaryMin: salaryMin*100000,
    salaryMax: salaryMax*100000,
    skills,
    description: `${title} role at ${company.name} in ${loc}. Contribute to product and analytics.`,
    responsibilities: ['Analyze data','Work with stakeholders','Deliver reports'],
    requirements: ['Bachelor degree','2+ years experience'],
    postedDate: new Date(Date.now() - random(0,30)*24*3600*1000).toISOString(),
    industry: 'Technology'
  }
})
