// One-time seed: creates a placeholder recruiter account and 50 mock job
// postings owned by it, so `jobs.ownerId` is a real, dereferenceable
// recruiter uid consistent with the schema/rules - not a magic string.
// Safe to re-run: fixed job ids mean this upserts rather than duplicating.
// Mirrors src/mock/jobs.ts's data so the seeded jobs match the frontend's
// expected shape (companyRating, hiringPeriod, response-time badges, etc).
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SEED_RECRUITER_EMAIL = 'seed-recruiter@ras.internal'

const companies = [
  { name: 'Northstar Analytics', id: 'northstar', rating: 4.9, responseRate: '99% Response Rate', responseTime: '< 12 hrs', responseCategory: 'Fast Responder' },
  { name: 'Astra Digital', id: 'astra', rating: 4.8, responseRate: '96% Response Rate', responseTime: '< 24 hrs', responseCategory: 'Fast Responder' },
  { name: 'Lattice Labs', id: 'lattice', rating: 4.7, responseRate: '94% Response Rate', responseTime: '< 24 hrs', responseCategory: 'High Response' },
  { name: 'ByteCraft Technologies', id: 'bytecraft', rating: 4.6, responseRate: '92% Response Rate', responseTime: '< 48 hrs', responseCategory: 'Reliable Responder' },
  { name: 'Zenith Solutions', id: 'zenith', rating: 4.8, responseRate: '98% Response Rate', responseTime: '< 18 hrs', responseCategory: 'Fast Responder' },
  { name: 'Navya Tech', id: 'navya', rating: 4.5, responseRate: '89% Response Rate', responseTime: '< 48 hrs', responseCategory: 'Standard' },
  { name: 'DataVista Systems', id: 'datavista', rating: 4.9, responseRate: '99% Response Rate', responseTime: '< 8 hrs', responseCategory: 'Ultra Fast Responder' },
  { name: 'InnoWorks Global', id: 'innoworks', rating: 4.6, responseRate: '91% Response Rate', responseTime: '< 36 hrs', responseCategory: 'Reliable Responder' },
  { name: 'AlgoEdge AI', id: 'algoedge', rating: 4.9, responseRate: '97% Response Rate', responseTime: '< 16 hrs', responseCategory: 'Fast Responder' },
  { name: 'Prodigy Cloud Labs', id: 'prodigy', rating: 4.7, responseRate: '93% Response Rate', responseTime: '< 24 hrs', responseCategory: 'High Response' }
]
const locations = ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Noida', 'Ahmedabad', 'Indore', 'Chennai', 'Gurugram']
const roles = [
  'Lead Business Analyst',
  'Senior Business Analyst',
  'Product Data Analyst',
  'Senior Data Analyst',
  'BI & Analytics Specialist',
  'AI / ML Solutions Engineer',
  'Full Stack Software Engineer',
  'Frontend React Engineer',
  'Backend Python/Node Engineer',
  'Analytics Project Manager'
]
const hiringPeriods = [
  'Immediate (0-15 Days)',
  'Active · Next 15 Days',
  'Urgent Joining (7 Days)',
  '30 Days Notice Accepted',
  'Active · Next 30 Days',
  'Cohort Joining (Q3)'
]
const skillsPool = ['SQL', 'Python', 'Power BI', 'Tableau', 'Business Analysis', 'Excel', 'Stakeholder Management', 'Agile / Scrum', 'Machine Learning', 'React', 'Node.js', 'Snowflake', 'Data Warehousing', 'Jira']

function random(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a
}
function pick<T>(arr: T[]): T {
  return arr[random(0, arr.length - 1)]
}

async function main() {
  let recruiter = await prisma.user.findUnique({ where: { email: SEED_RECRUITER_EMAIL } })
  if (!recruiter) {
    const passwordHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10)
    recruiter = await prisma.user.create({
      data: { email: SEED_RECRUITER_EMAIL, passwordHash, role: 'recruiter' }
    })
    console.log(`Created seed recruiter: ${recruiter.id}`)
  }

  for (let i = 1; i <= 50; i++) {
    const id = `job-${i}`
    const company = pick(companies)
    const title = pick(roles)
    const expYears = random(2, 7)
    const exp = `${expYears}-${expYears + 2} yrs`
    const loc = pick(locations)
    const salaryMin = random(8, 18) * 100000
    const salaryMax = salaryMin + random(4, 10) * 100000
    const hiringPeriod = pick(hiringPeriods)
    const skills = Array.from(new Set(['SQL', pick(skillsPool), pick(skillsPool), pick(skillsPool), pick(skillsPool)])).slice(0, 5)

    const jobData = {
      title,
      company: company.name,
      companyId: company.id,
      companyRating: company.rating,
      companyResponseRate: company.responseRate,
      companyResponseTime: company.responseTime,
      companyResponseCategory: company.responseCategory,
      hiringPeriod,
      location: loc,
      workMode: pick(['Hybrid', 'Remote', 'Onsite']),
      employmentType: pick(['Full-time', 'Full-time', 'Contract']),
      experience: exp,
      salaryMin,
      salaryMax,
      skills,
      description: `We are looking for a highly motivated ${title} to join ${company.name} in ${loc}. In this role, you will analyze mission-critical business systems, collaborate with cross-functional product & engineering pods, build automated BI reporting frameworks, and provide strategic executive insights.`,
      responsibilities: [
        'Perform deep-dive quantitative data analysis to uncover growth and retention bottlenecks.',
        'Design, build, and maintain production BI dashboards in Power BI and Tableau.',
        'Translate ambiguity into concrete Functional Requirement Documents (FRDs) and user stories.',
        'Conduct weekly executive sprint presentations to engineering leadership and business VPs.'
      ],
      requirements: [
        `Bachelor's or Master's degree in Computer Science, Engineering, or Business Analytics`,
        `${exp} of hands-on experience in analytics or software delivery`,
        'Proven expertise in complex SQL queries, data modeling, and dashboard development',
        'Strong presentation and interpersonal skills for executive stakeholder alignment'
      ],
      benefits: [
        'Competitive compensation with performance bonus',
        'Comprehensive health & medical insurance for family',
        'Hybrid work schedule & flexible working hours',
        'Annual learning & certifications allowance'
      ],
      postedDate: new Date(Date.now() - random(0, 20) * 24 * 3600 * 1000),
      industry: 'Technology & Enterprise Analytics',
      ownerId: recruiter.id,
      status: 'open' as const
    }

    await prisma.job.upsert({
      where: { id },
      create: { id, ...jobData },
      update: jobData
    })
  }

  console.log('Seeded 50 jobs.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
