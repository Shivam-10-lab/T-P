import { useState } from 'react';
import axios from 'axios';
import NITLogo from '../assets/nit_logo.png';
import '../App.css';
import { Link } from 'react-router-dom';

const initialData = { 
  companyName: '', sector: '', address: '', website: '', onCampusDrive: 'Yes',
  contactPersons: [
    { name:'', designation:'', mobile:'', email:'', alternatePhone:'' },
    { name:'', designation:'', mobile:'', email:'', alternatePhone:'' },
    { name:'', designation:'', mobile:'', email:'', alternatePhone:'' },
  ],
  jobProfiles: [
    { course:'B.Tech.', jobDesignation:'', ctc:'', fixedInHand:'', variablePay:'', bonusPerks:'', jobLocation:'', internPlusFTE:'', stipend:'' },
    { course:'M.Tech.', jobDesignation:'', ctc:'', fixedInHand:'', variablePay:'', bonusPerks:'', jobLocation:'', internPlusFTE:'', stipend:'' },
    { course:'MBA', jobDesignation:'', ctc:'', fixedInHand:'', variablePay:'', bonusPerks:'', jobLocation:'', internPlusFTE:'', stipend:'' },
    { course:'M.Sc.', jobDesignation:'', ctc:'', fixedInHand:'', variablePay:'', bonusPerks:'', jobLocation:'', internPlusFTE:'', stipend:'' },
    { course:'Ph.D.', jobDesignation:'', ctc:'', fixedInHand:'', variablePay:'', bonusPerks:'', jobLocation:'', internPlusFTE:'', stipend:'' },
  ],
  serviceBond: 'No', serviceBondDuration:'', serviceBondAmount:'', serviceBondConditions:'',
  relocationAllowance: 'No', relocationDetails:'',
  workMode: 'On-site',
  selectionRounds: Array(6).fill(null).map(() => ({ roundType:'', duration:'', mode:'', elimination:'No', otherDetails:'' })),
  minCGPA: { btech:'', mtech:'', mba:'', msc:'' },
  backlogsAllowed: 'No', maxBacklogs:'',
  gapYearAllowed: 'No', maxGap:'',
  tenthCutoff:'', twelfthCutoff:'', additionalCriteria:'', skillsRequired:'',
  btechBranches: { chemical:false, civil:false, cse:false, electrical:false, ece:false, it:false, mechanical:false, metallurgy:false },
  mtechSpecializations: [
    { department:'CSE', specialization:'Computer Science & Engineering', selected:false },
    { department:'Electrical Engg.', specialization:'Electrical Power & Energy Systems', selected:false },
    { department:'Electrical Engg.', specialization:'Power Electronics & Electrical Devices', selected:false },
    { department:'ECE', specialization:'Microelectronics', selected:false },
    { department:'ECE', specialization:'Communications & Signal Processing', selected:false },
    { department:'Chemical Engg.', specialization:'Chemical Engineering', selected:false },
    { department:'Mechanical Engg.', specialization:'ITMM', selected:false },
    { department:'Mechanical Engg.', specialization:'Mechanical Design Systems', selected:false },
    { department:'Mechanical Engg.', specialization:'Thermal Engineering', selected:false },
    { department:'Civil Engg.', specialization:'Water Resources Engineering', selected:false },
    { department:'Civil Engg.', specialization:'Geotechnical Engineering', selected:false },
    { department:'Civil Engg.', specialization:'Transportation Engineering', selected:false },
    { department:'Civil Engg.', specialization:'Structural Engineering', selected:false },
  ],
  mbaConsidered: false, mscConsidered: false, phdApplicable:'',
  visitingMembers:'', pptRequired:'No', pptRoomCapacity:'', interviewRooms:'',
  onlineTestPlatform:'', laptopRequired:'No', laptopProvider:'',
  preferredDate1:'', preferredDate2:'', otherRequirements:'',
  signatoryName:'', signatoryDesignation:'', declarationDate:'',
};

function SectionHeader({ num, title }) {
  return (
    <div className="section-header">
      <span>{num.toString().padStart(2, '0')}</span>
      {title}
    </div>
  );
}

export default function FormPage() {
  const [data, setData] = useState(initialData);
  const [submitted, setSubmitted] = useState(false);

  const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const setNested = (field, key, value) =>
    setData(prev => ({ ...prev, [field]: { ...prev[field], [key]: value } }));

  const setArr = (field, idx, key, value) =>
    setData(prev => {
      const arr = [...prev[field]];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, [field]: arr };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.companyName.trim()) { alert('Company name is required.'); return; }
    try {
      await axios.post('http://localhost:5000/api/jnf/submit', data);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch {
      alert('Submission failed. Please try again.');
    }
  };

  if (submitted) return (
    <div className="form-wrapper">
      <div className="success-box">
        <h2>✅ JNF Submitted Successfully!</h2>
        <p>Thank you. The Training & Placement Department, NIT Srinagar will get in touch soon.</p>
        <p style={{ marginTop:16 }}>
          <a href="/" style={{ color:'#003087', fontWeight:600 }}>Submit another form</a>
        </p>
      </div>
    </div>
  );

  return (
    <div className="form-wrapper">
      {/* Header */}
      <div className="institute-header">
        <div className="header-logo-row">
          <img src={NITLogo} alt="NIT Srinagar" className="nit-logo" />
          <div className="header-text">
            <h2>राष्ट्रीय प्रौद्योगिकी संस्थान श्रीनगर</h2>
            <h2>NATIONAL INSTITUTE OF TECHNOLOGY SRINAGAR</h2>
            <p>(An autonomous Institute of National Importance under the aegis of Ministry of Education, Govt. of India)</p>
            <p style={{ marginTop:4, fontWeight:600, color:'#003087' }}>प्रशिक्षण और प्लेसमेंट विभाग | DEPARTMENT OF TRAINING & PLACEMENT</p>
          </div>
          <img src= {NITLogo} alt="NIT Srinagar" className="nit-logo" />
        </div>
      </div>

      <div className="form-title">Job Notification Form (JNF)</div>

      <form onSubmit={handleSubmit}>

        {/* ── Section 01 ─────────────────────────────── */}
        <SectionHeader num={1} title="COMPANY INFORMATION" />
        <table>
          <tbody>
            <tr>
              <td className="field-label">Company Name *</td>
              <td className="field-value"><input type="text" value={data.companyName} onChange={e => set('companyName', e.target.value)} required /></td>
              <td className="field-label">Sector</td>
              <td className="field-value"><input type="text" value={data.sector} onChange={e => set('sector', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="field-label">Address</td>
              <td className="field-value" colSpan={3}><input type="text" value={data.address} onChange={e => set('address', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="field-label">Company Website</td>
              <td className="field-value"><input type="url" value={data.website} onChange={e => set('website', e.target.value)} placeholder="https://" /></td>
              <td className="field-label">On-Campus Drive?</td>
              <td className="field-value">
                <div className="radio-group">
                  {['Yes','No'].map(v => 
                  <label key={v}>
                    <input type="radio" name="onCampus" value={v} checked={data.onCampusDrive===v} onChange={() => set('onCampusDrive', v)} /> 
                    {v}
                  </label>)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Section 02 ─────────────────────────────── */}
        <SectionHeader num={2} title="CONTACT PERSONS" />
        <table>
          <thead><tr><th>#</th><th>Name & Designation</th><th>Mobile No.</th><th>Email</th><th>Alternate Phone</th></tr></thead>
          <tbody>
            {data.contactPersons.map((c, i) => (
              <tr key={i}>
                <td style={{ width:30, textAlign:'center', fontWeight:600 }}>{i+1}</td>
                <td>
                  <input type="text" placeholder="Name" value={c.name} onChange={e => setArr('contactPersons', i, 'name', e.target.value)} style={{ width:'100%', marginBottom:3 }} />
                  <input type="text" placeholder="Designation" value={c.designation} onChange={e => setArr('contactPersons', i, 'designation', e.target.value)} style={{ width:'100%' }} />
                </td>
                <td><input type="text" value={c.mobile} onChange={e => setArr('contactPersons', i, 'mobile', e.target.value)} /></td>
                <td><input type="email" value={c.email} onChange={e => setArr('contactPersons', i, 'email', e.target.value)} /></td>
                <td><input type="text" value={c.alternatePhone} onChange={e => setArr('contactPersons', i, 'alternatePhone', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Section 03 ─────────────────────────────── */}
        <SectionHeader num={3} title="JOB PROFILE & COMPENSATION" />
        <p style={{ fontSize:12, color:'#666', marginBottom:8 }}><em>Note: Please attach a detailed company profile and job description with this form.</em></p>
        <table>
          <thead>
            <tr>
              <th>Course</th><th>Job Designation</th><th>CTC (LPA)</th><th>Fixed/In-Hand</th>
              <th>Variable Pay</th><th>Bonus/Perks</th><th>Job Location</th>
              <th>6M Intern+FTE (Y/N)</th><th>Stipend (if intern)</th>
            </tr>
          </thead>
          <tbody>
            {data.jobProfiles.map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight:600, background:'#e8eef7', whiteSpace:'nowrap' }}>{p.course}</td>
                {['jobDesignation','ctc','fixedInHand','variablePay','bonusPerks','jobLocation','internPlusFTE','stipend'].map(k => (
                  <td key={k}><input type="text" value={p[k]} onChange={e => setArr('jobProfiles', i, k, e.target.value)} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{ marginTop:8 }}>
          <tbody>
            <tr>
              <td className="field-label">Service Bond / Contract?</td>
              <td className="field-value">
                <div className="inline-cond">
                  <div className="radio-group">
                    {['Yes','No'].map(v => <label key={v}><input type="radio" name="bond" value={v} checked={data.serviceBond===v} onChange={() => set('serviceBond', v)} /> {v}</label>)}
                  </div>
                  {data.serviceBond === 'Yes' && <>
                    <span>Duration:</span><input type="text" value={data.serviceBondDuration} onChange={e => set('serviceBondDuration', e.target.value)} style={{ width:80 }} />
                    <span>Amount:</span><input type="text" value={data.serviceBondAmount} onChange={e => set('serviceBondAmount', e.target.value)} style={{ width:80 }} />
                    <span>Conditions:</span><input type="text" value={data.serviceBondConditions} onChange={e => set('serviceBondConditions', e.target.value)} style={{ width:160 }} />
                  </>}
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Relocation Allowance?</td>
              <td className="field-value">
                <div className="inline-cond">
                  <div className="radio-group">
                    {['Yes','No'].map(v => <label key={v}><input type="radio" name="reloc" value={v} checked={data.relocationAllowance===v} onChange={() => set('relocationAllowance', v)} /> {v}</label>)}
                  </div>
                  {data.relocationAllowance === 'Yes' && <><span>Details:</span><input type="text" value={data.relocationDetails} onChange={e => set('relocationDetails', e.target.value)} style={{ width:200 }} /></>}
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Work-From-Home / Hybrid?</td>
              <td className="field-value">
                <div className="radio-group">
                  {['On-site','Hybrid','Full Remote'].map(v => <label key={v}><input type="radio" name="workmode" value={v} checked={data.workMode===v} onChange={() => set('workMode', v)} /> {v}</label>)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Section 04 ─────────────────────────────── */}
        <SectionHeader num={4} title="SELECTION PROCESS" />
        <table>
          <thead><tr><th>S.No</th><th>Round Type</th><th>Duration (min)</th><th>Mode</th><th>Elimination?</th><th>Other Details</th></tr></thead>
          <tbody>
            {data.selectionRounds.map((r, i) => (
              <tr key={i}>
                <td style={{ textAlign:'center', fontWeight:600 }}>{i+1}</td>
                <td><input type="text" value={r.roundType} onChange={e => setArr('selectionRounds', i, 'roundType', e.target.value)} placeholder="e.g. Aptitude Test" /></td>
                <td><input type="text" value={r.duration} onChange={e => setArr('selectionRounds', i, 'duration', e.target.value)} /></td>
                <td>
                  <select value={r.mode} onChange={e => setArr('selectionRounds', i, 'mode', e.target.value)}>
                    <option value="">Select</option>
                    {['Online','Offline','Both'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </td>
                <td>
                  <div className="radio-group">
                    {['Yes','No'].map(v => <label key={v}><input type="radio" name={`elim_${i}`} value={v} checked={r.elimination===v} onChange={() => setArr('selectionRounds', i, 'elimination', v)} /> {v}</label>)}
                  </div>
                </td>
                <td><input type="text" value={r.otherDetails} onChange={e => setArr('selectionRounds', i, 'otherDetails', e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Section 05 ─────────────────────────────── */}
        <SectionHeader num={5} title="ELIGIBILITY CRITERIA" />
        <table>
          <tbody>
            <tr>
              <td className="field-label">Minimum CGPA / Percentage</td>
              <td className="field-value">
                <div className="inline-cond">
                  {['btech','mtech','mba','msc'].map(k => (
                    <span key={k}>{k.toUpperCase()}: <input type="text" value={data.minCGPA[k]} onChange={e => setNested('minCGPA', k, e.target.value)} style={{ width:60 }} /></span>
                  ))}
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Backlogs Allowed?</td>
              <td className="field-value">
                <div className="inline-cond">
                  <div className="radio-group">
                    {['Yes','No'].map(v => <label key={v}><input type="radio" name="backlogs" value={v} checked={data.backlogsAllowed===v} onChange={() => set('backlogsAllowed', v)} /> {v}</label>)}
                  </div>
                  {data.backlogsAllowed==='Yes' && <><span>Max:</span><input type="text" value={data.maxBacklogs} onChange={e => set('maxBacklogs', e.target.value)} style={{ width:60 }} /></>}
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Gap Year Allowed?</td>
              <td className="field-value">
                <div className="inline-cond">
                  <div className="radio-group">
                    {['Yes','No'].map(v => <label key={v}><input type="radio" name="gap" value={v} checked={data.gapYearAllowed===v} onChange={() => set('gapYearAllowed', v)} /> {v}</label>)}
                  </div>
                  {data.gapYearAllowed==='Yes' && <><span>Max Gap:</span><input type="text" value={data.maxGap} onChange={e => set('maxGap', e.target.value)} style={{ width:80 }} /></>}
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">10th / 12th % Cut-off</td>
              <td className="field-value">
                <div className="inline-cond">
                  <span>10th: <input type="text" value={data.tenthCutoff} onChange={e => set('tenthCutoff', e.target.value)} style={{ width:70 }} /></span>
                  <span>12th: <input type="text" value={data.twelfthCutoff} onChange={e => set('twelfthCutoff', e.target.value)} style={{ width:70 }} /></span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Additional Criteria</td>
              <td className="field-value"><input type="text" value={data.additionalCriteria} onChange={e => set('additionalCriteria', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="field-label">Skills / Certifications Required</td>
              <td className="field-value"><input type="text" value={data.skillsRequired} onChange={e => set('skillsRequired', e.target.value)} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── Section 06 ─────────────────────────────── */}
        <SectionHeader num={6} title="BRANCHES / COURSES CONSIDERED" />
        <p style={{ fontWeight:600, fontSize:13, margin:'8px 0 4px' }}>B.Tech. (Undergraduate Programme)</p>
        <table>
          <thead>
            <tr>
              {['Chemical','Civil','CSE','Electrical','ECE','IT','Mechanical','Metallurgy & Materials'].map(b => <th key={b}>{b}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {['chemical','civil','cse','electrical','ece','it','mechanical','metallurgy'].map(k => (
                <td key={k} style={{ textAlign:'center' }}>
                  <div className="radio-group">
                    <label><input type="radio" name={`bt_${k}`} checked={data.btechBranches[k]===true} onChange={() => setNested('btechBranches', k, true)} /> Y</label>
                    <label><input type="radio" name={`bt_${k}`} checked={data.btechBranches[k]===false} onChange={() => setNested('btechBranches', k, false)} /> N</label>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <p style={{ fontWeight:600, fontSize:13, margin:'10px 0 4px' }}>M.Tech. (Postgraduate Programme) — Specializations</p>
        <table>
          <thead><tr><th>Department</th><th>Specialization</th><th>Y/N</th><th>Department</th><th>Specialization</th><th>Y/N</th></tr></thead>
          <tbody>
            {Array.from({ length: Math.ceil(data.mtechSpecializations.length / 2) }, (_, row) => {
              const a = data.mtechSpecializations[row * 2];
              const b = data.mtechSpecializations[row * 2 + 1];
              return (
                <tr key={row}>
                  <td style={{ fontWeight:600, fontSize:12 }}>{a?.department}</td>
                  <td>{a?.specialization}</td>
                  <td style={{ textAlign:'center' }}>
                    {a && <div className="radio-group">
                      <label><input type="radio" name={`mtech_${row*2}`} checked={a.selected===true} onChange={() => setArr('mtechSpecializations', row*2, 'selected', true)} /> Y</label>
                      <label><input type="radio" name={`mtech_${row*2}`} checked={a.selected===false} onChange={() => setArr('mtechSpecializations', row*2, 'selected', false)} /> N</label>
                    </div>}
                  </td>
                  <td style={{ fontWeight:600, fontSize:12 }}>{b?.department || ''}</td>
                  <td>{b?.specialization || ''}</td>
                  <td style={{ textAlign:'center' }}>
                    {b && <div className="radio-group">
                      <label><input type="radio" name={`mtech_${row*2+1}`} checked={b.selected===true} onChange={() => setArr('mtechSpecializations', row*2+1, 'selected', true)} /> Y</label>
                      <label><input type="radio" name={`mtech_${row*2+1}`} checked={b.selected===false} onChange={() => setArr('mtechSpecializations', row*2+1, 'selected', false)} /> N</label>
                    </div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <table style={{ marginTop:8 }}>
          <thead><tr><th>MBA</th><th>Y/N</th><th>M.Sc.</th><th>Y/N</th><th>Ph.D. (If Applicable)</th></tr></thead>
          <tbody>
            <tr>
              <td style={{ fontSize:12 }}>MBA (General Management / Finance / Marketing / HR / Ops)</td>
              <td style={{ textAlign:'center' }}>
                <div className="radio-group">
                  <label><input type="radio" name="mba" checked={data.mbaConsidered===true} onChange={() => set('mbaConsidered', true)} /> Y</label>
                  <label><input type="radio" name="mba" checked={data.mbaConsidered===false} onChange={() => set('mbaConsidered', false)} /> N</label>
                </div>
              </td>
              <td style={{ fontSize:12 }}>M.Sc. Physics / Chemistry / Mathematics / Others</td>
              <td style={{ textAlign:'center' }}>
                <div className="radio-group">
                  <label><input type="radio" name="msc" checked={data.mscConsidered===true} onChange={() => set('mscConsidered', true)} /> Y</label>
                  <label><input type="radio" name="msc" checked={data.mscConsidered===false} onChange={() => set('mscConsidered', false)} /> N</label>
                </div>
              </td>
              <td><input type="text" value={data.phdApplicable} onChange={e => set('phdApplicable', e.target.value)} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── Section 07 ─────────────────────────────── */}
        <SectionHeader num={7} title="LOGISTICAL REQUIREMENTS" />
        <table>
          <tbody>
            <tr>
              <td className="field-label">No. of Visiting Members</td>
              <td className="field-value"><input type="text" value={data.visitingMembers} onChange={e => set('visitingMembers', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="field-label">Pre-Placement Talk (PPT)?</td>
              <td className="field-value">
                <div className="inline-cond">
                  <div className="radio-group">
                    {['Yes','No'].map(v => <label key={v}><input type="radio" name="ppt" value={v} checked={data.pptRequired===v} onChange={() => set('pptRequired', v)} /> {v}</label>)}
                  </div>
                  {data.pptRequired==='Yes' && <><span>Room Capacity:</span><input type="text" value={data.pptRoomCapacity} onChange={e => set('pptRoomCapacity', e.target.value)} style={{ width:80 }} /></>}
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Interview Rooms Required</td>
              <td className="field-value"><input type="text" value={data.interviewRooms} onChange={e => set('interviewRooms', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="field-label">Online Test Platform</td>
              <td className="field-value"><input type="text" value={data.onlineTestPlatform} onChange={e => set('onlineTestPlatform', e.target.value)} placeholder="e.g. HackerRank / AMCAT / Own Platform" /></td>
            </tr>
            <tr>
              <td className="field-label">Laptop / Device Required?</td>
              <td className="field-value">
                <div className="inline-cond">
                  <div className="radio-group">
                    {['Yes','No'].map(v => <label key={v}><input type="radio" name="laptop" value={v} checked={data.laptopRequired===v} onChange={() => set('laptopRequired', v)} /> {v}</label>)}
                  </div>
                  {data.laptopRequired==='Yes' && (
                    <div className="radio-group">
                      {['Bring Own','Institute to Provide'].map(v => <label key={v}><input type="radio" name="laptopProvider" value={v} checked={data.laptopProvider===v} onChange={() => set('laptopProvider', v)} /> {v}</label>)}
                    </div>
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Preferred Date(s) for Drive</td>
              <td className="field-value">
                <div className="inline-cond">
                  <span>1st: <input type="date" value={data.preferredDate1} onChange={e => set('preferredDate1', e.target.value)} /></span>
                  <span>2nd: <input type="date" value={data.preferredDate2} onChange={e => set('preferredDate2', e.target.value)} /></span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="field-label">Other Requirements</td>
              <td className="field-value"><input type="text" value={data.otherRequirements} onChange={e => set('otherRequirements', e.target.value)} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── Section 08 ─────────────────────────────── */}
        <SectionHeader num={8} title="DECLARATION & SIGNATURE" />
        <p style={{ fontSize:12, color:'#555', marginBottom:10, fontStyle:'italic' }}>
          I/We hereby confirm that the information provided in this Job Notification Form is accurate and complete.
          We agree to abide by the placement policies of the Training & Placement Department, NIT Srinagar.
        </p>
        <table>
          <tbody>
            <tr>
              <td className="field-label">Name of Authorized Signatory</td>
              <td className="field-value"><input type="text" value={data.signatoryName} onChange={e => set('signatoryName', e.target.value)} /></td>
              <td className="field-label">Designation</td>
              <td className="field-value"><input type="text" value={data.signatoryDesignation} onChange={e => set('signatoryDesignation', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="field-label">Date</td>
              <td className="field-value"><input type="date" value={data.declarationDate} onChange={e => set('declarationDate', e.target.value)} /></td>
              <td className="field-label">Company Seal & Signature</td>
              <td className="field-value" style={{ height:60, color:'#aaa', fontStyle:'italic', fontSize:12 }}>Submitted digitally via portal</td>
            </tr>
          </tbody>
        </table>

        <button type="submit" className="submit-btn">Submit</button>
      </form>

      {/* Footer */}
      <div className="form-footer">
        <p><strong>Postal Address:</strong> Office, Dept. of Training & Placement, National Institute of Technology, Srinagar – 190006, J&K (India)</p>
        <p>Contact: +91 941922xxxx, +91 941922xxxx</p>
      </div>
      <div className="admin-access-bar">
        T&P Staff: <Link to="/admin">Admin Portal →</Link>
      </div>
    </div>
  );
}