import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import mongoose from 'mongoose';

// NOTE: This is illustrative sample data for local development/demo only.
// It is NOT live data. Use the Admin panel to add real, current listings.
const sampleOpportunities = [
  {
    title: 'Combined Graduate Level (CGL) Examination',
    organization: 'Staff Selection Commission (SSC)',
    category: 'Central Government',
    type: 'Job',
    jobType: 'Permanent',
    description: 'Recruitment to various Group B and Group C posts in central government ministries/departments via a tiered competitive exam.',
    eligibility: {
      minAge: 18, maxAge: 32,
      minEducationLevel: 'Graduate',
      allowedStreams: ['Any'],
      genderRequirement: 'Any',
      domicileStates: ['All India'],
      minExperienceYears: 0,
    },
    salaryMin: 25500, salaryMax: 81100,
    vacancies: 4500,
    applicationStartDate: new Date('2026-08-01'),
    applicationEndDate: new Date('2026-09-15'),
    officialLink: 'https://ssc.nic.in',
    howToApply: 'Apply online via the official SSC website with a valid registration.',
    documentsRequired: ['Photo ID', 'Educational certificates', 'Category certificate (if applicable)'],
    selectionProcess: 'Tier I (CBT), Tier II (CBT), Document Verification',
    tags: ['ssc', 'cgl', 'central government', 'graduate'],
  },
  {
    title: 'Probationary Officer (PO) Recruitment',
    organization: 'Institute of Banking Personnel Selection (IBPS)',
    category: 'Banking',
    type: 'Job',
    jobType: 'Permanent',
    description: 'Recruitment of Probationary Officers for participating public sector banks across India.',
    eligibility: {
      minAge: 20, maxAge: 30,
      minEducationLevel: 'Graduate',
      allowedStreams: ['Any'],
      genderRequirement: 'Any',
      domicileStates: ['All India'],
      minExperienceYears: 0,
    },
    salaryMin: 36000, salaryMax: 63840,
    vacancies: 3500,
    applicationStartDate: new Date('2026-08-05'),
    applicationEndDate: new Date('2026-09-05'),
    officialLink: 'https://ibps.in',
    howToApply: 'Register online, pay the application fee, and appear for Prelims followed by Mains.',
    documentsRequired: ['Photo ID', 'Graduation certificate', 'Passport-size photo & signature scan'],
    selectionProcess: 'Prelims, Mains, Interview',
    tags: ['ibps', 'po', 'banking', 'graduate'],
  },
  {
    title: 'Non-Technical Popular Categories (NTPC) Recruitment',
    organization: 'Railway Recruitment Board (RRB)',
    category: 'Railways',
    type: 'Job',
    jobType: 'Permanent',
    description: 'Recruitment for various non-technical posts including Station Master, Goods Guard, and Commercial Apprentice across Indian Railways zones.',
    eligibility: {
      minAge: 18, maxAge: 33,
      minEducationLevel: '12th Pass',
      allowedStreams: ['Any'],
      genderRequirement: 'Any',
      domicileStates: ['All India'],
      minExperienceYears: 0,
    },
    salaryMin: 19900, salaryMax: 63200,
    vacancies: 11000,
    applicationStartDate: new Date('2026-07-20'),
    applicationEndDate: new Date('2026-08-25'),
    officialLink: 'https://rrbcdg.gov.in',
    howToApply: 'Apply online through the regional RRB website applicable to your zone.',
    documentsRequired: ['Photo ID', '12th mark sheet', 'Domicile certificate (if applicable)'],
    selectionProcess: 'CBT 1, CBT 2, Document Verification, Medical Exam',
    tags: ['railways', 'rrb', 'ntpc', '12th pass'],
  },
  {
    title: 'Sub Inspector (SI) Recruitment',
    organization: 'State Police Department',
    category: 'Police',
    type: 'Job',
    jobType: 'Permanent',
    description: 'Direct recruitment of Sub Inspectors in the state police force, including physical efficiency and written examination.',
    eligibility: {
      minAge: 20, maxAge: 28,
      minEducationLevel: 'Graduate',
      allowedStreams: ['Any'],
      genderRequirement: 'Any',
      domicileStates: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh'],
      minExperienceYears: 0,
    },
    salaryMin: 35400, salaryMax: 112400,
    vacancies: 900,
    applicationStartDate: new Date('2026-08-10'),
    applicationEndDate: new Date('2026-09-20'),
    officialLink: 'https://uppbpb.gov.in',
    howToApply: 'Apply online via the state police recruitment board portal.',
    documentsRequired: ['Photo ID', 'Graduation certificate', 'Physical fitness certificate'],
    selectionProcess: 'Written Exam, Physical Efficiency Test, Interview, Medical',
    tags: ['police', 'sub inspector', 'state government'],
  },
  {
    title: 'Post Graduate Teacher (PGT) Recruitment',
    organization: 'Kendriya Vidyalaya Sangathan (KVS)',
    category: 'Teaching',
    type: 'Job',
    jobType: 'Permanent',
    description: 'Recruitment of Post Graduate Teachers across subjects for Kendriya Vidyalayas nationwide.',
    eligibility: {
      minAge: 21, maxAge: 40,
      minEducationLevel: 'Post Graduate',
      allowedStreams: ['Any'],
      genderRequirement: 'Any',
      domicileStates: ['All India'],
      minExperienceYears: 0,
    },
    salaryMin: 44900, salaryMax: 142400,
    vacancies: 600,
    applicationStartDate: new Date('2026-08-01'),
    applicationEndDate: new Date('2026-08-30'),
    officialLink: 'https://kvsangathan.nic.in',
    howToApply: 'Apply online with B.Ed and post-graduate degree certificates.',
    documentsRequired: ['Photo ID', 'PG degree', 'B.Ed certificate'],
    selectionProcess: 'Written Test, Interview/Demo Class',
    tags: ['teaching', 'kvs', 'pgt', 'post graduate'],
  },
  {
    title: 'National Means-cum-Merit Scholarship',
    organization: 'Ministry of Education',
    category: 'Scholarship',
    type: 'Scholarship',
    description: 'Scholarship for meritorious students from economically weaker sections to reduce dropout rate at the secondary stage.',
    eligibility: {
      minAge: 13, maxAge: 20,
      minEducationLevel: '10th Pass',
      allowedStreams: ['Any'],
      genderRequirement: 'Any',
      domicileStates: ['All India'],
      minExperienceYears: 0,
    },
    payScaleText: 'Rs. 12,000 per year',
    applicationStartDate: new Date('2026-08-01'),
    applicationEndDate: new Date('2026-10-31'),
    officialLink: 'https://scholarships.gov.in',
    howToApply: 'Apply through the National Scholarship Portal with income and marksheet proof.',
    documentsRequired: ['Income certificate', 'Marksheet', 'Bank account details'],
    selectionProcess: 'Merit-based selection via state-level exam',
    tags: ['scholarship', 'students', 'economically weaker section'],
  },
  {
    title: 'PM Vishwakarma Skill Upgradation Scheme',
    organization: 'Ministry of MSME',
    category: 'Scheme',
    type: 'Scheme',
    description: 'Financial support, skill training and toolkit incentives for traditional artisans and craftspeople across 18 trades.',
    eligibility: {
      minAge: 18, maxAge: 60,
      minEducationLevel: 'Below 10th',
      allowedStreams: ['Any'],
      genderRequirement: 'Any',
      domicileStates: ['All India'],
      minExperienceYears: 0,
    },
    payScaleText: 'Collateral-free loans up to Rs. 3 lakh + toolkit incentive of Rs. 15,000',
    applicationStartDate: new Date('2026-06-01'),
    applicationEndDate: new Date('2026-12-31'),
    officialLink: 'https://pmvishwakarma.gov.in',
    howToApply: 'Register at a nearby Common Service Centre (CSC) with Aadhaar and trade proof.',
    documentsRequired: ['Aadhaar card', 'Trade/occupation proof'],
    selectionProcess: 'Verification by implementing agency',
    tags: ['scheme', 'artisans', 'msme', 'skill development'],
  },
  {
    title: 'Combined Defence Services (CDS) Examination',
    organization: 'Union Public Service Commission (UPSC)',
    category: 'Defence',
    type: 'Job',
    jobType: 'Permanent',
    description: 'Recruitment of officers into the Indian Military Academy, Naval Academy, Air Force Academy and Officers Training Academy.',
    eligibility: {
      minAge: 19, maxAge: 24,
      minEducationLevel: 'Graduate',
      allowedStreams: ['Any', 'Engineering'],
      genderRequirement: 'Any',
      domicileStates: ['All India'],
      minExperienceYears: 0,
    },
    payScaleText: 'Stipend during training; pay scale per commissioned rank thereafter',
    vacancies: 450,
    applicationStartDate: new Date('2026-07-15'),
    applicationEndDate: new Date('2026-08-20'),
    officialLink: 'https://upsc.gov.in',
    howToApply: 'Apply online via the UPSC portal, appear for written exam followed by SSB interview.',
    documentsRequired: ['Photo ID', 'Graduation certificate', 'Physical fitness certificate'],
    selectionProcess: 'Written Exam, SSB Interview, Medical Exam',
    tags: ['defence', 'upsc', 'cds', 'army', 'navy', 'air force'],
  },
];

async function seed() {
  await connectDB();

  const adminEmail = 'admin@sarkarisetu.local';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'SarkariSetu Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`Created admin user: ${adminEmail} / Admin@123`);
  }

  await Opportunity.deleteMany({});
  await Opportunity.insertMany(sampleOpportunities.map((o) => ({ ...o, postedBy: admin._id })));
  console.log(`Inserted ${sampleOpportunities.length} sample opportunities`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
