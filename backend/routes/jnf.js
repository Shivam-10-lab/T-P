const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JNF = require('../models/JNF');
const auth = require('../middleware/auth');
const ExcelJS = require('exceljs');
require('dotenv').config();

// ── PUBLIC: Submit JNF ──────────────────────────────────────────
router.post('/submit', async (req, res) => {
  try {
    const jnf = new JNF(req.body);
    await jnf.save();
    res.status(201).json({ message: 'JNF submitted successfully', id: jnf._id });
  } catch (err) {
    res.status(400).json({ message: 'Submission failed', error: err.message });
  }
});

// ── ADMIN: Login ────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (
    email !== process.env.ADMIN_EMAIL || !(await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH))
  ) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8h' });

  res.cookie('admin_token', token, {
      httpOnly: true,
      secure: true,          // required for cross-site
      sameSite: 'none',      // required for cross-site (Vercel → Render)
      maxAge: 8 * 60 * 60 * 1000
  });
  res.json({ message: 'Login successful'});
});

// ── ADMIN: Get all JNFs ─────────────────────────────────────────
router.get('/admin/all', auth, async (req, res) => {
  try {
    const jnfs = await JNF.find().sort({ submittedAt: -1 });
    res.json(jnfs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching JNFs' });
  }
});

// ── ADMIN: Get single JNF ───────────────────────────────────────
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const jnf = await JNF.findById(req.params.id);
    if (!jnf) return res.status(404).json({ message: 'JNF not found' });
    res.json(jnf);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching JNF' });
  }
});

// ── ADMIN: Update status ────────────────────────────────────────
router.patch('/admin/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const jnf = await JNF.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ message: 'Status updated', jnf });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

// ── ADMIN: Delete JNF ───────────────────────────────────────────
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    await JNF.findByIdAndDelete(req.params.id);
    res.json({ message: 'JNF deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting JNF' });
  }
});

router.post('/admin/logout', (req, res) => {
 res.clearCookie('admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Logged out' });
});


router.get('/admin/export/excel', auth, async (req, res) => {
  try {
    const jnfs = await JNF.find().sort({ submittedAt: -1 });
    const workbook = new ExcelJS.Workbook();

    // ─── Helper: style a header cell ───────────────────────────────────────
    const styleHeader = (cell, bgArgb = 'FF003087') => {
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.font   = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    };

    const styleSubHeader = (cell) => {
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
      cell.font   = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    };

    const STATUS_COLORS = {
      Approved: 'FFd4edda', Rejected: 'FFf8d7da',
      Reviewed:  'FFcce5ff', Pending:  'FFfff3cd',
    };

    const altFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' } };
    const applyAlt = (row, idx) => {
      if (idx % 2 === 1) {
        row.eachCell(cell => {
          if (!cell.fill?.fgColor?.argb || cell.fill.fgColor.argb === 'FFFFFFFF')
            cell.fill = altFill;
        });
      }
    };

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 1 – Overview
    // ══════════════════════════════════════════════════════════════════════
    const ws1 = workbook.addWorksheet('Overview');
    ws1.columns = [
      { header: 'S.No',              key: 'sno',              width: 6  },
      { header: 'Company',           key: 'company',          width: 28 },
      { header: 'Sector',            key: 'sector',           width: 18 },
      { header: 'Address',           key: 'address',          width: 32 },
      { header: 'Website',           key: 'website',          width: 28 },
      { header: 'On Campus Drive',   key: 'onCampus',         width: 14 },
      { header: 'Work Mode',         key: 'workMode',         width: 14 },
      { header: 'Status',            key: 'status',           width: 12 },
      { header: 'Submitted At',      key: 'submittedAt',      width: 22 },
    ];
    ws1.getRow(1).eachCell(styleHeader);
    ws1.getRow(1).height = 22;

    jnfs.forEach((j, idx) => {
      const row = ws1.addRow({
        sno:         idx + 1,
        company:     j.companyName,
        sector:      j.sector,
        address:     j.address,
        website:     j.website,
        onCampus:    j.onCampusDrive,
        workMode:    j.workMode,
        status:      j.status,
        submittedAt: new Date(j.submittedAt).toLocaleString('en-IN'),
      });
      const sc = row.getCell('status');
      sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STATUS_COLORS[j.status] || 'FFFFFFFF' } };
      applyAlt(row, idx);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 2 – Contact Persons (up to 3 per JNF)
    // ══════════════════════════════════════════════════════════════════════
    const ws2 = workbook.addWorksheet('Contact Persons');
    ws2.columns = [
      { header: 'S.No',           key: 'sno',         width: 6  },
      { header: 'Company',        key: 'company',     width: 28 },
      { header: 'Contact #',      key: 'num',         width: 10 },
      { header: 'Name',           key: 'name',        width: 22 },
      { header: 'Designation',    key: 'designation', width: 22 },
      { header: 'Mobile',         key: 'mobile',      width: 16 },
      { header: 'Alternate Phone',key: 'altPhone',    width: 16 },
      { header: 'Email',          key: 'email',       width: 28 },
    ];
    ws2.getRow(1).eachCell(styleHeader);
    ws2.getRow(1).height = 22;

    let r2 = 0;
    jnfs.forEach((j, idx) => {
      (j.contactPersons || []).forEach((cp, ci) => {
        const row = ws2.addRow({
          sno:         idx + 1,
          company:     j.companyName,
          num:         ci + 1,
          name:        cp.name,
          designation: cp.designation,
          mobile:      cp.mobile,
          altPhone:    cp.alternatePhone,
          email:       cp.email,
        });
        applyAlt(row, r2++);
      });
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 3 – Job Profiles
    // ══════════════════════════════════════════════════════════════════════
    const ws3 = workbook.addWorksheet('Job Profiles');
    ws3.columns = [
      { header: 'S.No',             key: 'sno',         width: 6  },
      { header: 'Company',          key: 'company',     width: 28 },
      { header: 'Course',           key: 'course',      width: 10 },
      { header: 'Job Designation',  key: 'jobDes',      width: 24 },
      { header: 'CTC',              key: 'ctc',         width: 14 },
      { header: 'Fixed In-Hand',    key: 'fixed',       width: 14 },
      { header: 'Variable Pay',     key: 'variable',    width: 14 },
      { header: 'Bonus/Perks',      key: 'bonus',       width: 14 },
      { header: 'Job Location',     key: 'location',    width: 20 },
      { header: 'Intern+FTE',       key: 'internFTE',   width: 14 },
      { header: 'Stipend',          key: 'stipend',     width: 14 },
    ];
    ws3.getRow(1).eachCell(styleHeader);
    ws3.getRow(1).height = 22;

    let r3 = 0;
    jnfs.forEach((j, idx) => {
      (j.jobProfiles || []).forEach(p => {
        const row = ws3.addRow({
          sno:       idx + 1,
          company:   j.companyName,
          course:    p.course,
          jobDes:    p.jobDesignation,
          ctc:       p.ctc,
          fixed:     p.fixedInHand,
          variable:  p.variablePay,
          bonus:     p.bonusPerks,
          location:  p.jobLocation,
          internFTE: p.internPlusFTE,
          stipend:   p.stipend,
        });
        applyAlt(row, r3++);
      });
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 4 – Eligibility Criteria
    // ══════════════════════════════════════════════════════════════════════
    const ws4 = workbook.addWorksheet('Eligibility');
    ws4.columns = [
      { header: 'S.No',                  key: 'sno',           width: 6  },
      { header: 'Company',               key: 'company',       width: 28 },
      { header: 'Min CGPA B.Tech',       key: 'cgpaBtech',     width: 16 },
      { header: 'Min CGPA M.Tech',       key: 'cgpaMtech',     width: 16 },
      { header: 'Min CGPA MBA',          key: 'cgpaMba',       width: 14 },
      { header: 'Min CGPA M.Sc.',        key: 'cgpaMsc',       width: 14 },
      { header: 'Backlogs Allowed',      key: 'backlogs',      width: 15 },
      { header: 'Max Backlogs',          key: 'maxBacklogs',   width: 13 },
      { header: 'Gap Year Allowed',      key: 'gapYear',       width: 15 },
      { header: 'Max Gap (yrs)',         key: 'maxGap',        width: 13 },
      { header: '10th Cutoff',           key: 'tenth',         width: 12 },
      { header: '12th Cutoff',           key: 'twelfth',       width: 12 },
      { header: 'Additional Criteria',   key: 'additional',    width: 30 },
      { header: 'Skills Required',       key: 'skills',        width: 30 },
    ];
    ws4.getRow(1).eachCell(styleHeader);
    ws4.getRow(1).height = 22;

    jnfs.forEach((j, idx) => {
      const row = ws4.addRow({
        sno:         idx + 1,
        company:     j.companyName,
        cgpaBtech:   j.minCGPA?.btech,
        cgpaMtech:   j.minCGPA?.mtech,
        cgpaMba:     j.minCGPA?.mba,
        cgpaMsc:     j.minCGPA?.msc,
        backlogs:    j.backlogsAllowed,
        maxBacklogs: j.maxBacklogs,
        gapYear:     j.gapYearAllowed,
        maxGap:      j.maxGap,
        tenth:       j.tenthCutoff,
        twelfth:     j.twelfthCutoff,
        additional:  j.additionalCriteria,
        skills:      j.skillsRequired,
      });
      applyAlt(row, idx);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 5 – Branches & Specializations
    // ══════════════════════════════════════════════════════════════════════
    const ws5 = workbook.addWorksheet('Branches');
    ws5.columns = [
      { header: 'S.No',              key: 'sno',        width: 6  },
      { header: 'Company',           key: 'company',    width: 28 },
      // B.Tech branches
      { header: 'BT Chemical',       key: 'btChem',     width: 12 },
      { header: 'BT Civil',          key: 'btCivil',    width: 10 },
      { header: 'BT CSE',            key: 'btCSE',      width: 10 },
      { header: 'BT Electrical',     key: 'btEE',       width: 13 },
      { header: 'BT ECE',            key: 'btECE',      width: 10 },
      { header: 'BT IT',             key: 'btIT',       width: 10 },
      { header: 'BT Mechanical',     key: 'btMech',     width: 14 },
      { header: 'BT Metallurgy',     key: 'btMet',      width: 13 },
      // M.Tech / MBA / M.Sc. flags
      { header: 'MBA Considered',    key: 'mbaConsidered',  width: 15 },
      { header: 'M.Sc. Considered',  key: 'mscConsidered',  width: 15 },
      { header: 'Ph.D. Applicable',  key: 'phdApplicable',  width: 15 },
      // M.Tech specializations (comma-separated selected ones)
      { header: 'MTech Specializations (selected)', key: 'mtechSpec', width: 45 },
    ];
    ws5.getRow(1).eachCell(styleHeader);
    ws5.getRow(1).height = 22;

    jnfs.forEach((j, idx) => {
      const yesNo = v => (v ? 'Yes' : 'No');
      const selectedMtech = (j.mtechSpecializations || [])
        .filter(s => s.selected)
        .map(s => `${s.department} – ${s.specialization}`)
        .join('; ') || 'None';

      const row = ws5.addRow({
        sno:            idx + 1,
        company:        j.companyName,
        btChem:         yesNo(j.btechBranches?.chemical),
        btCivil:        yesNo(j.btechBranches?.civil),
        btCSE:          yesNo(j.btechBranches?.cse),
        btEE:           yesNo(j.btechBranches?.electrical),
        btECE:          yesNo(j.btechBranches?.ece),
        btIT:           yesNo(j.btechBranches?.it),
        btMech:         yesNo(j.btechBranches?.mechanical),
        btMet:          yesNo(j.btechBranches?.metallurgy),
        mbaConsidered:  yesNo(j.mbaConsidered),
        mscConsidered:  yesNo(j.mscConsidered),
        phdApplicable:  j.phdApplicable,
        mtechSpec:      selectedMtech,
      });
      applyAlt(row, idx);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 6 – Selection Process
    // ══════════════════════════════════════════════════════════════════════
    const ws6 = workbook.addWorksheet('Selection Process');
    ws6.columns = [
      { header: 'S.No',          key: 'sno',       width: 6  },
      { header: 'Company',       key: 'company',   width: 28 },
      { header: 'Round #',       key: 'round',     width: 9  },
      { header: 'Round Type',    key: 'type',      width: 20 },
      { header: 'Duration',      key: 'duration',  width: 14 },
      { header: 'Mode',          key: 'mode',      width: 14 },
      { header: 'Elimination',   key: 'elim',      width: 12 },
      { header: 'Other Details', key: 'other',     width: 30 },
    ];
    ws6.getRow(1).eachCell(styleHeader);
    ws6.getRow(1).height = 22;

    let r6 = 0;
    jnfs.forEach((j, idx) => {
      (j.selectionRounds || []).forEach((rnd, ri) => {
        if (!rnd.roundType && !rnd.duration && !rnd.mode) return; // skip empty rounds
        const row = ws6.addRow({
          sno:      idx + 1,
          company:  j.companyName,
          round:    ri + 1,
          type:     rnd.roundType,
          duration: rnd.duration,
          mode:     rnd.mode,
          elim:     rnd.elimination,
          other:    rnd.otherDetails,
        });
        applyAlt(row, r6++);
      });
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 7 – Logistics & Facilities
    // ══════════════════════════════════════════════════════════════════════
    const ws7 = workbook.addWorksheet('Logistics');
    ws7.columns = [
      { header: 'S.No',                 key: 'sno',             width: 6  },
      { header: 'Company',              key: 'company',         width: 28 },
      { header: 'Service Bond',         key: 'bond',            width: 13 },
      { header: 'Bond Duration',        key: 'bondDur',         width: 14 },
      { header: 'Bond Amount',          key: 'bondAmt',         width: 13 },
      { header: 'Bond Conditions',      key: 'bondCond',        width: 28 },
      { header: 'Relocation Allowance', key: 'reloc',           width: 18 },
      { header: 'Relocation Details',   key: 'relocDet',        width: 28 },
      { header: 'Visiting Members',     key: 'visitingMembers', width: 18 },
      { header: 'PPT Required',         key: 'ppt',             width: 13 },
      { header: 'PPT Room Capacity',    key: 'pptCap',          width: 16 },
      { header: 'Interview Rooms',      key: 'interviewRooms',  width: 15 },
      { header: 'Online Test Platform', key: 'testPlatform',    width: 20 },
      { header: 'Laptop Required',      key: 'laptop',          width: 15 },
      { header: 'Laptop Provider',      key: 'laptopProv',      width: 15 },
      { header: 'Preferred Date 1',     key: 'date1',           width: 16 },
      { header: 'Preferred Date 2',     key: 'date2',           width: 16 },
      { header: 'Other Requirements',   key: 'otherReq',        width: 30 },
    ];
    ws7.getRow(1).eachCell(styleHeader);
    ws7.getRow(1).height = 22;

    jnfs.forEach((j, idx) => {
      const row = ws7.addRow({
        sno:            idx + 1,
        company:        j.companyName,
        bond:           j.serviceBond,
        bondDur:        j.serviceBondDuration,
        bondAmt:        j.serviceBondAmount,
        bondCond:       j.serviceBondConditions,
        reloc:          j.relocationAllowance,
        relocDet:       j.relocationDetails,
        visitingMembers:j.visitingMembers,
        ppt:            j.pptRequired,
        pptCap:         j.pptRoomCapacity,
        interviewRooms: j.interviewRooms,
        testPlatform:   j.onlineTestPlatform,
        laptop:         j.laptopRequired,
        laptopProv:     j.laptopProvider,
        date1:          j.preferredDate1,
        date2:          j.preferredDate2,
        otherReq:       j.otherRequirements,
      });
      applyAlt(row, idx);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SHEET 8 – Declaration
    // ══════════════════════════════════════════════════════════════════════
    const ws8 = workbook.addWorksheet('Declaration');
    ws8.columns = [
      { header: 'S.No',                  key: 'sno',       width: 6  },
      { header: 'Company',               key: 'company',   width: 28 },
      { header: 'Signatory Name',        key: 'sigName',   width: 24 },
      { header: 'Signatory Designation', key: 'sigDes',    width: 24 },
      { header: 'Declaration Date',      key: 'sigDate',   width: 18 },
      { header: 'Status',                key: 'status',    width: 12 },
      { header: 'Submitted At',          key: 'subAt',     width: 22 },
    ];
    ws8.getRow(1).eachCell(styleHeader);
    ws8.getRow(1).height = 22;

    jnfs.forEach((j, idx) => {
      const row = ws8.addRow({
        sno:     idx + 1,
        company: j.companyName,
        sigName: j.signatoryName,
        sigDes:  j.signatoryDesignation,
        sigDate: j.declarationDate,
        status:  j.status,
        subAt:   new Date(j.submittedAt).toLocaleString('en-IN'),
      });
      const sc = row.getCell('status');
      sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STATUS_COLORS[j.status] || 'FFFFFFFF' } };
      applyAlt(row, idx);
    });

    // ─── Send workbook ─────────────────────────────────────────────────────
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=JNF_Submissions_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Export failed', error: err.message });
  }
});

module.exports = router;