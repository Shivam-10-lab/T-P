import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/jnf';

const badgeClass = (s) => ({
  Pending: 'badge badge-pending',
  Reviewed: 'badge badge-reviewed',
  Approved: 'badge badge-approved',
  Rejected: 'badge badge-rejected',
}[s] || 'badge');

export default function AdminPanel() {  
  const navigate = useNavigate();
  const token = localStorage.getItem('jnf_token');
  const [jnfs, setJnfs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    fetchAll();
  }, []);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    const res = await axios.get(`${API}/admin/all`, { headers });
    setJnfs(res.data);
  };

  const openDetail = async (id) => {
    const res = await axios.get(`${API}/admin/${id}`, { headers });
    setSelected(res.data);
    setNewStatus(res.data.status);
  };

  const updateStatus = async () => {
    await axios.patch(`${API}/admin/${selected._id}/status`, { status: newStatus }, { headers });
    fetchAll();
    setSelected(prev => ({ ...prev, status: newStatus }));
    alert('Status updated!');
  };

  const deleteJnf = async (id) => {
    if (!confirm('Delete this JNF?')) return;
    await axios.delete(`${API}/admin/${id}`, { headers });
    setSelected(null);
    fetchAll();
  };

  const logout = () => { localStorage.removeItem('jnf_token'); navigate('/admin'); };

  const counts = {
    total: jnfs.length,
    pending: jnfs.filter(j => j.status === 'Pending').length,
    approved: jnfs.filter(j => j.status === 'Approved').length,
    rejected: jnfs.filter(j => j.status === 'Rejected').length,
  };

  const filtered = jnfs.filter(j =>
    j.companyName.toLowerCase().includes(search.toLowerCase()) ||
    j.sector?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-wrapper">
      <div className="admin-nav">
        <h1>🎓 NIT Srinagar — T&P Admin Dashboard</h1>
        {/* Added a small wrapper to keep the buttons neatly side-by-side */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/')}>Back to Form</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      <div className="admin-content">
        <div className="stats-row">
          {[['Total JNFs', counts.total], ['Pending', counts.pending], ['Approved', counts.approved], ['Rejected', counts.rejected]].map(([l, n]) => (
            <div className="stat-card" key={l}><div className="num">{n}</div><div className="lbl">{l}</div></div>
          ))}
        </div>

        <div className="table-card">
          <div className="table-card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>All Submitted JNFs</span>
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border:'1px solid #fff', background:'rgba(255,255,255,0.15)', color:'#fff', padding:'4px 10px', borderRadius:'3px', fontSize:'13px', outline:'none', width:'200px' }}
            />
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Company</th><th>Sector</th><th>On Campus</th>
                <th>Submitted</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'20px', color:'#888' }}>No submissions yet.</td></tr>
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
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>JNF Detail — {selected.companyName}</h2>
              <button onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">

              <div className="detail-section">
                <h3>01 Company Information</h3>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Company:</strong> {selected.companyName}</div>
                  <div className="detail-item"><strong>Sector:</strong> {selected.sector}</div>
                  <div className="detail-item"><strong>Address:</strong> {selected.address}</div>
                  <div className="detail-item"><strong>Website:</strong> {selected.website}</div>
                  <div className="detail-item"><strong>On-Campus Drive:</strong> {selected.onCampusDrive}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>02 Contact Persons</h3>
                <table><thead><tr><th>Name</th><th>Designation</th><th>Mobile</th><th>Email</th></tr></thead>
                  <tbody>{selected.contactPersons?.map((c,i) => (
                    <tr key={i}><td>{c.name}</td><td>{c.designation}</td><td>{c.mobile}</td><td>{c.email}</td></tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="detail-section">
                <h3>03 Job Profiles</h3>
                <table><thead><tr><th>Course</th><th>Designation</th><th>CTC</th><th>Fixed</th><th>Variable</th><th>Location</th></tr></thead>
                  <tbody>{selected.jobProfiles?.map((p,i) => (
                    <tr key={i}><td>{p.course}</td><td>{p.jobDesignation}</td><td>{p.ctc}</td><td>{p.fixedInHand}</td><td>{p.variablePay}</td><td>{p.jobLocation}</td></tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="detail-section">
                <h3>04 Selection Rounds</h3>
                <table><thead><tr><th>#</th><th>Round</th><th>Duration</th><th>Mode</th><th>Elimination</th><th>Details</th></tr></thead>
                  <tbody>{selected.selectionRounds?.map((r,i) => (
                    <tr key={i}><td>{i+1}</td><td>{r.roundType}</td><td>{r.duration}</td><td>{r.mode}</td><td>{r.elimination}</td><td>{r.otherDetails}</td></tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="detail-section">
                <h3>05 Eligibility</h3>
                <div className="detail-grid">
                  <div className="detail-item"><strong>B.Tech CGPA:</strong> {selected.minCGPA?.btech}</div>
                  <div className="detail-item"><strong>M.Tech CGPA:</strong> {selected.minCGPA?.mtech}</div>
                  <div className="detail-item"><strong>Backlogs:</strong> {selected.backlogsAllowed} {selected.maxBacklogs && `(Max: ${selected.maxBacklogs})`}</div>
                  <div className="detail-item"><strong>Gap Year:</strong> {selected.gapYearAllowed} {selected.maxGap && `(Max: ${selected.maxGap})`}</div>
                  <div className="detail-item"><strong>10th Cutoff:</strong> {selected.tenthCutoff}</div>
                  <div className="detail-item"><strong>12th Cutoff:</strong> {selected.twelfthCutoff}</div>
                  <div className="detail-item"><strong>Skills:</strong> {selected.skillsRequired}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>06 Branches Considered</h3>
                <div className="detail-grid">
                  {selected.btechBranches && Object.entries(selected.btechBranches).map(([k,v]) => (
                    <div className="detail-item" key={k}><strong>{k.toUpperCase()}:</strong> {v ? '✅ Yes' : '❌ No'}</div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>07 Logistics</h3>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Visiting Members:</strong> {selected.visitingMembers}</div>
                  <div className="detail-item"><strong>PPT Required:</strong> {selected.pptRequired}</div>
                  <div className="detail-item"><strong>Interview Rooms:</strong> {selected.interviewRooms}</div>
                  <div className="detail-item"><strong>Test Platform:</strong> {selected.onlineTestPlatform}</div>
                  <div className="detail-item"><strong>Preferred Date 1:</strong> {selected.preferredDate1}</div>
                  <div className="detail-item"><strong>Preferred Date 2:</strong> {selected.preferredDate2}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>08 Declaration</h3>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Signatory:</strong> {selected.signatoryName}</div>
                  <div className="detail-item"><strong>Designation:</strong> {selected.signatoryDesignation}</div>
                  <div className="detail-item"><strong>Date:</strong> {selected.declarationDate}</div>
                </div>
              </div>

              <div className="status-control">
                <strong>Update Status:</strong>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {['Pending','Reviewed','Approved','Rejected'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={updateStatus}>Save</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}