import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://t-p-8vkw.onrender.com/api/jnf';

const badgeClass = (s) => ({
  Pending: 'badge badge-pending',
  Reviewed: 'badge badge-reviewed',
  Approved: 'badge badge-approved',
  Rejected: 'badge badge-rejected',
}[s] || 'badge');

const Row = ({ label, value }) => (
  <tr>
    <td className="detail-label">{label}</td>
    <td className="detail-value">{value || <span className="na">—</span>}</td>
  </tr>
);

const SectionHead = ({ num, title }) => (
  <div className="detail-section-head">
    <span className="detail-section-num">{String(num).padStart(2, '0')}</span>
    {title}
  </div>
);

const ScrollTable = ({ children }) => (
  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
    {children}
  </div>
);

export default function AdminPanel() {
  const navigate = useNavigate();
  //const token = localStorage.getItem('jnf_token');
  const [jnfs, setJnfs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
  fetchAll().catch(() => navigate('/admin'));
}, []);

  //const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    const res = await axios.get(`${API}/admin/all`, { withCredentials: true } );
    setJnfs(res.data);
  };

  const openDetail = async (id) => {
    const res = await axios.get(`${API}/admin/${id}`, { withCredentials: true });
    setSelected(res.data);
    setNewStatus(res.data.status);
    setTimeout(() => {
      document.getElementById('modal-top')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const updateStatus = async () => {
    await axios.patch(`${API}/admin/${selected._id}/status`, { status: newStatus }, { withCredentials: true });
    fetchAll();
    setSelected(prev => ({ ...prev, status: newStatus }));
    alert('Status updated!');
  };

  const deleteJnf = async (id) => {
    if (!confirm('Delete this JNF?')) return;
    await axios.delete(`${API}/admin/${id}`, { withCredentials: true });
    setSelected(null);
    fetchAll();
  };
const logout = async () => {
  await axios.post(`${API}/admin/logout`, {}, { withCredentials: true });
  navigate('/admin');
};

  const counts = {
    total: jnfs.length,
    pending: jnfs.filter(j => j.status === 'Pending').length,
    approved: jnfs.filter(j => j.status === 'Approved').length,
    rejected: jnfs.filter(j => j.status === 'Rejected').length,
  };

  const filtered = jnfs.filter(j =>
    j.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    j.sector?.toLowerCase().includes(search.toLowerCase())
  );

  const bool = (v) => v ? '✅ Yes' : '❌ No';
  const yn = (v) => v === 'Yes' ? '✅ Yes' : v === 'No' ? '❌ No' : v || '—';

  return (
    <div className="admin-wrapper">
      <div className="admin-nav">
        <h1>🎓 NIT Srinagar — T&P Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/')}>← Back to Form</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="admin-content">

        {/* ── Stats ── */}
        <div className="stats-row">
          {[['Total JNFs', counts.total], ['Pending', counts.pending], ['Approved', counts.approved], ['Rejected', counts.rejected]].map(([l, n]) => (
            <div className="stat-card" key={l}>
              <div className="num">{n}</div>
              <div className="lbl">{l}</div>
            </div>
          ))}
        </div>

        {/* ── Main Table ── */}
        <div className="table-card">
          <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span>All Submitted JNFs</span>
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: '1px solid #fff', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 10px', borderRadius: '3px', fontSize: '13px', outline: 'none', width: '200px' }}
            />
          </div>
          <ScrollTable>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Company</th><th>Sector</th><th>On Campus</th>
                  <th>Submitted</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No submissions yet.</td></tr>
                ) : filtered.map((j, i) => (
                  <tr key={j._id}>
                    <td>{i + 1}</td>
                    <td><strong>{j.companyName}</strong></td>
                    <td>{j.sector}</td>
                    <td>{j.onCampusDrive}</td>
                    <td>{new Date(j.submittedAt).toLocaleDateString('en-IN')}</td>
                    <td><span className={badgeClass(j.status)}>{j.status}</span></td>
                    <td>
                      <button className="btn-view" onClick={() => openDetail(j._id)}>View</button>
                      <button className="btn-delete" onClick={() => deleteJnf(j._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollTable>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FULL DETAIL MODAL
      ══════════════════════════════════════════════════════ */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} id="modal-top">

            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0 }}>{selected.companyName}</h2>
                <div style={{ fontSize: 12, marginTop: 3, opacity: 0.8 }}>
                  Submitted: {new Date(selected.submittedAt).toLocaleString('en-IN')} &nbsp;|&nbsp;
                  <span className={badgeClass(selected.status)} style={{ fontSize: 11 }}>{selected.status}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="modal-body">

              {/* ── Section 01: Company Info ── */}
              <SectionHead num={1} title="Company Information" />
              <ScrollTable>
                <table className="detail-table">
                  <tbody>
                    <Row label="Company Name" value={selected.companyName} />
                    <Row label="Sector" value={selected.sector} />
                    <Row label="Address" value={selected.address} />
                    <Row label="Website" value={
                      selected.website
                        ? <a href={selected.website} target="_blank" rel="noreferrer">{selected.website}</a>
                        : null
                    } />
                    <Row label="On-Campus Drive" value={yn(selected.onCampusDrive)} />
                  </tbody>
                </table>
              </ScrollTable>

              {/* ── Section 02: Contact Persons ── */}
              <SectionHead num={2} title="Contact Persons" />
              {selected.contactPersons?.filter(c => c.name || c.email || c.mobile).length === 0
                ? <p className="no-data">No contact persons added.</p>
                : <ScrollTable>
                    <table className="detail-table full-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Designation</th>
                          <th>Mobile</th>
                          <th>Email</th>
                          <th>Alternate Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.contactPersons?.map((c, i) => (
                          (c.name || c.email || c.mobile) &&
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{c.name || '—'}</td>
                            <td>{c.designation || '—'}</td>
                            <td>{c.mobile || '—'}</td>
                            <td>{c.email || '—'}</td>
                            <td>{c.alternatePhone || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollTable>
              }

              {/* ── Section 03: Job Profiles ── */}
              <SectionHead num={3} title="Job Profile & Compensation" />
              {selected.jobProfiles?.filter(p => p.jobDesignation || p.ctc).length === 0
                ? <p className="no-data">No job profiles filled.</p>
                : <ScrollTable>
                    <table className="detail-table full-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Job Designation</th>
                          <th>CTC (LPA)</th>
                          <th>Fixed / In-Hand</th>
                          <th>Variable Pay</th>
                          <th>Bonus / Perks</th>
                          <th>Job Location</th>
                          <th>6M Intern + FTE</th>
                          <th>Stipend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.jobProfiles?.map((p, i) => (
                          <tr key={i}>
                            <td><strong>{p.course}</strong></td>
                            <td>{p.jobDesignation || '—'}</td>
                            <td>{p.ctc || '—'}</td>
                            <td>{p.fixedInHand || '—'}</td>
                            <td>{p.variablePay || '—'}</td>
                            <td>{p.bonusPerks || '—'}</td>
                            <td>{p.jobLocation || '—'}</td>
                            <td>{p.internPlusFTE || '—'}</td>
                            <td>{p.stipend || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollTable>
              }

              <ScrollTable>
                <table className="detail-table" style={{ marginTop: 10 }}>
                  <tbody>
                    <Row label="Service Bond / Contract" value={yn(selected.serviceBond)} />
                    {selected.serviceBond === 'Yes' && <>
                      <Row label="Bond Duration" value={selected.serviceBondDuration} />
                      <Row label="Bond Amount" value={selected.serviceBondAmount} />
                      <Row label="Bond Conditions" value={selected.serviceBondConditions} />
                    </>}
                    <Row label="Relocation Allowance" value={yn(selected.relocationAllowance)} />
                    {selected.relocationAllowance === 'Yes' &&
                      <Row label="Relocation Details" value={selected.relocationDetails} />
                    }
                    <Row label="Work Mode" value={selected.workMode} />
                  </tbody>
                </table>
              </ScrollTable>

              {/* ── Section 04: Selection Process ── */}
              <SectionHead num={4} title="Selection Process" />
              {selected.selectionRounds?.filter(r => r.roundType).length === 0
                ? <p className="no-data">No selection rounds filled.</p>
                : <ScrollTable>
                    <table className="detail-table full-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Round Type</th>
                          <th>Duration (min)</th>
                          <th>Mode</th>
                          <th>Elimination?</th>
                          <th>Other Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.selectionRounds?.filter(r => r.roundType).map((r, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{r.roundType}</td>
                            <td>{r.duration || '—'}</td>
                            <td>{r.mode || '—'}</td>
                            <td>{yn(r.elimination)}</td>
                            <td>{r.otherDetails || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollTable>
              }

              {/* ── Section 05: Eligibility ── */}
              <SectionHead num={5} title="Eligibility Criteria" />
              <ScrollTable>
                <table className="detail-table">
                  <tbody>
                    <tr>
                      <td className="detail-label">Minimum CGPA</td>
                      <td className="detail-value">
                        <span className="chip">B.Tech: {selected.minCGPA?.btech || '—'}</span>
                        <span className="chip">M.Tech: {selected.minCGPA?.mtech || '—'}</span>
                        <span className="chip">MBA: {selected.minCGPA?.mba || '—'}</span>
                        <span className="chip">M.Sc: {selected.minCGPA?.msc || '—'}</span>
                      </td>
                    </tr>
                    <Row label="Backlogs Allowed" value={yn(selected.backlogsAllowed)} />
                    {selected.backlogsAllowed === 'Yes' &&
                      <Row label="Max Backlogs" value={selected.maxBacklogs} />
                    }
                    <Row label="Gap Year Allowed" value={yn(selected.gapYearAllowed)} />
                    {selected.gapYearAllowed === 'Yes' &&
                      <Row label="Max Gap" value={selected.maxGap} />
                    }
                    <Row label="10th % Cut-off" value={selected.tenthCutoff} />
                    <Row label="12th % Cut-off" value={selected.twelfthCutoff} />
                    <Row label="Additional Criteria" value={selected.additionalCriteria} />
                    <Row label="Skills / Certifications Required" value={selected.skillsRequired} />
                  </tbody>
                </table>
              </ScrollTable>

              {/* ── Section 06: Branches ── */}
              <SectionHead num={6} title="Branches / Courses Considered" />
              <p className="subsection-label">B.Tech. Branches</p>
              <ScrollTable>
                <table className="detail-table full-table">
                  <thead>
                    <tr>
                      <th>Chemical</th><th>Civil</th><th>CSE</th><th>Electrical</th>
                      <th>ECE</th><th>IT</th><th>Mechanical</th><th>Metallurgy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {['chemical', 'civil', 'cse', 'electrical', 'ece', 'it', 'mechanical', 'metallurgy'].map(k => (
                        <td key={k} style={{ textAlign: 'center' }}>
                          {selected.btechBranches?.[k] ? '✅' : '❌'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </ScrollTable>

              <p className="subsection-label" style={{ marginTop: 12 }}>M.Tech. Specializations</p>
              {selected.mtechSpecializations?.filter(s => s.selected).length === 0
                ? <p className="no-data">No M.Tech specializations selected.</p>
                : <ScrollTable>
                    <table className="detail-table full-table">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>Specialization</th>
                          <th>Selected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.mtechSpecializations?.map((s, i) => (
                          <tr key={i} style={{ opacity: s.selected ? 1 : 0.45 }}>
                            <td>{s.department}</td>
                            <td>{s.specialization}</td>
                            <td style={{ textAlign: 'center' }}>{s.selected ? '✅' : '❌'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollTable>
              }

              <ScrollTable>
                <table className="detail-table" style={{ marginTop: 10 }}>
                  <tbody>
                    <Row label="MBA Considered" value={bool(selected.mbaConsidered)} />
                    <Row label="M.Sc. Considered" value={bool(selected.mscConsidered)} />
                    <Row label="Ph.D. (If Applicable)" value={selected.phdApplicable} />
                  </tbody>
                </table>
              </ScrollTable>

              {/* ── Section 07: Logistics ── */}
              <SectionHead num={7} title="Logistical Requirements" />
              <ScrollTable>
                <table className="detail-table">
                  <tbody>
                    <Row label="No. of Visiting Members" value={selected.visitingMembers} />
                    <Row label="Pre-Placement Talk (PPT)" value={yn(selected.pptRequired)} />
                    {selected.pptRequired === 'Yes' &&
                      <Row label="PPT Room Capacity" value={selected.pptRoomCapacity} />
                    }
                    <Row label="Interview Rooms Required" value={selected.interviewRooms} />
                    <Row label="Online Test Platform" value={selected.onlineTestPlatform} />
                    <Row label="Laptop / Device Required" value={yn(selected.laptopRequired)} />
                    {selected.laptopRequired === 'Yes' &&
                      <Row label="Laptop Provider" value={selected.laptopProvider} />
                    }
                    <Row label="Preferred Date 1" value={selected.preferredDate1} />
                    <Row label="Preferred Date 2" value={selected.preferredDate2} />
                    <Row label="Other Requirements" value={selected.otherRequirements} />
                  </tbody>
                </table>
              </ScrollTable>

              {/* ── Section 08: Declaration ── */}
              <SectionHead num={8} title="Declaration & Signature" />
              <ScrollTable>
                <table className="detail-table">
                  <tbody>
                    <Row label="Authorized Signatory" value={selected.signatoryName} />
                    <Row label="Designation" value={selected.signatoryDesignation} />
                    <Row label="Date" value={selected.declarationDate} />
                    <Row label="Submission Timestamp" value={new Date(selected.createdAt).toLocaleString('en-IN')} />
                  </tbody>
                </table>
              </ScrollTable>

              {/* ── Status Control ── */}
              <div className="status-control">
                <strong>Update Status:</strong>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {['Pending', 'Reviewed', 'Approved', 'Rejected'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button onClick={updateStatus}>Save</button>
                <button
                  onClick={() => deleteJnf(selected._id)}
                  style={{ background: '#dc3545', marginLeft: 'auto' }}
                >
                  Delete This JNF
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}