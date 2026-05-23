const mongoose = require('mongoose');

const ContactPersonSchema = new mongoose.Schema({
  name: String,
  designation: String,
  mobile: String,
  email: String,
  alternatePhone: String,
});

const JobProfileSchema = new mongoose.Schema({
  course: String,
  jobDesignation: String,
  ctc: String,
  fixedInHand: String,
  variablePay: String,
  bonusPerks: String,
  jobLocation: String,
  internPlusFTE: String,
  stipend: String,
});

const SelectionRoundSchema = new mongoose.Schema({
  roundType: String,
  duration: String,
  mode: String,
  elimination: String,
  otherDetails: String,
});

const JNFSchema = new mongoose.Schema(
  {
    // Section 01 - Company Info
    companyName: { type: String, required: true },
    sector: String,
    address: String,
    website: String,
    onCampusDrive: { type: String, enum: ['Yes', 'No'], default: 'Yes' },

    // Section 02 - Contact Persons
    contactPersons: [ContactPersonSchema],

    // Section 03 - Job Profile & Compensation
    jobProfiles: [JobProfileSchema],
    serviceBond: { type: String, enum: ['Yes', 'No'], default: 'No' },
    serviceBondDuration: String,
    serviceBondAmount: String,
    serviceBondConditions: String,
    relocationAllowance: { type: String, enum: ['Yes', 'No'], default: 'No' },
    relocationDetails: String,
    workMode: { type: String, enum: ['On-site', 'Hybrid', 'Full Remote'], default: 'On-site' },

    // Section 04 - Selection Process
    selectionRounds: [SelectionRoundSchema],

    // Section 05 - Eligibility Criteria
    minCGPA: {
      btech: String,
      mtech: String,
      mba: String,
      msc: String,
    },
    backlogsAllowed: { type: String, enum: ['Yes', 'No'], default: 'No' },
    maxBacklogs: String,
    gapYearAllowed: { type: String, enum: ['Yes', 'No'], default: 'No' },
    maxGap: String,
    tenthCutoff: String,
    twelfthCutoff: String,
    additionalCriteria: String,
    skillsRequired: String,

    // Section 06 - Branches/Courses Considered
    btechBranches: {
      chemical: { type: Boolean, default: false },
      civil: { type: Boolean, default: false },
      cse: { type: Boolean, default: false },
      electrical: { type: Boolean, default: false },
      ece: { type: Boolean, default: false },
      it: { type: Boolean, default: false },
      mechanical: { type: Boolean, default: false },
      metallurgy: { type: Boolean, default: false },
    },
    mtechSpecializations: [{ department: String, specialization: String, selected: Boolean }],
    mbaConsidered: { type: Boolean, default: false },
    mscConsidered: { type: Boolean, default: false },
    phdApplicable: String,

    // Section 07 - Logistical Requirements
    visitingMembers: String,
    pptRequired: { type: String, enum: ['Yes', 'No'], default: 'No' },
    pptRoomCapacity: String,
    interviewRooms: String,
    onlineTestPlatform: String,
    laptopRequired: { type: String, enum: ['Yes', 'No'], default: 'No' },
    laptopProvider: { type: String, enum: ['Bring Own', 'Institute to Provide', ''] },
    preferredDate1: String,
    preferredDate2: String,
    otherRequirements: String,

    // Section 08 - Declaration & Signature
    signatoryName: String,
    signatoryDesignation: String,
    declarationDate: String,

    // Meta
    status: { type: String, enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'], default: 'Pending' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JNF', JNFSchema);