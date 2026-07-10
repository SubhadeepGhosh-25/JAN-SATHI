export interface Scheme {
  id: string;
  schemeName: string;
  category: string;
  description: string;
  benefits: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    occupations?: string[];
    maxIncome?: number;
    genders?: string[];
    categories?: string[];
    disabilityRequired?: boolean;
    states?: string[];
    education?: string[];
  };
  requiredDocuments: string[];
  deadline: string;
  officialWebsite: string;
  statesApplicable: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  occupation: string;
  income: number;
  gender: string;
  age: number;
  education: string;
  category: string; // Gen, OBC, SC, ST, EWS
  disability: boolean;
  preferredLanguage: string;
  profilePhoto?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
  occupation: string;
  income: number;
  category: string;
  education: string;
  disability: boolean;
  state: string;
}

export interface DocumentFile {
  id: string;
  documentType: string;
  documentId: string;
  holderName: string;
  expiryDate?: string;
  dob?: string;
  gender?: string;
  state?: string;
  additionalInfo?: string;
  fileUrl?: string; // or base64 placeholder
  verified: boolean;
  uploadedAt: string;
}

export interface Application {
  id: string;
  schemeId: string;
  schemeName: string;
  applicantName: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Action Required' | 'Rejected';
  submittedAt?: string;
  documentsAttached: string[];
  notes?: string;
  formValues: Record<string, string>;
}

export interface Reminder {
  id: string;
  title: string;
  schemeName: string;
  dueDate: string;
  type: 'Deadline' | 'Certificate Expiry' | 'Follow-up';
  completed: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'campaign' | 'task_alt' | 'event' | 'new_releases';
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const SEED_SCHEMES: Scheme[] = [
  {
    id: "sch-1",
    schemeName: "PM Vidyalakshmi Scheme",
    category: "Scholarships & Education",
    description: "Financial support for higher education to meritorious students. Provides fully transparent, collateral-free education loans with interest subvention up to Rs. 7.5 Lakhs.",
    benefits: "1. Collateral-free and third-party guarantee-free education loan up to Rs. 7.5 Lakhs.\n2. Full interest subvention for students with family income up to Rs. 4.5 Lakhs per annum.\n3. Simplified single-window online application process accessible across all nationalized banks.",
    eligibility: {
      minAge: 16,
      maxAge: 35,
      maxIncome: 800000,
      education: ["Higher Secondary", "Graduate", "Post Graduate"],
      states: ["All States"]
    },
    requiredDocuments: ["Mark sheets of 10th & 12th Std", "Proof of Admission to Higher Education Course", "Family Income Certificate", "Aadhaar Card", "PAN Card of Parent/Guardian"],
    deadline: "2026-09-30",
    officialWebsite: "https://www.vidyalakshmi.co.in",
    statesApplicable: "All of India"
  },
  {
    id: "sch-2",
    schemeName: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    category: "Farmer Schemes",
    description: "An initiative by the Government of India that guarantees minimum income support of Rs. 6,000 per year to all eligible small and marginal landholding farmer families.",
    benefits: "1. Direct income support of Rs. 6,000 per year payable in three equal installments of Rs. 2,000.\n2. Transferred directly to the bank accounts of farmer families through DBT.\n3. Enables farmers to purchase farm inputs, fertilizers, and seeds before harvest cycles.",
    eligibility: {
      minAge: 18,
      occupations: ["Farmer", "Agriculture Laborer"],
      states: ["All States"]
    },
    requiredDocuments: ["Landholding Ownership Proof/Khasra", "Aadhaar Card", "Bank Account Details", "Domicile Certificate"],
    deadline: "2026-11-15",
    officialWebsite: "https://pmkisan.gov.in",
    statesApplicable: "All of India"
  },
  {
    id: "sch-3",
    schemeName: "Ayushman Bharat - PM-JAY",
    category: "Healthcare",
    description: "The largest health assurance scheme in the world which aims to provide a health cover of Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.",
    benefits: "1. Cashless health cover of Rs. 5,00,000 per family per year.\n2. Covers pre-existing conditions, diagnostics, medicines, and up to 3 days of pre-hospitalization & 15 days of post-hospitalization costs.\n3. Paperless and cashless benefits at all impaneled public and private hospitals nationwide.",
    eligibility: {
      maxIncome: 250000,
      states: ["All States"]
    },
    requiredDocuments: ["Aadhaar Card", "Ration Card (NFSA List)", "Income Certificate / Caste Certificate", "Mobile Number linked to Aadhaar"],
    deadline: "No Deadline",
    officialWebsite: "https://pmjay.gov.in",
    statesApplicable: "All of India"
  },
  {
    id: "sch-4",
    schemeName: "PMAY-U (Pradhan Mantri Awas Yojana - Urban)",
    category: "Housing",
    description: "A flagship program of the Government of India that addresses urban housing shortage among the EWS, LIG, and MIG categories by ensuring a pucca house to all eligible urban families.",
    benefits: "1. Interest subsidy of up to 6.5% on housing loans under the Credit Linked Subsidy Scheme (CLSS).\n2. Central assistance of Rs. 1.5 Lakhs for construction of individual houses under beneficiary-led construction.\n3. Preference given to female heads of households, differently-abled, and senior citizens.",
    eligibility: {
      minAge: 21,
      maxIncome: 600000,
      states: ["All States"]
    },
    requiredDocuments: ["Aadhaar Card of all family members", "Income Proof / Self-Declaration", "Bank Passbook Copy", "No Pucca House Affidavit", "Certificate of House Ownership Survey"],
    deadline: "2026-12-31",
    officialWebsite: "https://pmay-urban.gov.in",
    statesApplicable: "All of India"
  },
  {
    id: "sch-5",
    schemeName: "PM Matru Vandana Yojana",
    category: "Women's Welfare",
    description: "A maternity benefit program that provides cash incentives to pregnant women and lactating mothers for the first living child of the family to encourage proper health, rest, and nutrition.",
    benefits: "1. Cash incentive of Rs. 5,000 in three installments upon fulfilling early registration, antenatal checkups, and child immunization milestones.\n2. Compensates for wage loss, encouraging adequate rest before and after child delivery.",
    eligibility: {
      minAge: 19,
      genders: ["Female"],
      states: ["All States"]
    },
    requiredDocuments: ["Mother and Child Protection (MCP) Card", "Identity Proof (Aadhaar Card)", "Bank Account linked to Aadhaar", "Husband's Aadhaar Card"],
    deadline: "Continuous",
    officialWebsite: "https://wcd.nic.in",
    statesApplicable: "All of India"
  },
  {
    id: "sch-6",
    schemeName: "PM Mudra Yojana (PMMY)",
    category: "Business & Startup",
    description: "Provides collateral-free loans up to Rs. 10 Lakhs to non-corporate, non-farm small/micro enterprises. Divided into Shishu (up to Rs. 50k), Kishor (up to Rs. 5 Lakhs), and Tarun (up to Rs. 10 Lakhs).",
    benefits: "1. No collateral or security required to secure enterprise funding.\n2. Extremely low processing fees and flexible repayment periods up to 5 years.\n3. Mudra Card provided for convenient cash withdrawal and working capital management.",
    eligibility: {
      minAge: 18,
      maxAge: 65,
      states: ["All States"]
    },
    requiredDocuments: ["Mudra Application Form", "Business Plan / Proposal", "Identity & Address Proof of Enterprise", "Quotation for Machinery / Equipment to be purchased", "Caste Certificate (if applying under special category)"],
    deadline: "No Deadline",
    officialWebsite: "https://www.mudra.org.in",
    statesApplicable: "All of India"
  },
  {
    id: "sch-7",
    schemeName: "Indira Gandhi Old Age Pension Scheme",
    category: "Senior Citizen",
    description: "Monthly pension support for senior citizens belonging to families Below Poverty Line (BPL) to secure elderly lifestyle and basic nutrition.",
    benefits: "1. Monthly pension of Rs. 200 (for ages 60-79) and Rs. 500 (for age 80 and above) from Central Government, with additional matching state contributions.\n2. Continuous lifetime benefits transferred directly to bank account.",
    eligibility: {
      minAge: 60,
      maxAge: 120,
      maxIncome: 120000,
      states: ["All States"]
    },
    requiredDocuments: ["BPL Card", "Age Proof (Aadhaar or Birth Certificate)", "Domicile Certificate", "Bank Passbook"],
    deadline: "Continuous",
    officialWebsite: "https://nsap.nic.in",
    statesApplicable: "All of India"
  },
  {
    id: "sch-8",
    schemeName: "Deendayal Disabled Rehabilitation Scheme (DDRS)",
    category: "Disability Support",
    description: "Promotes voluntary action and financial support for rehabilitation of individuals with physical or mental disabilities, including funding for special education, vocational training, and therapy.",
    benefits: "1. Free access to assistive devices, smart calipers, hearing aids, and specialized therapy services.\n2. Residential schools and vocational training facilities at highly subsidized or zero cost.",
    eligibility: {
      disabilityRequired: true,
      states: ["All States"]
    },
    requiredDocuments: ["Unique Disability ID (UDID) Card / Disability Certificate", "Aadhaar Card", "Domicile Certificate", "Family Income Declaration"],
    deadline: "2026-10-15",
    officialWebsite: "https://disabilityaffairs.gov.in",
    statesApplicable: "All of India"
  }
];
