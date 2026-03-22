import { useState } from "react";

// ── Brand ─────────────────────────────────────────────────────────────────────
const C = {
  orange:'#F97316', orangeD:'#EA6B10', orangeLight:'rgba(249,115,22,.15)', orangeBorder:'rgba(249,115,22,.4)',
  navy:'#0F172A', navyMid:'#1E3869', white:'#FFFFFF',
  // Dark theme surfaces
  bg:        '#111827',
  surface:   '#1F2937',
  surfaceHi: '#283548',
  border:    'rgba(255,255,255,.1)',
  borderHi:  'rgba(249,115,22,.5)',
  // Text on dark
  textPrimary:   '#F9FAFB',
  textSecondary: 'rgba(255,255,255,.6)',
  textMuted:     'rgba(255,255,255,.38)',
  // Statuses
  gray50:'#F8FAFC', gray100:'#F1F5F9', gray200:'#E2E8F0',
  gray400:'#9B9B9B', gray600:'#555555', gray900:'#0F172A',
  green:'#10B981', greenLight:'#ECFDF5', greenBorder:'#6EE7B7',
  amber:'#F59E0B', amberLight:'#FFFBEB', amberBorder:'#FDE68A',
  red:'#EF4444', redLight:'#FEF2F2', redBorder:'#FECACA',
  blue:'#3B82F6', blueLight:'#EFF6FF', blueBorder:'#BFDBFE',
};

const STEPS = [
  { label:'Solution Setup',         sub:'Create & link KQM quotes' },
  { label:'Practice Discovery',   sub:'Details, software & key dates' },
  { label:'External Vendors',     sub:'Builder, suppliers & coordinators' },
  { label:'IT Infrastructure',    sub:'Devices, imaging & networking' },
  { label:'Telecommunications',   sub:'NBN, VoIP & connectivity' },
  { label:'Managed Services',     sub:'Ongoing support & security' },
  { label:'Practice Blueprint',   sub:'Summary & client email' },
];

const PMS_LIST       = ['CareStack','Core Practice','D4W','Dentally','Exact','Oasis','Practika','Zavy360','D4Web/Windows','Other'];
const IMAGING_SW     = ['Vistasoft (Dürr)','Sidexis (Dentsply Sirona)','Romexis (Planmeca)','Carestream','Other'];
const AU_STATES      = ['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'];
const FINANCE_OPTS   = ['Credabl','Medfin','BOQ Finance','NAB','MedX Finance','Other'];
const NBN_TIERS      = ['100/40 Mbps Business','250/100 Mbps Business','500/200 Mbps Business','1000/400 Mbps Business'];
const VENDOR_TYPES   = ['Builder / Fitout','Electrician','Dental Chair Supplier','X-ray / OPG / CBCT Supplier','Intraoral Scanner Supplier','Imaging Software Vendor','PMS Vendor','Other'];
const INSTALL_RESP   = ['32 Byte','Vendor','TBD'];
const MONITOR_OPTS   = ['No Monitor','24" HD','27" QHD'];
const HANDSET_MODELS = ['T53W','T54W','T73U','T87W','Other'];
const HEADSET_MODELS = ['WH64 Wireless DECT','Other'];
const CORDLESS_MODELS= ['W76P','Other'];

const DEVICE_OPTIONS = [
  { v:'iw-entry', label:'Imaging Workstation · Entry', sub:'RTX A400 · 2D X-ray viewing, basic imaging',       gpu:'RTX A400',     imaging:true  },
  { v:'iw-mid',   label:'Imaging Workstation · Mid',   sub:'RTX A1000 · 3D CBCT, implant planning',            gpu:'RTX A1000',    imaging:true  },
  { v:'iw-high',  label:'Imaging Workstation · High',  sub:'RTX A2000 · Fast acquisition, CAD/CAM',            gpu:'RTX A2000',    imaging:true  },
  { v:'il-mid',   label:'Imaging Laptop · Mid',        sub:'RTX Pro 1000 · Mobile imaging workstation',        gpu:'RTX Pro 1000', imaging:true  },
  { v:'il-high',  label:'Imaging Laptop · High',       sub:'RTX Pro 2000 · High-performance mobile',           gpu:'RTX Pro 2000', imaging:true  },
  { v:'practice', label:'Practice Station',            sub:'No GPU · Reception, admin, practice manager',      gpu:'None',         imaging:false },
];

const uid = () => Math.random().toString(36).slice(2,8);
const n   = v  => parseInt(v)||0;

// ── Primitives ─────────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children, tight }) => (
  <div style={{ marginBottom:tight?10:16 }}>
    <label style={{ display:'block', fontWeight:600, fontSize:11, color:C.textSecondary, marginBottom:5, letterSpacing:'.06em', textTransform:'uppercase' }}>
      {label}{required&&<span style={{ color:C.orange, marginLeft:3 }}>*</span>}
    </label>
    {children}
    {hint&&<p style={{ margin:'4px 0 0', fontSize:12, color:C.textMuted, lineHeight:1.4 }}>{hint}</p>}
  </div>
);
const ib = { width:'100%', padding:'10px 13px', fontSize:14, border:`1.5px solid ${C.border}`, borderRadius:8, background:C.surfaceHi, color:C.textPrimary, fontFamily:'inherit', outline:'none', transition:'border-color .15s,box-shadow .15s' };
const fo = e => Object.assign(e.target.style,{ borderColor:C.orange, boxShadow:`0 0 0 3px rgba(249,115,22,.15)` });
const bl = e => Object.assign(e.target.style,{ borderColor:C.border, boxShadow:'none' });
const Input    = ({ value, onChange, placeholder, type='text', disabled }) => (
  <input type={type} value={value} placeholder={placeholder} disabled={disabled}
    onChange={e=>onChange(e.target.value)} style={{ ...ib, opacity:disabled?.55:1 }} onFocus={fo} onBlur={bl} />
);
const Textarea = ({ value, onChange, placeholder, rows=3, disabled }) => (
  <textarea value={value} placeholder={placeholder} rows={rows} disabled={disabled}
    onChange={e=>onChange(e.target.value)} style={{ ...ib, resize:'vertical', opacity:disabled?.55:1 }} onFocus={fo} onBlur={bl} />
);
const Select = ({ value, onChange, options, placeholder }) => (
  <div style={{ position:'relative' }}>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ ...ib, appearance:'none', cursor:'pointer', paddingRight:34, color:value?C.textPrimary:C.textMuted }} onFocus={fo} onBlur={bl}>
      {placeholder&&<option value="">{placeholder}</option>}
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
    <span style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:C.textMuted, fontSize:11 }}>▼</span>
  </div>
);
const Num = ({ value, onChange, min=0 }) => (
  <input type="number" min={min} value={value} onChange={e=>onChange(e.target.value)}
    style={{ ...ib, textAlign:'center', padding:'10px 8px' }} onFocus={fo} onBlur={bl} />
);
const Toggle = ({ checked, onChange, label, sub }) => (
  <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer', userSelect:'none' }}>
    <div style={{ position:'relative', width:42, height:23, flexShrink:0, marginTop:2 }} onClick={()=>onChange(!checked)}>
      <div style={{ position:'absolute', inset:0, borderRadius:23, background:checked?C.orange:C.surfaceHi, border:`1.5px solid ${checked?C.orange:C.border}`, transition:'all .2s' }}>
        <div style={{ position:'absolute', top:2, left:checked?20:2, width:17, height:17, borderRadius:'50%', background:C.surface, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.4)' }}/>
      </div>
    </div>
    <div>
      <div style={{ fontSize:14, fontWeight:checked?600:400, color:checked?C.textPrimary:C.textSecondary, lineHeight:1.3 }}>{label}</div>
      {sub&&<div style={{ fontSize:12, color:C.textMuted, marginTop:2 }}>{sub}</div>}
    </div>
  </label>
);
const Row     = ({ children, cols=2, gap=14 }) => (
  <div className={`psb-row-${cols}`} style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap }}>{children}</div>
);
const Divider = ({ label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, margin:'24px 0 18px' }}>
    <div style={{ height:1, flex:1, background:C.border }}/>
    <span style={{ fontSize:10, fontWeight:700, color:C.textMuted, letterSpacing:'.12em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{label}</span>
    <div style={{ height:1, flex:1, background:C.border }}/>
  </div>
);
const PhaseHeader = ({ num, title, sub }) => (
  <div style={{ marginBottom:28 }}>
    <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
      <div style={{ width:32, height:32, borderRadius:8, background:C.orange, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:14, color:C.white }}>{num}</span>
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:C.orange, letterSpacing:'.1em', textTransform:'uppercase' }}>Phase {num}</span>
    </div>
    <h2 className="psb-phase-title" style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:26, color:C.textPrimary, margin:'0 0 4px' }}>{title}</h2>
    <p style={{ margin:0, fontSize:14, color:C.textSecondary }}>{sub}</p>
  </div>
);
const InfoBox = ({ children, type='info' }) => {
  const map = { info:['rgba(30,55,105,.8)','rgba(249,115,22,.3)',C.textPrimary], warn:['rgba(120,80,0,.5)','#F59E0B','#FDE68A'], alert:['rgba(127,0,0,.4)','#EF4444','#FCA5A5'] };
  const [bg,bd,fc] = map[type]||map.info;
  return <div style={{ background:bg, border:`1.5px solid ${bd}`, borderRadius:9, padding:'10px 14px', marginBottom:14, fontSize:13, color:fc, lineHeight:1.5 }}>{children}</div>;
};
const Pill = ({ label, color=C.orange }) => (
  <span style={{ display:'inline-block', fontSize:11, fontWeight:700, color:C.white, background:color, borderRadius:20, padding:'2px 9px', marginRight:5, marginBottom:3 }}>{label}</span>
);
const Card = ({ children, style={} }) => (
  <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:12, padding:'18px 20px', marginBottom:12, ...style }}>{children}</div>
);

// Multi-select checkboxes with chaining Other fields
const MultiCheck = ({ options, selected=[], onChange, otherValues=[], onOtherChange }) => {
  const others = otherValues.length > 0 ? otherValues : [''];
  // How many Other fields to show: one for each filled entry + one empty at the end
  const otherFields = selected.includes('Other')
    ? [...others.filter(v=>v.trim()), '']
    : [];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {options.map(o=>{
        const checked = selected.includes(o);
        return (
          <label key={o} onClick={()=>onChange(o)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
            <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${checked?C.orange:C.gray200}`, background:checked?C.orange:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
              {checked&&<span style={{ color:C.white, fontSize:11, fontWeight:700 }}>✓</span>}
            </div>
            <span style={{ fontSize:14, color:checked?C.gray900:C.gray600, fontWeight:checked?600:400 }}>{o}</span>
          </label>
        );
      })}
      {otherFields.map((val, i) => (
        <div key={i} style={{ marginLeft:28, display:'flex', alignItems:'center', gap:8 }} onClick={e=>e.stopPropagation()}>
          <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${C.orangeBorder}`, background:C.orangeLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ color:C.orange, fontSize:10, fontWeight:700 }}>{i+1}</span>
          </div>
          <div style={{ flex:1 }}>
            <Input
              value={val}
              onChange={v => {
                const updated = [...otherFields];
                updated[i] = v;
                onOtherChange(updated.filter(x=>x.trim()));
              }}
              placeholder={`Other software ${i+1}…`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Hardware quantity row with model
const HwRow = ({ label, model, qty, onQty, notes, onNotes, showNotes }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${C.border}` }}>
    <div style={{ flex:1, fontSize:14, color:C.textPrimary, fontWeight:500 }}>{label}</div>
    <div style={{ width:80 }}><Num value={qty||''} onChange={onQty} /></div>
    {showNotes && n(qty)>0 && (
      <div style={{ flex:1 }}>
        <Input value={notes||''} onChange={onNotes} placeholder="Describe model / notes…" />
      </div>
    )}
  </div>
);

// ── Phase 0: Solution Setup ───────────────────────────────────────────────────
const QUOTE_DEFS = [
  { reqKey:'q1req', urlKey:'q1url', num:'1', label:'Hardware & Infrastructure', hint:'Computers, networking, cameras, M365 and installation', color:'#0F172A' },
  { reqKey:'q2req', urlKey:'q2url', num:'2', label:'Telecommunications',        hint:'NBN, VoIP phone system, handsets and headsets',         color:'#1E3869' },
  { reqKey:'q3req', urlKey:'q3url', num:'3', label:'Managed Services',          hint:'TotalCare MSA, Advanced Cyber and backup',              color:'#F97316' },
];

const Phase0 = ({ d, u }) => (
  <div>
    <PhaseHeader num={0} title="Solution Setup" sub="Select which quotes are required for this engagement, then link them once created in Kaseya." />

    <Divider label="Which solutions does this practice need?" />
    <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
      {QUOTE_DEFS.map(({ reqKey, num, label, hint }) => {
        const on = d[reqKey] !== false; // default true
        return (
          <div key={reqKey} onClick={()=>u(reqKey, !on)}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:11, border:`2px solid ${on?C.orange:C.border}`, background:on?C.orangeLight:C.surface, cursor:'pointer', userSelect:'none', transition:'all .15s' }}>
            <div style={{ width:32, height:32, borderRadius:8, background:on?C.orange:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .15s' }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:13, color:C.white }}>S{num}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary }}>Solution {num} — {label}</div>
              <div style={{ fontSize:12, color:C.textSecondary, marginTop:2 }}>{hint}</div>
            </div>
            <div style={{ width:22, height:22, borderRadius:'50%', border:`2px solid ${on?C.orange:C.border}`, background:on?C.orange:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
              {on && <span style={{ color:C.white, fontSize:12, fontWeight:700 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </div>

    <Divider label="KQM Quote URLs" />
    <InfoBox type="info">
      Open Kaseya Quote Manager in a separate tab, create a quote for each required section, then paste the URLs below. You can update these at any time.
    </InfoBox>

    {QUOTE_DEFS.filter(({ reqKey }) => d[reqKey] !== false).map(({ reqKey, urlKey, num, label, hint }) => (
      <Card key={urlKey} style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:C.orange, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:11, color:C.white }}>S{num}</span>
              </div>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.textPrimary }}>Solution {num} — {label}</div>
            </div>
            <div style={{ fontSize:12, color:C.textMuted, marginLeft:32 }}>{hint}</div>
          </div>
          {d[urlKey] && (
            <a href={d[urlKey]} target="_blank" rel="noreferrer"
              style={{ fontSize:12, fontWeight:700, color:C.orange, textDecoration:'none', background:C.orangeLight, padding:'5px 14px', borderRadius:7, whiteSpace:'nowrap', marginLeft:12 }}>
              Open in KQM ↗
            </a>
          )}
        </div>
        <Input value={d[urlKey]||''} onChange={v=>u(urlKey,v)} placeholder="https://shop.32byte.com.au/quote/…" />
        {d[urlKey] && (
          <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Quote linked</span>
          </div>
        )}
      </Card>
    ))}

    {QUOTE_DEFS.every(({ reqKey }) => d[reqKey] === false) && (
      <InfoBox type="warn">No quotes selected — select at least one quote type to continue.</InfoBox>
    )}

    <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:11, padding:'14px 18px', marginTop:8 }}>
      <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary, marginBottom:4 }}>Not ready yet?</div>
      <div style={{ fontSize:13, color:C.textSecondary, lineHeight:1.5 }}>Skip ahead and come back. URLs can be pasted at any point and will appear as links throughout the Blueprint.</div>
    </div>

    <Divider label="Meeting Details" />
    <Row>
      <Field label="32 Byte Sales Rep"><Input value={d.salesRep||''} onChange={v=>u('salesRep',v)} placeholder="Your name" /></Field>
      <Field label="Meeting Date"><Input type="date" value={d.meetingDate||''} onChange={v=>u('meetingDate',v)} /></Field>
    </Row>
    <Row>
      <Field label="Client Contact Name"><Input value={d.contactName||''} onChange={v=>u('contactName',v)} placeholder="Name and role" /></Field>
      <Field label="Client Email" hint="Used for the follow-up email"><Input type="email" value={d.contactEmail||''} onChange={v=>u('contactEmail',v)} placeholder="email@practice.com.au" /></Field>
    </Row>
    <Field label="Internal Team Email" hint="For internal summary email after locking">
      <Input type="email" value={d.internalTeamEmail||''} onChange={v=>u('internalTeamEmail',v)} placeholder="team@32byte.com.au" />
    </Field>
  </div>
);

// ── Phase 1 ───────────────────────────────────────────────────────────────────
const Phase1 = ({ d, u }) => {
  const toggleImg = (sw) => {
    const cur = d.imagingSw||[];
    u('imagingSw', cur.includes(sw) ? cur.filter(x=>x!==sw) : [...cur, sw]);
  };
  return (
    <div>
      <PhaseHeader num={1} title="Practice Discovery" sub="The foundation of the Blueprint — every decision flows from this." />
      <Row>
        <Field label="Practice Name" required><Input value={d.practiceName||''} onChange={v=>u('practiceName',v)} placeholder="Practice name" /></Field>
        <Field label="Principal Dentist / Owner"><Input value={d.principalDentist||''} onChange={v=>u('principalDentist',v)} placeholder="Dr. Name" /></Field>
      </Row>
      <Row cols={3}>
        <Field label="Suburb"><Input value={d.suburb||''} onChange={v=>u('suburb',v)} placeholder="Suburb" /></Field>
        <Field label="State"><Select value={d.state||''} onChange={v=>u('state',v)} options={AU_STATES} placeholder="Select…" /></Field>
        <Field label="Postcode"><Input value={d.postcode||''} onChange={v=>u('postcode',v)} placeholder="0000" /></Field>
      </Row>
      <Field label="Street Address"><Input value={d.address||''} onChange={v=>u('address',v)} placeholder="Suite / Level, Street, Suburb" /></Field>
      <Row cols={4}>
        <Field label="Dental Chairs"><Num value={d.chairs||''} onChange={v=>u('chairs',v)} /></Field>
        <Field label="Dentists"><Num value={d.dentists||''} onChange={v=>u('dentists',v)} /></Field>
        <Field label="Admin Staff"><Num value={d.adminStaff||''} onChange={v=>u('adminStaff',v)} /></Field>
        <Field label="Other Staff"><Num value={d.otherStaff||''} onChange={v=>u('otherStaff',v)} /></Field>
      </Row>
      <Divider label="Practice Software" />
      <Field label="Practice Management Software" required>
        <Select value={d.pms||''} onChange={v=>u('pms',v)} options={PMS_LIST} placeholder="Select PMS…" />
      </Field>
      {d.pms==='Other' && <Field label="PMS Name" tight><Input value={d.pmsOther||''} onChange={v=>u('pmsOther',v)} placeholder="Enter PMS name" /></Field>}
      <Field label="Imaging / X-ray Software" hint="Select all that apply">
        <MultiCheck options={IMAGING_SW} selected={d.imagingSw||[]}
          onChange={toggleImg} otherValues={d.imagingSwOthers||[]} onOtherChange={v=>u('imagingSwOthers',v)} />
      </Field>
      <Field label="Practice Type">
        <div style={{ display:'flex', gap:8 }}>
          {[{v:'new',l:'New build (greenfield)'},{v:'existing',l:'Existing / fit-out'}].map(o=>{
            const a=d.practiceType===o.v;
            return <button key={o.v} onClick={()=>u('practiceType',o.v)} style={{ flex:1, padding:'10px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.gray200}`, background:a?C.orangeLight:C.surfaceHi, color:a?C.orange:C.textSecondary }}>{o.l}</button>;
          })}
        </div>
      </Field>
      <Divider label="Key Dates" />
      {d.practiceType==='new' ? (
        <Row>
          <Field label="Target Opening Date" required hint="Go-live target — everything is scoped to this.">
            <Input type="date" value={d.openingDate||''} onChange={v=>u('openingDate',v)} />
          </Field>
          <Field label="Fitout Completion (estimated)">
            <Input type="date" value={d.fitoutDate||''} onChange={v=>u('fitoutDate',v)} />
          </Field>
        </Row>
      ) : (
        <Field label="Go-Live Date" required hint="The date 32 Byte takes over support and management.">
          <Input type="date" value={d.goLiveDate||''} onChange={v=>u('goLiveDate',v)} />
        </Field>
      )}
      {d.practiceType==='existing' && (
        <>
          <Divider label="Existing IT Provider" />
          <Toggle checked={!!d.existingIT} onChange={v=>u('existingIT',v)} label="Practice has an existing IT provider" />
          {d.existingIT && (
            <div style={{ marginTop:16 }}>
              <Row>
                <Field label="Company Name" tight><Input value={d.existingITCompany||''} onChange={v=>u('existingITCompany',v)} placeholder="IT company name" /></Field>
                <Field label="Contract Type" tight>
                  <Select value={d.existingITType||''} onChange={v=>u('existingITType',v)}
                    options={['Managed Service Agreement (MSA)','Break Fix','Ad Hoc','Retainer','Other']} placeholder="Select type…" />
                </Field>
              </Row>
              <Row cols={3}>
                <Field label="Contact Name" tight><Input value={d.existingITContact||''} onChange={v=>u('existingITContact',v)} placeholder="Name" /></Field>
                <Field label="Phone" tight><Input value={d.existingITPhone||''} onChange={v=>u('existingITPhone',v)} placeholder="Phone number" /></Field>
                <Field label="Email" tight><Input type="email" value={d.existingITEmail||''} onChange={v=>u('existingITEmail',v)} placeholder="email@company.com" /></Field>
              </Row>
              <Field label="Contract Expiry" tight>
                <Input type="date" value={d.existingITExpiry||''} onChange={v=>u('existingITExpiry',v)} />
              </Field>
              <Field label="What does the current provider manage?" hint="All items default to yes — toggle off if they don't manage that item, then capture who does.">
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:4 }}>
                  {[
                    {k:'existingITManagesDevices',  pk:'existingITDevices',  l:'Devices (computers, servers)'},
                    {k:'existingITManagesEmail',     pk:'existingITEmail',    l:'Email (Microsoft 365 / Google)'},
                    {k:'existingITManagesPhones',    pk:'existingITPhones',   l:'Phone system'},
                    {k:'existingITManagesInternet',  pk:'existingITInternet', l:'Internet / NBN'},
                    {k:'existingITManagesSecurity',  pk:'existingITSecurity', l:'Security (AV, patching, monitoring)'},
                  ].map(({k,pk,l})=>(
                    <div key={k}>
                      <Toggle checked={d[k]!==false} onChange={v=>u(k,v)} label={l} sub={d[k]!==false?'Managed by existing IT provider':'Not managed by existing IT — capture responsible party below'} />
                      {d[k]===false && (
                        <div style={{ marginLeft:54, marginTop:10, padding:'12px 14px', background:C.surfaceHi, borderRadius:9, border:`1.5px solid ${C.border}` }}>
                          <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Who manages {l.toLowerCase()}?</div>
                          <Row>
                            <Field label="Company" tight><Input value={(d[pk]||{}).company||''} onChange={v=>u(pk,{...(d[pk]||{}),company:v})} placeholder="Provider / company name" /></Field>
                            <Field label="Contact" tight><Input value={(d[pk]||{}).contact||''} onChange={v=>u(pk,{...(d[pk]||{}),contact:v})} placeholder="Contact name" /></Field>
                          </Row>
                          <Row>
                            <Field label="Phone" tight><Input value={(d[pk]||{}).phone||''} onChange={v=>u(pk,{...(d[pk]||{}),phone:v})} placeholder="Phone" /></Field>
                            <Field label="Email" tight><Input type="email" value={(d[pk]||{}).email||''} onChange={v=>u(pk,{...(d[pk]||{}),email:v})} placeholder="email@provider.com" /></Field>
                          </Row>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Field>
              <Field label="Notes" tight>
                <Textarea value={d.existingITNotes||''} onChange={v=>u('existingITNotes',v)} placeholder="Access details, systems in use, known issues, handover requirements…" />
              </Field>
            </div>
          )}
        </>
      )}
      <Divider label="Finance" />
      <Field label="Practice Finance Provider">
        <Select value={d.financeProvider||''} onChange={v=>u('financeProvider',v)} options={FINANCE_OPTS} placeholder="Select provider (if applicable)…" />
      </Field>
      {d.financeProvider==='Other' && <Field label="Finance Provider Name" tight><Input value={d.financeOther||''} onChange={v=>u('financeOther',v)} placeholder="Enter provider name" /></Field>}
    </div>
  );
};

// ── Phase 2 ───────────────────────────────────────────────────────────────────
const Phase2 = ({ d, u }) => {
  const vendors = d.vendors||[];
  const addV  = () => u('vendors',[...vendors,{ id:uid(), type:'', company:'', contact:'', phone:'', email:'', installResp:'TBD', notes:'' }]);
  const updV  = (id,k,v) => u('vendors', vendors.map(x=>x.id===id?{...x,[k]:v}:x));
  const delV  = id => u('vendors', vendors.filter(x=>x.id!==id));
  const imgV  = vendors.filter(v=>['Imaging Software Vendor','X-ray / OPG / CBCT Supplier','Intraoral Scanner Supplier','PMS Vendor'].includes(v.type));
  const vendorsInScope = d.q1req !== false || d.practiceType === 'new';
  return (
    <div>
      <PhaseHeader num={2} title="External Vendors" sub="Everyone else on this project. Get contacts early and lock down install responsibilities." />
      {!vendorsInScope && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'rgba(120,80,0,.4)', border:`1.5px solid #F59E0B`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#FDE68A' }}>Not applicable for this engagement</span>
            <span style={{ fontSize:13, color:'#FDE68A' }}> — External vendors are required when Solution 1 (Hardware) is selected or the practice is a new build.</span>
          </div>
        </div>
      )}
      <InfoBox type="warn"><strong>Key rule:</strong> 32 Byte installs all imaging software (Vistasoft, Sidexis, Romexis etc) — not the equipment vendor. Confirm and resolve any conflicts now.</InfoBox>
      {vendors.length===0 && <div style={{ textAlign:'center', padding:'24px 0', color:C.textMuted, fontSize:14 }}>No vendors added yet. Start with the builder.</div>}
      {vendors.map((v,i)=>(
        <Card key={v.id}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, color:C.textPrimary }}>Vendor {i+1}{v.type?` · ${v.type}`:''}</span>
            <button onClick={()=>delV(v.id)} style={{ fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>
          </div>
          <Row>
            <Field label="Vendor Type" tight><Select value={v.type} onChange={val=>updV(v.id,'type',val)} options={VENDOR_TYPES} placeholder="Select type…" /></Field>
            <Field label="Company Name" tight><Input value={v.company} onChange={val=>updV(v.id,'company',val)} placeholder="Company name" /></Field>
          </Row>
          {v.type==='Other' && (
            <Field label="Specify Vendor Type" tight hint="Describe the type of vendor">
              <Input value={v.customType||''} onChange={val=>updV(v.id,'customType',val)} placeholder="e.g. Dental equipment supplier, IT cabling contractor…" />
            </Field>
          )}
          <Row cols={3}>
            <Field label="Contact Name" tight><Input value={v.contact} onChange={val=>updV(v.id,'contact',val)} placeholder="Name" /></Field>
            <Field label="Phone" tight><Input value={v.phone} onChange={val=>updV(v.id,'phone',val)} placeholder="04xx xxx xxx" /></Field>
            <Field label="Email" tight><Input value={v.email} onChange={val=>updV(v.id,'email',val)} placeholder="contact@vendor.com" /></Field>
          </Row>
          {['Imaging Software Vendor','X-ray / OPG / CBCT Supplier','Intraoral Scanner Supplier','PMS Vendor'].includes(v.type) && (
            <Field label="Software Install Responsibility" tight hint="Who installs the software on go-live day?">
              <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                {INSTALL_RESP.map(r=>{
                  const a=v.installResp===r;
                  const col=r==='32 Byte'?C.green:r==='Vendor'?C.amber:C.gray400;
                  return <button key={r} onClick={()=>updV(v.id,'installResp',r)} style={{ flex:1, padding:'8px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?col:C.border}`, background:a?`${col}22`:C.surfaceHi, color:a?col:C.textPrimary }}>{r}</button>;
                })}
              </div>
              {v.installResp==='Vendor'&&<InfoBox type="alert">Conflict — vendor expects to install software. Coordinate with 32 Byte immediately. This may impact the installation schedule.</InfoBox>}
            </Field>
          )}
          <Field label="Notes" tight><Input value={v.notes} onChange={val=>updV(v.id,'notes',val)} placeholder="Lead times, scheduling constraints, access requirements…" /></Field>
        </Card>
      ))}
      <button onClick={addV} style={{ width:'100%', padding:'12px', borderRadius:10, border:`2px dashed ${C.border}`, background:'transparent', color:C.orange, fontWeight:700, fontSize:14, cursor:'pointer', marginTop:4 }}>+ Add Vendor</button>
      {imgV.length>0&&(
        <>
          <Divider label="Imaging Vendor Install Summary" />
          {imgV.map(v=>(
            <div key={v.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', background:v.installResp==='Vendor'?'rgba(239,68,68,.15)':v.installResp==='32 Byte'?'rgba(16,185,129,.15)':'rgba(245,158,11,.15)', border:`1px solid ${v.installResp==='Vendor'?C.red:v.installResp==='32 Byte'?C.green:C.amber}`, borderRadius:8, marginBottom:7 }}>
              <span style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>{v.company||v.type}</span>
              <span style={{ fontSize:12, fontWeight:700, color:v.installResp==='Vendor'?C.red:v.installResp==='32 Byte'?C.green:C.amber }}>Install: {v.installResp||'TBD'}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ── Phase 3 ───────────────────────────────────────────────────────────────────
const Phase3 = ({ d, u }) => {
  const rooms = d.rooms||[];
  const addR  = () => u('rooms',[...rooms,{ id:uid(), name:'', deviceType:'practice', qty:1, monitor:'27" QHD', kbMouse:true, database:false, notes:'', existingPC:false, pcAge:'', pcBrand:'', pcCondition:'Functional', pcNotes:'' }]);
  const updR  = (id,k,v) => u('rooms', rooms.map(x=>x.id===id?{...x,[k]:v}:x));
  const delR  = id => u('rooms', rooms.filter(x=>x.id!==id));
  const totalD = rooms.reduce((a,r)=>a+n(r.qty),0);
  const newDevices = rooms.filter(r=>!r.existingPC).reduce((a,r)=>a+n(r.qty),0);
  const psHrs  = newDevices * 2.5;
  const notReq = d.q1req === false;

  return (
    <div>
      <PhaseHeader num={3} title="IT Infrastructure" sub="Room by room, then imaging equipment and networking." />
      {notReq && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:C.amberLight, border:`1.5px solid ${C.amberBorder}`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#FDE68A' }}>Quote 1 not selected for this engagement</span>
            <span style={{ fontSize:13, color:'#FDE68A' }}> — you can still capture details here, but this section won't appear in the Blueprint.</span>
          </div>
          <button onClick={()=>u('q1req',true)} style={{ fontSize:12, fontWeight:700, color:C.orange, background:C.surface, border:`1.5px solid ${C.orange}`, borderRadius:7, padding:'4px 12px', cursor:'pointer', whiteSpace:'nowrap' }}>Add to scope</button>
        </div>
      )}

      {/* Room cards */}
      {rooms.length===0&&<div style={{ textAlign:'center', padding:'28px 0', color:C.textMuted, fontSize:14 }}>No rooms yet. Start with reception.</div>}
      {rooms.map((r,i)=>{
        const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];
        return (
          <Card key={r.id} style={{ borderColor:dev.imaging?C.orangeBorder:C.gray200 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, color:C.textPrimary }}>{r.name||`Room ${i+1}`}</div>
                <div style={{ marginTop:4 }}>
                  <Pill label={dev.label} color={dev.imaging?C.orange:C.navyMid} />
                  {dev.gpu!=='None'&&<Pill label={dev.gpu} color={C.gray600} />}
                  {r.database&&<Pill label="RAID Storage" color={C.amber} />}
                  {r.monitor&&r.monitor!=='No Monitor'&&<Pill label={r.monitor} color={C.navyMid} />}
                </div>
              </div>
              <button onClick={()=>delR(r.id)} style={{ fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>
            </div>
            <Row>
              <Field label="Room / Location Name" tight><Input value={r.name} onChange={v=>updR(r.id,'name',v)} placeholder="e.g. Treatment Room 1, Reception…" /></Field>
              <Field label="Quantity" tight><Num value={r.qty} onChange={v=>updR(r.id,'qty',v)} min={1} /></Field>
            </Row>

            {/* Existing PC toggle — if on, hide device/monitor/peripherals */}
            <div style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
              <Toggle checked={!!r.existingPC} onChange={v=>updR(r.id,'existingPC',v)}
                label="Existing computer in this room"
                sub={r.existingPC?'Device specs captured below — no new device or install required':'New computer will be supplied by 32 Byte'} />
            </div>

            {r.existingPC ? (
              /* ── Existing PC details ── */
              (() => {
                const age = parseInt(r.pcAge)||0;
                const ageBorder = age>=5 ? C.red : age>=3 ? C.amber : C.border;
                const ageBg = age>=5 ? 'rgba(239,68,68,.08)' : age>=3 ? 'rgba(245,158,11,.08)' : C.surfaceHi;
                return (
                  <div style={{ padding:'14px 16px', background:ageBg, borderRadius:9, border:`1.5px solid ${ageBorder}`, marginBottom:8 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Existing Computer Details</div>
                    <Row>
                      <Field label="Brand / Model" tight><Input value={r.pcBrand||''} onChange={v=>updR(r.id,'pcBrand',v)} placeholder="e.g. Dell OptiPlex, HP EliteDesk…" /></Field>
                      <Field label="Age (years)" tight><Input type="number" value={r.pcAge||''} onChange={v=>updR(r.id,'pcAge',v)} placeholder="e.g. 3" /></Field>
                    </Row>
                    {age>=5 && <InfoBox type="alert">⚠️ Device is {age} years old — likely end of life. Recommend replacement and discuss with practice.</InfoBox>}
                    {age>=3 && age<5 && <InfoBox type="warn">⚠️ Device is {age} years old — likely out of manufacturer warranty. Discuss support options with practice.</InfoBox>}
                    <Row>
                      <Field label="CPU Model" tight><Input value={r.pcCpu||''} onChange={v=>updR(r.id,'pcCpu',v)} placeholder="e.g. Intel Core i7-12700, AMD Ryzen 7 5800X" /></Field>
                      <Field label="RAM" tight>
                        <Select value={r.pcRam||''} onChange={v=>updR(r.id,'pcRam',v)} options={['4 GB','8 GB','16 GB','32 GB','64 GB','Other']} placeholder="Select RAM…" />
                      </Field>
                    </Row>
                    <Row>
                      <Field label="Storage" tight>
                        <Select value={r.pcStorage||''} onChange={v=>updR(r.id,'pcStorage',v)} options={['128 GB SSD','256 GB SSD','512 GB SSD','1 TB SSD','2 TB SSD','256 GB HDD','512 GB HDD','1 TB HDD','2 TB HDD','Other']} placeholder="Select storage…" />
                      </Field>
                      <Field label="Graphics Card" tight>
                        <Toggle checked={!!r.pcHasGpu} onChange={v=>updR(r.id,'pcHasGpu',v)} label={r.pcHasGpu?'Yes — GPU present':'No dedicated GPU'} />
                      </Field>
                    </Row>
                    {r.pcHasGpu && <Field label="GPU Model" tight><Input value={r.pcGpuModel||''} onChange={v=>updR(r.id,'pcGpuModel',v)} placeholder="e.g. NVIDIA RTX A1000, Quadro P2000" /></Field>}
                    <Field label="Condition" tight>
                      <div style={{ display:'flex', gap:6 }}>
                        {['Good','Functional','Poor','Unknown'].map(c=>{
                          const a=r.pcCondition===c;
                          return <button key={c} onClick={()=>updR(r.id,'pcCondition',c)} style={{ flex:1, padding:'7px 6px', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.border}`, background:a?C.orangeLight:C.surface, color:a?C.orange:C.textSecondary }}>{c}</button>;
                        })}
                      </div>
                    </Field>
                    <Field label="Notes" tight><Input value={r.pcNotes||''} onChange={v=>updR(r.id,'pcNotes',v)} placeholder="OS version, issues, imaging software installed, reuse potential…" /></Field>
                  </div>
                );
              })()
            ) : (
              /* ── New device options ── */
              <>
                <Field label="Device Type" tight>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {DEVICE_OPTIONS.map(o=>{
                      const a=r.deviceType===o.v;
                      return (
                        <button key={o.v} onClick={()=>updR(r.id,'deviceType',o.v)}
                          style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:8, border:`2px solid ${a?C.orange:C.gray200}`, background:a?C.orangeLight:C.surfaceHi, cursor:'pointer', textAlign:'left' }}>
                          <div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid ${a?C.orange:C.gray400}`, background:a?C.orange:'transparent', flexShrink:0 }}/>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:a?C.orange:C.textPrimary }}>{o.label}</div>
                            <div style={{ fontSize:11, color:C.textMuted, marginTop:1 }}>{o.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Row>
                  <Field label="Monitor" tight>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {MONITOR_OPTS.map(mo=>{
                        const a=r.monitor===mo;
                        return <button key={mo} onClick={()=>updR(r.id,'monitor',mo)} style={{ padding:'8px 12px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.gray200}`, background:a?C.orangeLight:C.surfaceHi, color:a?C.orange:C.textSecondary, textAlign:'left' }}>{mo}</button>;
                      })}
                    </div>
                  </Field>
                  <Field label="Peripherals" tight>
                    <div style={{ marginBottom:10 }}>
                      <Toggle checked={r.kbMouse} onChange={v=>updR(r.id,'kbMouse',v)} label="Wireless Keyboard & Mouse" sub="Logitech MK345" />
                    </div>
                    {dev.imaging && (
                      <Toggle checked={r.database} onChange={v=>updR(r.id,'database',v)} label="RAID Storage Required"
                        sub={r.database?'2 × NVMe SSD in RAID array — local database':'Cloud-based / no local DB'} />
                    )}
                  </Field>
                </Row>
              </>
            )}
            <Field label="Notes" tight><Input value={r.notes} onChange={v=>updR(r.id,'notes',v)} placeholder="Imaging software, peripheral devices, special requirements…" /></Field>
          </Card>
        );
      })}
      <button onClick={addR} style={{ width:'100%', padding:'12px', borderRadius:10, border:`2px dashed ${C.border}`, background:'transparent', color:C.orange, fontWeight:700, fontSize:14, cursor:'pointer', marginBottom:22 }}>+ Add Room</button>

      {totalD>0&&(
        <div style={{ background:C.navy, borderRadius:12, padding:'14px 18px', marginBottom:22 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              ['Total Devices', totalD],
              ['New Devices', newDevices],
              ['Est. Install Hours', psHrs.toFixed(1)+' hrs'],
            ].map(([l,v])=>(
              <div key={l} style={{ background:'rgba(255,255,255,.06)', borderRadius:8, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:C.textMuted, marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:18, fontWeight:700, color:C.orange, fontFamily:'Sora,sans-serif' }}>{v}</div>
              </div>
            ))}
          </div>
          {totalD>newDevices && <div style={{ marginTop:8, fontSize:11, color:C.textMuted, textAlign:'center' }}>{totalD-newDevices} existing device{totalD-newDevices!==1?'s':''} — no install hours required</div>}
        </div>
      )}

      {/* Imaging Equipment */}
      <Divider label="Imaging Equipment & Database Requirements" />
      <InfoBox>Capture every imaging device — this determines database requirements, computer specs and vendor coordination.</InfoBox>

      {/* Intraoral Scanners — repeatable */}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.textPrimary, marginBottom:10 }}>Intraoral Scanners</div>
        {(d.intraoralScanners||[]).length===0 && (
          <div style={{ color:C.textMuted, fontSize:13, marginBottom:10 }}>No intraoral scanners added.</div>
        )}
        {(d.intraoralScanners||[]).map((sc,i)=>(
          <Card key={sc.id} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.textPrimary }}>Scanner {i+1}{sc.model?` — ${sc.model}`:''}</span>
              <button onClick={()=>u('intraoralScanners',(d.intraoralScanners||[]).filter(x=>x.id!==sc.id))} style={{ fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>
            </div>
            <Row>
              <Field label="Brand / Model" tight><Input value={sc.model||''} onChange={v=>u('intraoralScanners',(d.intraoralScanners||[]).map(x=>x.id===sc.id?{...x,model:v}:x))} placeholder="e.g. Trios 5, iTero Element, Primescan" /></Field>
              <Field label="Software" tight><Input value={sc.software||''} onChange={v=>u('intraoralScanners',(d.intraoralScanners||[]).map(x=>x.id===sc.id?{...x,software:v}:x))} placeholder="e.g. 3Shape Communicate, OrthoAnalyzer" /></Field>
            </Row>
            <Row>
              <Field label="Dedicated Workstation" tight>
                <Toggle checked={!!sc.dedicated} onChange={v=>u('intraoralScanners',(d.intraoralScanners||[]).map(x=>x.id===sc.id?{...x,dedicated:v}:x))} label={sc.dedicated?'Yes — needs dedicated PC':'Uses existing workstation'} />
              </Field>
              <Field label="Local Database" tight>
                <Toggle checked={!!sc.database} onChange={v=>u('intraoralScanners',(d.intraoralScanners||[]).map(x=>x.id===sc.id?{...x,database:v}:x))} label={sc.database?'Yes — local database storage':'Cloud / no local storage'} />
              </Field>
            </Row>
            <Field label="Notes" tight><Input value={sc.notes||''} onChange={v=>u('intraoralScanners',(d.intraoralScanners||[]).map(x=>x.id===sc.id?{...x,notes:v}:x))} placeholder="Trolley-based, chair-side, WiFi requirements…" /></Field>
          </Card>
        ))}
        <button onClick={()=>u('intraoralScanners',[...(d.intraoralScanners||[]),newScanner()])}
          style={{ width:'100%', padding:'9px', borderRadius:9, border:`2px dashed ${C.border}`, background:'transparent', color:C.orange, fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:16 }}>
          + Add Intraoral Scanner
        </button>
      </div>

      {/* X-ray / OPG / CBCT — repeatable */}
      <div style={{ marginBottom:10 }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.textPrimary, marginBottom:10 }}>X-ray / OPG / CBCT Machines</div>
        {(d.xrayMachines||[]).length===0 && (
          <div style={{ color:C.textMuted, fontSize:13, marginBottom:10 }}>No X-ray / imaging machines added.</div>
        )}
        {(d.xrayMachines||[]).map((xr,i)=>(
          <Card key={xr.id} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.textPrimary }}>Machine {i+1}{xr.model?` — ${xr.model}`:''}{xr.type?` (${xr.type})`:''}</span>
              <button onClick={()=>u('xrayMachines',(d.xrayMachines||[]).filter(x=>x.id!==xr.id))} style={{ fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>
            </div>
            <Row>
              <Field label="Brand / Model" tight><Input value={xr.model||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,model:v}:x))} placeholder="e.g. Dürr VistaScan, Acteon Pspix2, Planmeca" /></Field>
              <Field label="Type" tight>
                <Select value={xr.type||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,type:v}:x))} options={['Intraoral X-ray sensor','OPG (panoramic)','CBCT','OPG + CBCT combined','Other']} placeholder="Select type…" />
              </Field>
            </Row>
            <Row>
              <Field label="Imaging Software" tight><Input value={xr.software||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,software:v}:x))} placeholder="e.g. Vistasoft, Sidexis, Romexis" /></Field>
              <Field label="Timing" tight>
                <Select value={xr.timing||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,timing:v}:x))} options={['Day one (opening)','Within 6 months','6–12 months','Future — not yet confirmed']} placeholder="When is this going in?" />
              </Field>
            </Row>
            <Row>
              <Field label="Dedicated Workstation" tight>
                <Toggle checked={!!xr.dedicated} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,dedicated:v}:x))} label={xr.dedicated?'Yes — dedicated acquisition PC':'Uses existing workstation'} />
              </Field>
              <Field label="RAID / Local Database" tight>
                <Toggle checked={!!xr.database} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,database:v}:x))} label={xr.database?'Yes — RAID array required':'No local database'} />
              </Field>
            </Row>
            <Field label="Notes" tight><Input value={xr.notes||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,notes:v}:x))} placeholder="Lead lining, room setup, vendor install coordination…" /></Field>
          </Card>
        ))}
        <button onClick={()=>u('xrayMachines',[...(d.xrayMachines||[]),newXray()])}
          style={{ width:'100%', padding:'9px', borderRadius:9, border:`2px dashed ${C.border}`, background:'transparent', color:C.orange, fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:16 }}>
          + Add X-ray / OPG / CBCT Machine
        </button>
      </div>

      {/* Other Imaging — repeatable */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.textPrimary, marginBottom:10 }}>Other Imaging / Clinical Equipment</div>
        {(d.otherImaging||[]).map((oi,i)=>(
          <Card key={oi.id} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.textPrimary }}>Device {i+1}{oi.desc?` — ${oi.desc}`:''}</span>
              <button onClick={()=>u('otherImaging',(d.otherImaging||[]).filter(x=>x.id!==oi.id))} style={{ fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>
            </div>
            <Field label="Equipment Description" tight><Input value={oi.desc||''} onChange={v=>u('otherImaging',(d.otherImaging||[]).map(x=>x.id===oi.id?{...x,desc:v}:x))} placeholder="e.g. CEREC, face scanner, caries detection device…" /></Field>
            <Field label="Database / Storage Requirements" tight><Textarea rows={2} value={oi.notes||''} onChange={v=>u('otherImaging',(d.otherImaging||[]).map(x=>x.id===oi.id?{...x,notes:v}:x))} placeholder="Any specific storage, network or computer requirements…" /></Field>
          </Card>
        ))}
        <button onClick={()=>u('otherImaging',[...(d.otherImaging||[]),newOtherImg()])}
          style={{ width:'100%', padding:'9px', borderRadius:9, border:`2px dashed ${C.border}`, background:'transparent', color:C.orange, fontWeight:700, fontSize:13, cursor:'pointer' }}>
          + Add Other Imaging / Clinical Equipment
        </button>
      </div>

      {/* Networking */}
      <Divider label="Networking" />
      <Row>
        <Field label="Managed Switch">
          <Select value={d.switchType||''} onChange={v=>u('switchType',v)} placeholder="Select switch…" options={['Ubiquiti 24-port POE','Ubiquiti 48-port POE (recommended)']} />
        </Field>
        <Field label="Wi-Fi Access Points (UniFi U7 Pro)" hint="Confirm count and placement from floor plan">
          <Num value={d.wifiAPs||''} onChange={v=>u('wifiAPs',v)} />
        </Field>
      </Row>
      <Toggle checked={!!d.existingNetwork} onChange={v=>u('existingNetwork',v)} label="Existing network equipment in place" sub={d.existingNetwork?'Capture details below':'No existing network equipment'} />
      {d.existingNetwork && (
        <div style={{ marginLeft:54, marginTop:10, padding:'14px 16px', background:C.surfaceHi, borderRadius:9, border:`1.5px solid ${C.border}`, marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Existing Network Equipment</div>
          <Row>
            <Field label="Switch Vendor / Model" tight><Input value={d.existingSwitchModel||''} onChange={v=>u('existingSwitchModel',v)} placeholder="e.g. Cisco SG350, Netgear GS308" /></Field>
            <Field label="Switch Managed By" tight><Input value={d.existingSwitchVendor||''} onChange={v=>u('existingSwitchVendor',v)} placeholder="Who manages this?" /></Field>
          </Row>
          <Row>
            <Field label="Wi-Fi Vendor / Model" tight><Input value={d.existingWifiModel||''} onChange={v=>u('existingWifiModel',v)} placeholder="e.g. Ubiquiti, Aruba, Cisco Meraki" /></Field>
            <Field label="Wi-Fi Managed By" tight><Input value={d.existingWifiVendor||''} onChange={v=>u('existingWifiVendor',v)} placeholder="Who manages this?" /></Field>
          </Row>
          <Field label="Notes" tight><Input value={d.existingNetworkNotes||''} onChange={v=>u('existingNetworkNotes',v)} placeholder="Age, condition, configuration notes, reuse potential…" /></Field>
        </div>
      )}
      <Field label="AP Mounting">
        <div style={{ display:'flex', gap:8 }}>
          {['Ceiling','Wall','Mixed'].map(o=>{
            const a=d.apMount===o;
            return <button key={o} onClick={()=>u('apMount',o)} style={{ flex:1, padding:'9px 8px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.gray200}`, background:a?C.orangeLight:C.surfaceHi, color:a?C.orange:C.textSecondary }}>{o}</button>;
          })}
        </div>
      </Field>
      <Field label="Floor Plan / WiFi Design" hint="Upload a floor plan image for reference during AP placement discussions.">
        <div style={{ marginBottom:8 }}>
          <label style={{ display:'inline-block', padding:'9px 18px', borderRadius:8, border:`2px dashed ${C.border}`, background:C.surfaceHi, color:C.orange, fontWeight:600, fontSize:13, cursor:'pointer' }}>
            📎 Upload Floor Plan
            <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{
              const f=e.target.files[0]; if(!f) return;
              const r=new FileReader(); r.onload=ev=>u('floorPlanImage',ev.target.result); r.readAsDataURL(f);
            }} />
          </label>
          {d.floorPlanImage && <button onClick={()=>u('floorPlanImage',null)} style={{ marginLeft:10, fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>}
        </div>
        {d.floorPlanImage && (
          <div style={{ borderRadius:10, overflow:'hidden', border:`1.5px solid ${C.border}`, maxHeight:400 }}>
            <img src={d.floorPlanImage} alt="Floor plan" style={{ width:'100%', display:'block', objectFit:'contain' }} />
          </div>
        )}
      </Field>

      {/* Security Cameras */}
      <Divider label="Security Cameras (UniFi G5 Turret)" />
      <Toggle checked={!!d.cameras} onChange={v=>u('cameras',v)} label="Security cameras required" />
      {d.cameras&&(
        <div style={{ marginTop:12 }}>
          <Row>
            <Field label="Number of Cameras"><Num value={d.cameraCount||''} onChange={v=>u('cameraCount',v)} /></Field>
            <Field label="NVR Storage" hint="8TB recommended for 30-day high-res retention">
              <Select value={d.nvrStorage||''} onChange={v=>u('nvrStorage',v)} placeholder="Select…" options={['4 TB HDD','8 TB HDD (recommended)','12 TB HDD','16 TB HDD']} />
            </Field>
          </Row>
          <Toggle checked={!!d.existingCameras} onChange={v=>u('existingCameras',v)} label="Existing camera system in place" />
          {d.existingCameras && (
            <div style={{ marginLeft:54, marginTop:10, padding:'12px 14px', background:C.surfaceHi, borderRadius:9, border:`1.5px solid ${C.border}` }}>
              <Row>
                <Field label="Vendor / Brand" tight><Input value={d.existingCameraVendor||''} onChange={v=>u('existingCameraVendor',v)} placeholder="e.g. Hikvision, Dahua, Axis" /></Field>
                <Field label="Number of existing cameras" tight><Num value={d.existingCameraCount||''} onChange={v=>u('existingCameraCount',v)} /></Field>
              </Row>
              <Field label="Notes" tight><Input value={d.existingCameraNotes||''} onChange={v=>u('existingCameraNotes',v)} placeholder="Age, condition, NVR details, reuse potential…" /></Field>
            </div>
          )}
          <div style={{ marginTop:12 }}>
            <Field label="Camera Layout / Location Diagram" hint="Upload a floor plan showing proposed camera positions.">
              <div style={{ marginBottom:8 }}>
                <label style={{ display:'inline-block', padding:'9px 18px', borderRadius:8, border:`2px dashed ${C.border}`, background:C.surfaceHi, color:C.orange, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                  📎 Upload Camera Layout
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{
                    const f=e.target.files[0]; if(!f) return;
                    const r=new FileReader(); r.onload=ev=>u('cameraLayoutImage',ev.target.result); r.readAsDataURL(f);
                  }} />
                </label>
                {d.cameraLayoutImage && <button onClick={()=>u('cameraLayoutImage',null)} style={{ marginLeft:10, fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>}
              </div>
              {d.cameraLayoutImage && (
                <div style={{ borderRadius:10, overflow:'hidden', border:`1.5px solid ${C.border}`, maxHeight:400 }}>
                  <img src={d.cameraLayoutImage} alt="Camera layout" style={{ width:'100%', display:'block', objectFit:'contain' }} />
                </div>
              )}
            </Field>
          </div>
        </div>
      )}

      {/* Firewall */}
      <Divider label="Firewall & 4G Failover" />
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <Toggle checked={!!d.firewall} onChange={v=>u('firewall',v)} label="UDM Pro Firewall" sub="All-in-one firewall, VPN, network controller — recommended for all practices" />
          <Toggle checked={!!d.existingFirewall} onChange={v=>u('existingFirewall',v)} label="Existing firewall in place" sub={d.existingFirewall?'Capture details below':'No existing firewall'} />
          {d.existingFirewall && (
            <div style={{ marginLeft:54, marginTop:8, padding:'12px 14px', background:C.surfaceHi, borderRadius:9, border:`1.5px solid ${C.border}` }}>
              <Row>
                <Field label="Brand / Model" tight><Input value={d.existingFirewallModel||''} onChange={v=>u('existingFirewallModel',v)} placeholder="e.g. Cisco, SonicWall, Meraki" /></Field>
                <Field label="Managed by" tight><Input value={d.existingFirewallVendor||''} onChange={v=>u('existingFirewallVendor',v)} placeholder="Who manages this?" /></Field>
              </Row>
            </div>
          )}
        </div>
        <div>
          <Toggle checked={!!d.failover} onChange={v=>u('failover',v)} label="Teltonika TRB140 4G Failover Router" sub="Keeps the practice running if NBN drops — essential for cloud-based practices" />
          <Toggle checked={!!d.existing4G} onChange={v=>u('existing4G',v)} label="Existing 4G backup in place" sub={d.existing4G?'Capture details below':'No existing 4G backup'} />
          {d.existing4G && (
            <div style={{ marginLeft:54, marginTop:8, padding:'12px 14px', background:C.surfaceHi, borderRadius:9, border:`1.5px solid ${C.border}` }}>
              <Row>
                <Field label="Device / Router Model" tight><Input value={d.existing4GModel||''} onChange={v=>u('existing4GModel',v)} placeholder="e.g. Teltonika, Cradlepoint, Peplink" /></Field>
                <Field label="4G Provider / SIM" tight><Input value={d.existing4GProvider||''} onChange={v=>u('existing4GProvider',v)} placeholder="e.g. Telstra, Optus, Vodafone" /></Field>
              </Row>
              <Field label="Managed by" tight><Input value={d.existing4GManagedBy||''} onChange={v=>u('existing4GManagedBy',v)} placeholder="Who manages this service?" /></Field>
            </div>
          )}
        </div>
      </div>

      {/* M365 */}
      <Divider label="Microsoft 365" />
      <InfoBox>Business Premium = named users (reception, PM, owner). F1 = shared device logins (treatment rooms). Laptop users → Business Premium.</InfoBox>
      <Row>
        <Field label="M365 Business Premium" hint="Named users — per user/month"><Num value={d.m365Premium||''} onChange={v=>u('m365Premium',v)} /></Field>
        <Field label="M365 F1" hint="Shared device logins — per device/month"><Num value={d.m365F1||''} onChange={v=>u('m365F1',v)} /></Field>
      </Row>
      <Toggle checked={!!d.existingM365} onChange={v=>u('existingM365',v)} label="Existing Microsoft 365 licences in place" sub={d.existingM365?'Capture licence details below':'No existing M365 tenancy'} />
      {d.existingM365 && (
        <div style={{ marginTop:12 }}>
          <InfoBox>Capture each user and their current licence type. If they don't have this info today, use the export button to generate a form they can fill out and return.</InfoBox>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:13, color:C.textPrimary }}>Existing M365 Users</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>u('m365Users',[...(d.m365Users||[]),{id:uid(),name:'',email:'',licence:'',notes:''}])}
                style={{ padding:'6px 14px', borderRadius:7, background:C.orange, color:C.white, border:'none', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add User</button>
              <button onClick={()=>{
                const rows=[['Name','Email','Licence Type','Notes'],...(d.m365Users||[]).map(u=>[u.name,u.email,u.licence,u.notes])];
                const csv=rows.map(r=>r.map(c=>'"'+(c||'')+'"').join(',')).join('\n');
                const blob=new Blob([csv],{type:'text/csv'});
                const a=document.createElement('a');a.href=URL.createObjectURL(blob);
                a.download=`m365-licences-${(d.practiceName||'practice').replace(/\s+/g,'-')}.csv`;a.click();
              }} style={{ padding:'6px 14px', borderRadius:7, background:C.navyMid, color:C.white, border:'none', fontSize:12, fontWeight:700, cursor:'pointer' }}>⬇ Export Form</button>
            </div>
          </div>
          {(d.m365Users||[]).length===0 && <div style={{ textAlign:'center', padding:'16px 0', color:C.textMuted, fontSize:13 }}>No users added yet. Add users or export a blank form for the practice to fill in.</div>}
          {(d.m365Users||[]).map((mu,i)=>(
            <div key={mu.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:8, padding:'8px 0', borderBottom:`1px solid ${C.border}`, alignItems:'center' }}>
              <Input value={mu.name||''} onChange={v=>u('m365Users',(d.m365Users||[]).map(x=>x.id===mu.id?{...x,name:v}:x))} placeholder="Full name" />
              <Input value={mu.email||''} onChange={v=>u('m365Users',(d.m365Users||[]).map(x=>x.id===mu.id?{...x,email:v}:x))} placeholder="email@practice.com" />
              <Select value={mu.licence||''} onChange={v=>u('m365Users',(d.m365Users||[]).map(x=>x.id===mu.id?{...x,licence:v}:x))}
                options={['Business Basic','Business Standard','Business Premium','Apps for Business','F1','F3','E3','E5','Other / Unknown']} placeholder="Licence type…" />
              <button onClick={()=>u('m365Users',(d.m365Users||[]).filter(x=>x.id!==mu.id))} style={{ color:C.red, background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:700 }}>×</button>
            </div>
          ))}
          {(d.m365Users||[]).length>0 && (
            <div style={{ marginTop:8, fontSize:12, color:C.textMuted }}>
              {(d.m365Users||[]).filter(u=>u.licence).length} of {(d.m365Users||[]).length} users with licence details captured
            </div>
          )}
          <Field label="M365 Tenant / Domain" tight hint="e.g. practicename.onmicrosoft.com">
            <Input value={d.m365Tenant||''} onChange={v=>u('m365Tenant',v)} placeholder="practicename.onmicrosoft.com" />
          </Field>
        </div>
      )}

      {/* PS */}
      <Divider label="Professional Services — Quote 1" />
      <InfoBox type="info">Auto-calculated at 2.5 hrs per device. Adjust if complexity warrants it.</InfoBox>
      <Row>
        <Field label="Installation Hours" hint={`Auto: ${psHrs.toFixed(1)} hrs (${totalD} devices × 2.5)`}>
          <Input type="number" value={d.installHours||''} onChange={v=>u('installHours',v)} placeholder={psHrs.toFixed(1)} />
        </Field>
      </Row>
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:4 }}>
        <Toggle checked={!!d.spSetup} onChange={v=>u('spSetup',v)} label="SharePoint / Intune / Azure AD Setup (5 hrs fixed)" sub="Tenant setup, security hardening, Intune device management, Azure AD join" />
        <Toggle checked={!!d.emailMigration} onChange={v=>u('emailMigration',v)} label="Email Migration to M365" sub="Migrate existing mailboxes, apply security hardening" />
      </div>
      <Field label="Infrastructure Notes" tight>
        <Textarea value={d.infraNotes||''} onChange={v=>u('infraNotes',v)} placeholder="Floor plan notes, cabling, builder coordination, equipment to reuse…" />
      </Field>
    </div>
  );
};

// ── Phase 4 ───────────────────────────────────────────────────────────────────
const Phase4 = ({ d, u }) => {
  const notReq = d.q2req === false;
  const hasPhones = (d.handsets||[]).some(h=>n(h.qty)>0) || (d.headsets||[]).some(h=>n(h.qty)>0) || (d.cordless||[]).some(h=>n(h.qty)>0);
  // Init handset arrays if needed
  const initHandsets = () => {
    if(!d.handsets) u('handsets', HANDSET_MODELS.map(m=>({ model:m, qty:'', notes:'' })));
    if(!d.headsets) u('headsets', HEADSET_MODELS.map(m=>({ model:m, qty:'', notes:'' })));
    if(!d.cordless) u('cordless', CORDLESS_MODELS.map(m=>({ model:m, qty:'', notes:'' })));
  };
  if(!d.handsets) { initHandsets(); return null; }

  const updHw = (key, idx, field, val) => {
    const arr = [...(d[key]||[])];
    arr[idx] = { ...arr[idx], [field]:val };
    u(key, arr);
  };

  return (
    <div>
      <PhaseHeader num={4} title="Telecommunications" sub="NBN, VoIP phone system and connectivity. This drives Quote 2." />
      {notReq && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:C.amberLight, border:`1.5px solid ${C.amberBorder}`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#FDE68A' }}>Quote 2 not selected for this engagement</span>
            <span style={{ fontSize:13, color:'#FDE68A' }}> — you can still capture details here, but this section won't appear in the Blueprint.</span>
          </div>
          <button onClick={()=>u('q2req',true)} style={{ fontSize:12, fontWeight:700, color:C.orange, background:C.surface, border:`1.5px solid ${C.orange}`, borderRadius:7, padding:'4px 12px', cursor:'pointer', whiteSpace:'nowrap' }}>Add to scope</button>
        </div>
      )}
      <Divider label="Internet Connection" />
      <Field label="Connection Type">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[
            {v:'nbn',    l:'Business NBN'},
            {v:'fibre',  l:'Private Fibre'},
            {v:'leased', l:'Leased Line'},
            {v:'other',  l:'Other'},
            {v:'none',   l:'None / TBC'},
          ].map(o=>{
            const a=(d.internetType||'nbn')===o.v;
            return <button key={o.v} onClick={()=>u('internetType',o.v)} style={{ padding:'9px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.border}`, background:a?C.orangeLight:C.surfaceHi, color:a?C.orange:C.textSecondary }}>{o.l}</button>;
          })}
        </div>
      </Field>

      {(d.internetType||'nbn')==='nbn' && (
        <div style={{ marginTop:4 }}>
          <Field label="NBN Speed Tier" tight hint="250/100 recommended for most practices. 1000/400 for high-volume imaging or multi-site.">
            <Select value={d.nbnTier||''} onChange={v=>u('nbnTier',v)} options={NBN_TIERS} placeholder="Select tier…" />
          </Field>
          <Field label="Tenancy Type" tight>
            <div style={{ display:'flex', gap:8 }}>
              {[{v:'new',l:'New tenancy'},{v:'existing',l:'Existing tenancy'}].map(o=>{
                const a=d.tenancy===o.v;
                return <button key={o.v} onClick={()=>u('tenancy',o.v)} style={{ flex:1, padding:'9px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.gray200}`, background:a?C.orangeLight:C.surfaceHi, color:a?C.orange:C.textSecondary }}>{o.l}</button>;
              })}
            </div>
          </Field>
          {d.tenancy==='new'&&<InfoBox type="warn">New tenancy — NBN termination charge may apply (~$300 passthrough). 32 Byte will confirm with NBN co.</InfoBox>}
        </div>
      )}

      {(d.internetType==='fibre'||d.internetType==='leased') && (
        <div style={{ marginTop:4 }}>
          <Row>
            <Field label="Provider" tight><Input value={d.fibreProvider||''} onChange={v=>u('fibreProvider',v)} placeholder="e.g. Telstra, Vocus, Aussie BB" /></Field>
            <Field label="Speed" tight>
              <Select value={d.fibreSpeed||''} onChange={v=>u('fibreSpeed',v)} placeholder="Select speed…"
                options={['100/100 Mbps','250/250 Mbps','500/500 Mbps','1000/1000 Mbps','10 Gbps','Other']} />
            </Field>
          </Row>
          {d.fibreSpeed==='Other' && <Field label="Custom Speed" tight><Input value={d.customSpeed||''} onChange={v=>u('customSpeed',v)} placeholder="e.g. 200/200 Mbps" /></Field>}
          <Field label="Contract Expiry" tight><Input type="date" value={d.internetExpiry||''} onChange={v=>u('internetExpiry',v)} /></Field>
        </div>
      )}

      {d.internetType==='other' && (
        <div style={{ marginTop:4 }}>
          <Row>
            <Field label="Connection Description" tight><Input value={d.otherInternetDesc||''} onChange={v=>u('otherInternetDesc',v)} placeholder="Describe the connection type" /></Field>
            <Field label="Speed" tight><Input value={d.customSpeed||''} onChange={v=>u('customSpeed',v)} placeholder="e.g. 100/100 Mbps" /></Field>
          </Row>
          <Field label="Provider" tight><Input value={d.fibreProvider||''} onChange={v=>u('fibreProvider',v)} placeholder="Provider name" /></Field>
        </div>
      )}

      <div style={{ marginTop:14 }}>
        <Toggle checked={!!d.sim4g} onChange={v=>u('sim4g',v)} label="4G Backup SIM (Unlimited Data)" sub="Works with Teltonika failover router. Always recommend for cloud-based practices." />
      </div>

      <Divider label="VoIP Phone Service" />
      <Toggle checked={!!d.voip} onChange={v=>u('voip',v)} label="VoIP phone service required" sub="Cloud phone system — no lock-in contracts." />
      {d.voip&&(
        <Row style={{ marginTop:14 }}>
          <Field label="Extensions / Licences" hint="Per user / extension"><Num value={d.voipLicences||''} onChange={v=>u('voipLicences',v)} /></Field>
          <Field label="DDI / Phone Numbers"><Num value={d.ddiLines||''} onChange={v=>u('ddiLines',v)} /></Field>
        </Row>
      )}
      {d.voip&&(
        <Toggle checked={!!d.porting} onChange={v=>u('porting',v)} label="Number porting required" sub="Existing number(s) to be transferred" />
      )}

      {d.voip&&(
        <div style={{ marginTop:16 }}>
          <Divider label="Call Flow" />
          <InfoBox>Design the call flow for this practice. Select a default template or customise each step.</InfoBox>
          <Field label="Call Flow Type">
            <div style={{ display:'flex', gap:8 }}>
              {[{v:'default',l:'Default Dental Practice'},{v:'custom',l:'Custom'}].map(o=>{
                const a=(d.callFlowType||'default')===o.v;
                return <button key={o.v} onClick={()=>u('callFlowType',o.v)} style={{ flex:1, padding:'9px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.border}`, background:a?C.orangeLight:C.surfaceHi, color:a?C.orange:C.textSecondary }}>{o.l}</button>;
              })}
            </div>
          </Field>

          {/* Visual call flow diagram */}
          <div style={{ background:C.navy, borderRadius:12, padding:'20px', marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16, textAlign:'center' }}>
              {(d.callFlowType||'default')==='default' ? 'Default Call Flow' : 'Custom Call Flow'}
            </div>
            {/* Node helper */}
            {(() => {
              const Node = ({icon,label,sub,color='#1E3869'}) => (
                <div style={{ background:color, border:`1.5px solid rgba(255,255,255,.15)`, borderRadius:9, padding:'10px 14px', textAlign:'center', minWidth:140 }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.white, lineHeight:1.3 }}>{label}</div>
                  {sub&&<div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginTop:3 }}>{sub}</div>}
                </div>
              );
              const Arrow = () => <div style={{ textAlign:'center', color:'rgba(255,255,255,.3)', fontSize:18, lineHeight:1.2, margin:'4px 0' }}>↓</div>;
              const Split = ({left,right}) => (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, margin:'4px 0' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ fontSize:10, color:C.green, fontWeight:700 }}>OPEN</div>
                    {left}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ fontSize:10, color:C.amber, fontWeight:700 }}>CLOSED</div>
                    {right}
                  </div>
                </div>
              );
              if((d.callFlowType||'default')==='default') return (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <Node icon="📞" label="Incoming Call" />
                  <Arrow />
                  <Node icon="🎙️" label={d.callFlowGreeting||'Welcome Message'} sub="Auto-attendant greeting" color="rgba(249,115,22,.3)" />
                  <Arrow />
                  <Node icon="🕐" label="Business Hours Check" />
                  <Split
                    left={<><Node icon="📳" label={d.callFlowHuntGroup||'Ring All Phones'} sub={`${d.voipLicences||'?'} extensions`} color="rgba(16,185,129,.2)" /><Arrow /><Node icon="📬" label="Voicemail" sub="Email to practice" color="#1E3869" /></>}
                    right={<><Node icon="🔔" label={d.callFlowAfterHours||'After Hours Message'} sub="Closed greeting" color="rgba(245,158,11,.2)" /><Arrow /><Node icon={d.callFlowOverflow?'📱':'📬'} label={d.callFlowOverflow||'Voicemail'} sub={d.callFlowOverflow?'Mobile overflow':'Email notification'} color="#1E3869" /></>}
                  />
                </div>
              );
              return (
                <div style={{ textAlign:'center', color:C.textMuted, fontSize:13, padding:'20px 0' }}>
                  Custom call flow — describe the routing in the notes below.
                </div>
              );
            })()}
          </div>

          {(d.callFlowType||'default')==='default' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <Row>
                <Field label="Welcome Greeting" tight hint="What callers hear when they call"><Input value={d.callFlowGreeting||''} onChange={v=>u('callFlowGreeting',v)} placeholder="e.g. Thanks for calling [Practice Name]…" /></Field>
                <Field label="Hunt Group Behaviour" tight><Select value={d.callFlowHuntGroup||''} onChange={v=>u('callFlowHuntGroup',v)} placeholder="Select…" options={['Ring all phones simultaneously','Ring in sequence','Ring reception first, then all']} /></Field>
              </Row>
              <Row>
                <Field label="After Hours Message" tight><Input value={d.callFlowAfterHours||''} onChange={v=>u('callFlowAfterHours',v)} placeholder="e.g. We are currently closed. Our hours are…" /></Field>
                <Field label="After Hours Overflow (optional)" tight hint="Mobile number to forward to after hours"><Input value={d.callFlowOverflow||''} onChange={v=>u('callFlowOverflow',v)} placeholder="e.g. 04xx xxx xxx" /></Field>
              </Row>
              <Field label="Voicemail Email" tight hint="Voicemail recordings emailed here"><Input type="email" value={d.callFlowVoicemailEmail||''} onChange={v=>u('callFlowVoicemailEmail',v)} placeholder="reception@practice.com.au" /></Field>
            </div>
          )}
          <Field label="Call Flow Notes" tight>
            <Textarea value={d.callFlowNotes||''} onChange={v=>u('callFlowNotes',v)} rows={2} placeholder="Special routing requirements, IVR options, multiple queues…" />
          </Field>
        </div>
      )}

      <Divider label="Desk Handsets" />
      <InfoBox>Select quantities for each model required. Leave blank if not needed.</InfoBox>
      <div style={{ border:`1px solid ${C.border}`, borderRadius:9, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'8px 14px', background:C.surface, fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:'.06em', textTransform:'uppercase', display:'grid', gridTemplateColumns:'1fr 80px', gap:10 }}>
          <span>Model</span><span style={{ textAlign:'center' }}>Qty</span>
        </div>
        {(d.handsets||[]).map((h,i)=>(
          <div key={h.model}>
            <HwRow label={h.model} qty={h.qty} onQty={v=>updHw('handsets',i,'qty',v)}
              notes={h.notes} onNotes={v=>updHw('handsets',i,'notes',v)} showNotes={h.model==='Other'} />
          </div>
        ))}
      </div>

      <Divider label="Wireless Headsets" />
      <div style={{ border:`1px solid ${C.border}`, borderRadius:9, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'8px 14px', background:C.surface, fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:'.06em', textTransform:'uppercase', display:'grid', gridTemplateColumns:'1fr 80px', gap:10 }}>
          <span>Model</span><span style={{ textAlign:'center' }}>Qty</span>
        </div>
        {(d.headsets||[]).map((h,i)=>(
          <div key={h.model}>
            <HwRow label={h.model} qty={h.qty} onQty={v=>updHw('headsets',i,'qty',v)}
              notes={h.notes} onNotes={v=>updHw('headsets',i,'notes',v)} showNotes={h.model==='Other'} />
          </div>
        ))}
      </div>

      <Divider label="Cordless Handsets" />
      <div style={{ border:`1px solid ${C.border}`, borderRadius:9, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'8px 14px', background:C.surface, fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:'.06em', textTransform:'uppercase', display:'grid', gridTemplateColumns:'1fr 80px', gap:10 }}>
          <span>Model</span><span style={{ textAlign:'center' }}>Qty</span>
        </div>
        {(d.cordless||[]).map((h,i)=>(
          <div key={h.model}>
            <HwRow label={h.model} qty={h.qty} onQty={v=>updHw('cordless',i,'qty',v)}
              notes={h.notes} onNotes={v=>updHw('cordless',i,'notes',v)} showNotes={h.model==='Other'} />
          </div>
        ))}
      </div>

      {hasPhones&&(
        <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:9, padding:'12px 16px', fontSize:13, color:C.textSecondary }}>
          Phone / headset setup: 2 hrs included in professional services
        </div>
      )}

      <Divider label="Notes" />
      <Textarea value={d.telecomNotes||''} onChange={v=>u('telecomNotes',v)} placeholder="Existing provider, contract expiry, number porting details, building NBN status…" />
    </div>
  );
};

// ── Phase 5 ───────────────────────────────────────────────────────────────────
const Phase5 = ({ d, u, rooms }) => {
  const autoEP = (rooms||[]).reduce((a,r)=>a+n(r.qty),0);
  const notReq = d.q3req === false;
  return (
    <div>
      <PhaseHeader num={5} title="Managed Services" sub="The ongoing monthly investment — Quote 3. Scales as the practice grows." />
      {notReq && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:C.amberLight, border:`1.5px solid ${C.amberBorder}`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#FDE68A' }}>Quote 3 not selected for this engagement</span>
            <span style={{ fontSize:13, color:'#FDE68A' }}> — you can still capture details here, but this section won't appear in the Blueprint.</span>
          </div>
          <button onClick={()=>u('q3req',true)} style={{ fontSize:12, fontWeight:700, color:C.orange, background:C.surface, border:`1.5px solid ${C.orange}`, borderRadius:7, padding:'4px 12px', cursor:'pointer', whiteSpace:'nowrap' }}>Add to scope</button>
        </div>
      )}
      <Divider label="TotalCare MSA — Baseline" />
      <div style={{ background:C.orangeLight, border:`1.5px solid ${C.orangeBorder}`, borderRadius:11, padding:'14px 18px', marginBottom:16 }}>
        <div style={{ fontWeight:700, color:C.textPrimary, fontSize:14, marginBottom:4 }}>TotalCare — All-inclusive managed IT</div>
        <div style={{ fontSize:13, color:C.textSecondary, lineHeight:1.5 }}>Unlimited remote support · On-site when needed · Proactive monitoring · Automated patching · Practice software & vendor management · Network management · Dedicated account manager</div>
      </div>
      <Field label="Managed Endpoints" hint={autoEP>0?`${autoEP} devices detected from Phase 3 — adjust if needed`:'Total PCs, laptops and managed workstations'}>
        <Input type="number" value={d.endpoints||''} onChange={v=>u('endpoints',v)} placeholder={autoEP>0?autoEP.toString():'0'} />
      </Field>

      <Divider label="Advanced Cyber Security" />
      <Card style={{ borderColor: d.advancedCyber ? C.orangeBorder : C.gray200 }}>
        <Toggle checked={!!d.advancedCyber} onChange={v=>u('advancedCyber',v)}
          label="Advanced Cyber Security Suite"
          sub="SOC 24/7 monitoring · Privileged access management · Password manager · Dark web monitoring" />
      </Card>

      <Divider label="Backup & Disaster Recovery" />
      <InfoBox type={d.server==='onprem'?'warn':'info'}>
        {d.server==='onprem'
          ?'On-premise server — Datto Siris BCDR appliance strongly recommended.'
          :'Cloud-based practice — consider whether local BCDR or cloud backup best suits the practice.'}
      </InfoBox>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Toggle checked={!!d.datto} onChange={v=>u('datto',v)}
          label="Datto Siris BCDR Appliance"
          sub="On-premise backup + automated cloud replication. Hardware included on 36-month term." />
        <Toggle checked={!!d.cloudBackup} onChange={v=>u('cloudBackup',v)}
          label="Standalone Cloud Backup"
          sub="Cloud-only backup. Suitable for fully cloud-based practices." />
      </div>

      <Divider label="Additional" />
      <Field label="Additional Practice Sites / Locations">
        <Num value={d.additionalSites||''} onChange={v=>u('additionalSites',v)} />
      </Field>
      <Divider label="Cyber Liability Insurance" />
      <InfoBox>Capture the practice's existing cyber insurance details — important context for our Advanced Cyber Security recommendations.</InfoBox>
      <Row>
        <Field label="Insurer / Provider"><Input value={d.cyberInsurer||''} onChange={v=>u('cyberInsurer',v)} placeholder="e.g. AXA, Chubb, Emergence" /></Field>
        <Field label="Policy Number"><Input value={d.cyberPolicyNumber||''} onChange={v=>u('cyberPolicyNumber',v)} placeholder="Policy number" /></Field>
      </Row>
      <Field label="Policy Expiry">
        <Input type="date" value={d.cyberExpiry||''} onChange={v=>u('cyberExpiry',v)} />
      </Field>
      <Field label="Managed Services Notes" tight>
        <Textarea value={d.msaNotes||''} onChange={v=>u('msaNotes',v)} placeholder="Special requirements, existing contracts, additional context…" />
      </Field>
    </div>
  );
};

// ── Phase 6: Blueprint (Customer Facing) ──────────────────────────────────────
const SumRow = ({ label, value }) => value ? (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
    <span style={{ fontSize:14, color:C.textSecondary }}>{label}</span>
    <span style={{ fontSize:14, fontWeight:600, color:C.textPrimary, textAlign:'right', maxWidth:'58%' }}>{value}</span>
  </div>
) : null;

const SumSection = ({ title, children, accent }) => {
  const valid = [children].flat(5).filter(c=>c&&c.props&&c.props.value);
  if(!valid.length) return null;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ padding:'9px 16px', background:accent?C.orange:C.navyMid, borderRadius:'9px 9px 0 0' }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.white, letterSpacing:'.04em', textTransform:'uppercase' }}>{title}</span>
      </div>
      <div style={{ border:`1px solid ${C.border}`, borderTop:'none', borderRadius:'0 0 9px 9px', padding:'4px 16px 10px' }}>{children}</div>
    </div>
  );
};

// KQM row (internal)
const KRow = ({ label, value, indent }) => value ? (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
    <span style={{ fontSize:13, color:C.textSecondary, paddingLeft:indent?14:0 }}>{indent?'↳ ':''}{label}</span>
    <span style={{ fontSize:13, fontWeight:600, color:C.textPrimary, textAlign:'right', maxWidth:'58%' }}>{value}</span>
  </div>
) : null;
const KSection = ({ title, children }) => {
  const valid = [children].flat(5).filter(c=>c&&c.props&&c.props.value);
  if(!valid.length) return null;
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ padding:'6px 12px', background:C.navyMid, borderRadius:'6px 6px 0 0' }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.white }}>{title}</span>
      </div>
      <div style={{ border:`1px solid ${C.border}`, borderTop:'none', borderRadius:'0 0 6px 6px', padding:'3px 12px 6px' }}>{children}</div>
    </div>
  );
};

const QCard = ({ label, url, onChange, locked }) => (
  <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:11, padding:'12px 16px', marginBottom:10 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
      <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:13, color:C.textPrimary }}>{label}</span>
      {url&&<a href={url} target="_blank" rel="noreferrer" style={{ fontSize:12, fontWeight:700, color:C.orange, textDecoration:'none', background:C.orangeLight, padding:'3px 10px', borderRadius:6 }}>Open ↗</a>}
    </div>
    {!locked
      ?<Input value={url||''} onChange={onChange} placeholder="Paste KQM quote URL after creating in Kaseya…" />
      :<div style={{ fontSize:13, color:url?C.gray400:'#CBD5E1', fontStyle:url?'normal':'italic' }}>{url||'No URL entered'}</div>}
  </div>
);

// ── EmailJS config — replace with your credentials ────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_sgc4jti';
const EMAILJS_TEMPLATE_ID = 'template_p09ril7';
const EMAILJS_PUBLIC_KEY  = 'BHVAl9FmTs7NpCSR0';

const loadEmailJS = () => new Promise((res, rej) => {
  if (window.emailjs) { res(window.emailjs); return; }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = () => { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); res(window.emailjs); };
  s.onerror = rej;
  document.head.appendChild(s);
});

// Email modal
const EmailModal = ({ d, rooms, onClose }) => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [copied,  setCopied]  = useState(false);

  const buildPrompt = () => {
    const autoEP = (rooms||[]).reduce((a,r)=>a+n(r.qty),0);
    const endpoints = n(d.endpoints)||autoEP;
    const roomList = (rooms||[]).map(r=>{
      const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];
      return `${r.name||'Room'}: ${dev.label} × ${n(r.qty)}${r.database?' (RAID storage)':''}`;
    }).join(', ');
    const hwList = [
      d.nbn && `Business NBN ${d.nbnTier||''}`,
      d.sim4g && '4G backup SIM',
      d.voip && `VoIP phone service (${d.voipLicences||'?'} licences)`,
      ...(d.handsets||[]).filter(h=>n(h.qty)>0).map(h=>`${n(h.qty)}× ${h.model} handset${n(h.qty)!==1?'s':''}`),
      ...(d.headsets||[]).filter(h=>n(h.qty)>0).map(h=>`${n(h.qty)}× ${h.model} headset${n(h.qty)!==1?'s':''}`),
    ].filter(Boolean).join(', ');
    const msaList = [
      endpoints>0 && `TotalCare MSA (${endpoints} device${endpoints!==1?'s':''})`,
      d.advancedCyber && 'Advanced Cyber Security Suite',
      d.datto && 'Datto BCDR Appliance',
      d.cloudBackup && 'Cloud Backup',
    ].filter(Boolean).join(', ');
    const fmtDate = s => s ? new Date(s+'T00:00:00').toLocaleDateString('en-AU',{ day:'numeric', month:'long', year:'numeric' }) : null;
    return `You are writing a follow-up email on behalf of ${d.salesRep||'the 32 Byte team'} at 32 Byte, a dental IT specialist company based in Australia.

Write a warm, professional email to ${d.contactName||'the practice'} at ${d.practiceName||'the practice'} following a Practice Success Blueprint meeting.

Here is what was covered in the meeting:
- Practice: ${d.practiceName||'New practice'}, ${d.suburb||''} ${d.state||''}
- Opening date: ${fmtDate(d.openingDate)||'TBD'}
- PMS: ${d.pms||'TBD'}
- Imaging software: ${(d.imagingSw||[]).join(', ')||'TBD'}
- IT devices (room by room): ${roomList||'TBD'}
- Networking: ${[d.switchType, d.wifiAPs&&`${d.wifiAPs}× UniFi U7 Pro AP`, d.cameras&&`${d.cameraCount||'?'} security cameras`, d.firewall&&'UDM Pro firewall', d.failover&&'4G failover'].filter(Boolean).join(', ')||'TBD'}
- Microsoft 365: ${[d.m365Premium&&`${d.m365Premium}× Business Premium`, d.m365F1&&`${d.m365F1}× F1`].filter(Boolean).join(', ')||'TBD'}
- Telecoms: ${hwList||'TBD'}
- Managed services: ${msaList||'TBD'}
${d.financeProvider?`- Finance: ${d.financeProvider}`:''}
${d.notes?`- Additional notes: ${d.notes}`:''}

The email should:
1. Thank them for their time today
2. Confirm the opening date and that 32 Byte is locking in the schedule
3. Briefly summarise the solution agreed (in plain, non-technical language appropriate for a practice owner)
4. Mention that formal quotes will follow shortly
5. Invite any questions
6. Close warmly

Keep the tone friendly and confident but not overly casual. Do not include any pricing. Sign off as ${d.salesRep||'the 32 Byte team'} from 32 Byte.

Return only the email text, no subject line, no preamble.`;
  };

  const generate = async () => {
    setLoading(true);
    setEmail('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          messages:[{ role:'user', content:buildPrompt() }]
        })
      });
      const data = await res.json();
      const text = (data.content||[]).map(c=>c.text||'').join('\n');
      setEmail(text);
    } catch(e) {
      setEmail('Error generating email. Please try again.');
    }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(email); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const sendEmail = async () => {
    if (!d.contactEmail) { alert('No client email address entered. Add it in Phase 1.'); return; }
    setSending(true);
    try {
      const ejs = await loadEmailJS();
      const autoEP2 = (rooms||[]).reduce((a,r)=>a+n(r.qty),0);
      const endpoints2 = n(d.endpoints)||autoEP2;

      // Build IT summary (rooms + networking only)
      const itLines = [
        ...(rooms||[]).map(r=>{
          const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];
          return r.existingPC
            ? `• ${r.name||'Room'}: Existing PC (${r.pcBrand||'brand TBC'}${r.pcAge?' · '+r.pcAge+' yrs':''})`
            : `• ${r.name||'Room'}: ${dev.label} × ${n(r.qty)}${r.database?' + RAID':''}${r.monitor&&r.monitor!=='No Monitor'?' · '+r.monitor:''}`;
        }),
        d.switchType&&`• Switch: ${d.switchType}`,
        d.wifiAPs&&`• Wi-Fi: ${d.wifiAPs}× UniFi U7 Pro${d.apMount?' ('+d.apMount+' mount)':''}`,
        d.firewall&&`• Firewall: UDM Pro`,
        d.failover&&`• 4G Failover: Teltonika TRB140`,
        d.cameras&&`• Security Cameras: ${d.cameraCount||'?'}× UniFi G5${d.nvrStorage?' · '+d.nvrStorage:''}`,
        (d.m365Premium||d.m365F1)&&`• Microsoft 365: ${[d.m365Premium&&d.m365Premium+'× Business Premium',d.m365F1&&d.m365F1+'× F1'].filter(Boolean).join(', ')}`,
      ].filter(Boolean).join('\n') || 'Not included in this engagement.';

      // Build imaging summary
      const imagingLines = [
        ...(d.intraoralScanners||[]).map((s,i)=>`• Intraoral Scanner${(d.intraoralScanners||[]).length>1?' '+(i+1):''}: ${s.model||'Model TBC'}${s.software?' · '+s.software:''}${s.dedicated?' · Dedicated PC':''}${s.database?' · RAID':''}`),
        ...(d.xrayMachines||[]).map((x,i)=>`• ${x.type||'X-ray'}${(d.xrayMachines||[]).length>1?' '+(i+1):''}: ${x.model||'Model TBC'}${x.software?' · '+x.software:''}${x.timing?' · '+x.timing:''}${x.database?' · RAID':''}`),
        ...(d.otherImaging||[]).map(o=>`• Other: ${o.desc||'TBC'}`),
      ].filter(Boolean).join('\n') || 'No imaging equipment captured.';

      // Build telco summary
      const telcoLines = [
        d.nbn&&`• Internet: Business NBN ${d.nbnTier||''}`,
        d.internetType&&d.internetType!=='nbn'&&`• Internet: ${d.internetType==='fibre'?'Private Fibre':d.internetType==='leased'?'Leased Line':d.internetType} ${d.fibreSpeed||d.customSpeed||''}${d.fibreProvider?' · '+d.fibreProvider:''}`,
        d.sim4g&&`• 4G Backup SIM: Included`,
        d.voip&&`• VoIP Phone Service: ${d.voipLicences||'?'} licences${d.porting?' · Number porting':''}`,
        ...(d.handsets||[]).filter(h=>n(h.qty)>0).map(h=>`• ${h.model} Handset: × ${h.qty}`),
        ...(d.headsets||[]).filter(h=>n(h.qty)>0).map(h=>`• ${h.model} Headset: × ${h.qty}`),
        ...(d.cordless||[]).filter(h=>n(h.qty)>0).map(h=>`• ${h.model} Cordless: × ${h.qty}`),
      ].filter(Boolean).join('\n') || 'Not included in this engagement.';

      // Build MSA summary
      const msaLines = [
        endpoints2>0&&`• TotalCare MSA: ${endpoints2} device${endpoints2!==1?'s':''}`,
        d.advancedCyber&&`• Advanced Cyber Security Suite: Included`,
        d.datto&&`• Datto Siris BCDR Appliance: Included`,
        d.cloudBackup&&`• Cloud Backup: Included`,
      ].filter(Boolean).join('\n') || 'Not included in this engagement.';

      // Build quote links
      const quoteLines = [
        d.q1req!==false&&d.q1url&&`Solution 1 — Hardware & Infrastructure:\n${d.q1url}`,
        d.q2req!==false&&d.q2url&&`Solution 2 — Telecommunications:\n${d.q2url}`,
        d.q3req!==false&&d.q3url&&`Solution 3 — Managed Services:\n${d.q3url}`,
      ].filter(Boolean).join('\n\n') || 'Quotes will be sent through shortly.';

      const openingLabel = d.practiceType==='new'
        ? (d.openingDate ? '🗓 Target Opening: '+new Date(d.openingDate+'T00:00:00').toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : 'Opening date TBC')
        : (d.goLiveDate  ? '🗓 Go-Live: '+new Date(d.goLiveDate+'T00:00:00').toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : 'Go-live date TBC');

      await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:        d.contactEmail,
        to_name:         d.contactName   || d.practiceName || 'there',
        from_name:       d.salesRep      || '32 Byte',
        subject:         `Your Practice Success Blueprint — ${d.practiceName||'New Practice'}`,
        message:         email,
        practice:        d.practiceName  || '',
        opening_date:    openingLabel,
        it_summary:      itLines,
        imaging_summary: imagingLines,
        telco_summary:   telcoLines,
        msa_summary:     msaLines,
        quote_links:     quoteLines,
      });
      setSent(true);
    } catch(e) {
      alert('Email failed to send. Check your EmailJS credentials or copy and send manually.');
    }
    setSending(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }}>
      <div style={{ background:C.surface, borderRadius:16, width:'100%', maxWidth:640, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,.3)' }}>
        <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:C.textPrimary }}>Client Follow-up Email</div>
            <div style={{ fontSize:13, color:C.textSecondary, marginTop:2 }}>AI-drafted · review before sending</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, color:C.textMuted, cursor:'pointer', padding:'0 4px' }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          {!email&&!loading&&(
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✉️</div>
              <p style={{ fontSize:15, color:C.textSecondary, marginBottom:20 }}>Generate a personalised follow-up email for <strong>{d.contactName||'the practice'}</strong> based on everything captured in this Blueprint.</p>
              <button onClick={generate} style={{ padding:'13px 32px', borderRadius:10, background:C.orange, color:C.white, border:'none', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
                Generate Email
              </button>
            </div>
          )}
          {loading&&(
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:14, color:C.textSecondary }}>Drafting your email…</div>
              <div style={{ marginTop:16, display:'flex', justifyContent:'center', gap:6 }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:C.orange, animation:`pulse 1.2s ease-in-out ${i*.2}s infinite` }}/>
                ))}
              </div>
            </div>
          )}
          {email&&!loading&&(
            <div>
              <Textarea value={email} onChange={setEmail} rows={16} />
              {sent && <InfoBox type="info" style={{ marginTop:12 }}>✅ Email sent successfully to {d.contactEmail}</InfoBox>}
              <div style={{ display:'flex', gap:10, marginTop:14 }}>
                <button onClick={generate} style={{ padding:'10px 18px', borderRadius:8, border:`1.5px solid ${C.border}`, background:C.surface, color:C.textSecondary, fontSize:13, fontWeight:600, cursor:'pointer' }}>Regenerate</button>
                <button onClick={copy} style={{ flex:1, padding:'10px', borderRadius:8, border:`1.5px solid ${copied?C.green:C.gray200}`, background:copied?C.greenLight:C.white, color:copied?C.green:C.gray600, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {copied?'✓ Copied':'Copy'}
                </button>
                <button onClick={sendEmail} disabled={sending||sent} style={{ flex:2, padding:'10px', borderRadius:8, background:sent?C.green:C.orange, color:C.white, border:'none', fontSize:13, fontWeight:700, cursor:sending||sent?'default':'pointer', opacity:sending?.75:1, fontFamily:'Sora,sans-serif' }}>
                  {sent?'✓ Sent':sending?'Sending…':`Send to ${d.contactEmail||'client'}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );
};

const Phase6 = ({ d, u, locked, onLock, rooms }) => {
  const [showKqm,      setShowKqm]      = useState(false);
  const [showEmail,    setShowEmail]    = useState(false);
  const [showInternal, setShowInternal] = useState(false);
  const [internalSent, setInternalSent] = useState(false);
  const [internalSending, setInternalSending] = useState(false);
  const autoEP = (rooms||[]).reduce((a,r)=>a+n(r.qty),0);
  const endpoints = n(d.endpoints)||autoEP;
  const psHrs = n(d.installHours)||(rooms.reduce((a,r)=>a+n(r.qty),0)*2.5);
  const hasPhones = (d.handsets||[]).some(h=>n(h.qty)>0)||(d.headsets||[]).some(h=>n(h.qty)>0)||(d.cordless||[]).some(h=>n(h.qty)>0);
  const telPS = hasPhones ? 2 : 0;
  const fmtDate = s => s ? new Date(s+'T00:00:00').toLocaleDateString('en-AU',{ weekday:'long', day:'numeric', month:'long', year:'numeric' }) : null;
  const shortDate = s => s ? new Date(s+'T00:00:00').toLocaleDateString('en-AU',{ day:'numeric', month:'short', year:'numeric' }) : null;

  return (
    <div>
      {showEmail&&<EmailModal d={d} rooms={rooms} onClose={()=>setShowEmail(false)} />}

      {/* Internal Summary Modal */}
      {showInternal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }}>
          <div style={{ background:C.surface, borderRadius:16, width:'100%', maxWidth:680, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 60px rgba(0,0,0,.3)' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, color:C.textPrimary }}>Internal Team Summary</div>
                <div style={{ fontSize:13, color:C.textSecondary, marginTop:2 }}>Send a full project brief to the 32 Byte team</div>
              </div>
              <button onClick={()=>setShowInternal(false)} style={{ background:'none', border:'none', fontSize:20, color:C.textMuted, cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
              <Field label="Send to (team email address)">
                <Input type="email" value={d.internalTeamEmail||''} onChange={v=>u('internalTeamEmail',v)} placeholder="team@32byte.com.au" />
              </Field>
              {/* Copyable internal summary */}
              <div style={{ background:C.surfaceHi, borderRadius:10, padding:'16px 18px', fontSize:13, color:C.textPrimary, lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:16, maxHeight:400, overflowY:'auto' }}>
{`PRACTICE SUCCESS BLUEPRINT — INTERNAL BRIEF
${'═'.repeat(50)}
Practice: ${d.practiceName||'—'} | ${[d.suburb, d.state].filter(Boolean).join(', ')||'—'}
${d.practiceType==='new'?`Opening: ${d.openingDate||'TBD'} | Fitout: ${d.fitoutDate||'TBD'}`:`Go-Live: ${d.goLiveDate||'TBD'}`}
PMS: ${d.pms||'—'} | Imaging SW: ${(d.imagingSw||[]).join(', ')||'—'}
Sales Rep: ${d.salesRep||'—'} | Meeting: ${d.meetingDate||'—'}
Contact: ${d.contactName||'—'} | ${d.contactEmail||'—'}
${d.financeProvider?`Finance: ${d.financeProvider}`:''}

${d.practiceType==='existing'&&d.existingIT?`EXISTING IT PROVIDER
${'─'.repeat(40)}
Company: ${d.existingITCompany||'—'} | Type: ${d.existingITType||'—'}
Contact: ${d.existingITContact||'—'} | ${d.existingITPhone||'—'} | ${d.existingITEmail||'—'}
Contract Expiry: ${d.existingITExpiry||'—'}
Currently manages: ${[d.existingITManagesDevices&&'Devices',d.existingITManagesEmail&&'Email',d.existingITManagesPhones&&'Phones',d.existingITManagesInternet&&'Internet',d.existingITManagesSecurity&&'Security'].filter(Boolean).join(', ')||'—'}
${d.existingITNotes?`Notes: ${d.existingITNotes}`:''}
`:''}
SOLUTIONS IN SCOPE
${'─'.repeat(40)}
${[d.q1req!==false&&`✅ Solution 1 — Hardware & Infrastructure${d.q1url?'\n   '+d.q1url:''}`,d.q2req!==false&&`✅ Solution 2 — Telecommunications${d.q2url?'\n   '+d.q2url:''}`,d.q3req!==false&&`✅ Solution 3 — Managed Services${d.q3url?'\n   '+d.q3url:''}`].filter(Boolean).join('\n')||'None selected'}

IT INFRASTRUCTURE
${'─'.repeat(40)}
${rooms.map(r=>{const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];return`${r.name||'Room'}: ${dev.label} × ${n(r.qty)}${r.database?' [RAID]':''}${r.monitor&&r.monitor!=='No Monitor'?' · '+r.monitor:''}`;}).join('\n')||'No rooms configured'}
Switch: ${d.switchType||'—'} | APs: ${d.wifiAPs||'0'}× UniFi U7 Pro (${d.apMount||'TBC'})
${d.cameras?`Cameras: ${d.cameraCount||'?'}× UniFi G5 · ${d.nvrStorage||'NVR TBC'}`:''}
${d.firewall?'Firewall: UDM Pro':''}  ${d.failover?'4G Failover: Teltonika TRB140':''}
M365: ${[d.m365Premium&&`${d.m365Premium}× Business Premium`,d.m365F1&&`${d.m365F1}× F1`].filter(Boolean).join(', ')||'—'}

IMAGING EQUIPMENT
${'─'.repeat(40)}
${(d.intraoralScanners||[]).map((s,i)=>`Intraoral ${i+1}: ${s.model||'TBC'} | SW: ${s.software||'—'}${s.dedicated?' [dedicated PC]':''}${s.database?' [RAID]':''}`).join('\n')||'No intraoral scanners'}
${(d.xrayMachines||[]).map((x,i)=>`X-ray ${i+1}: ${x.model||'TBC'} (${x.type||'type TBC'}) | SW: ${x.software||'—'} | Timing: ${x.timing||'—'}${x.dedicated?' [dedicated PC]':''}${x.database?' [RAID]':''}`).join('\n')||'No X-ray / imaging machines'}
${(d.otherImaging||[]).map((o,i)=>`Other ${i+1}: ${o.desc||'TBC'} | ${o.notes||'—'}`).join('\n')||''}

EXTERNAL VENDORS
${'─'.repeat(40)}
${(d.vendors||[]).map(v=>`${v.type||'Vendor'}: ${v.company||'—'} | ${v.contact||'—'} | ${v.phone||'—'} | ${v.email||'—'} | Install: ${v.installResp||'TBD'}`).join('\n')||'No vendors captured'}

TELECOMS
${'─'.repeat(40)}
NBN: ${d.nbn?(d.nbnTier||'TBC'):'Not required'} | 4G SIM: ${d.sim4g?'Yes':'No'}
VoIP: ${d.voip?`${d.voipLicences||'?'} licences${d.porting?' · porting required':''}`:'Not required'}
${[...(d.handsets||[]).filter(h=>n(h.qty)>0).map(h=>`${h.model} Handset × ${h.qty}`),
   ...(d.headsets||[]).filter(h=>n(h.qty)>0).map(h=>`${h.model} Headset × ${h.qty}`),
   ...(d.cordless||[]).filter(h=>n(h.qty)>0).map(h=>`${h.model} Cordless × ${h.qty}`)].join(' | ')||'No handsets / headsets'}

MANAGED SERVICES
${'─'.repeat(40)}
${n(d.endpoints)||rooms.reduce((a,r)=>a+n(r.qty),0)} endpoints | Advanced Cyber: ${d.advancedCyber?'Yes':'No'}
BCDR: ${d.datto?'Datto Siris':'No'} | Cloud Backup: ${d.cloudBackup?'Yes':'No'}
${d.cyberInsurer?`Cyber Insurance: ${d.cyberInsurer}${d.cyberPolicyNumber?' | Policy: '+d.cyberPolicyNumber:''}${d.cyberExpiry?' | Expiry: '+d.cyberExpiry:''}`:'' }

${d.notes?`MEETING NOTES\n${'─'.repeat(40)}\n${d.notes}`:''}`}
              </div>
              {internalSent && <InfoBox type="info">✅ Internal summary sent to {d.internalTeamEmail}</InfoBox>}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>{
                  const el=document.createElement('textarea');
                  el.value=document.querySelector('.psb-internal-summary')?.textContent||'';
                  navigator.clipboard.writeText(d.internalTeamEmail);
                }} style={{ flex:1, padding:'10px', borderRadius:8, border:`1.5px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Copy Summary
                </button>
                <button
                  disabled={!d.internalTeamEmail||internalSending||internalSent}
                  onClick={async()=>{
                    if(!d.internalTeamEmail){alert('Enter a team email address above.');return;}
                    setInternalSending(true);
                    try{
                      const ejs=await loadEmailJS();
                      const autoEP=rooms.reduce((a,r)=>a+n(r.qty),0);
                      const ep=n(d.endpoints)||autoEP;
                      await ejs.send(EMAILJS_SERVICE_ID,'template_k2an72p',{
                        to_email:d.internalTeamEmail,
                        practice:d.practiceName||'New Practice',
                        sales_rep:d.salesRep||'—',
                        go_live:d.practiceType==='new'?(d.openingDate||'TBD'):(d.goLiveDate||'TBD'),
                        practice_type:d.practiceType==='new'?'New build':'Existing / fit-out',
                        summary: `Practice: ${d.practiceName||'—'}, ${d.suburb||''} ${d.state||''}
PMS: ${d.pms||'—'} | Contact: ${d.contactName||'—'} | ${d.contactEmail||'—'}
Solutions: ${[d.q1req!==false&&'S1 Hardware',d.q2req!==false&&'S2 Telco',d.q3req!==false&&'S3 MSA'].filter(Boolean).join(', ')}
Devices: ${rooms.map(r=>{const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];return`${r.name||'Room'}: ${dev.label} ×${n(r.qty)}`;}).join(' | ')||'—'}
Endpoints: ${ep} | Advanced Cyber: ${d.advancedCyber?'Yes':'No'} | BCDR: ${d.datto?'Yes':'No'}
Vendors: ${(d.vendors||[]).map(v=>`${v.company||v.type}`).join(', ')||'None'}
${d.notes?'Notes: '+d.notes:''}`,
                      });
                      setInternalSent(true);
                    }catch(e){alert('Failed to send. Check your internal EmailJS template ID.');}
                    setInternalSending(false);
                  }}
                  style={{ flex:2, padding:'10px', borderRadius:8, background:internalSent?C.green:C.navyMid, color:C.white, border:'none', fontSize:13, fontWeight:700, cursor:!d.internalTeamEmail||internalSending||internalSent?'default':'pointer', opacity:!d.internalTeamEmail?.6:1, fontFamily:'Sora,sans-serif' }}>
                  {internalSent?'✓ Sent':internalSending?'Sending…':'Send to Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PhaseHeader num={6} title="Practice Blueprint" sub="Your complete technology solution, tailored for your practice." />

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, borderRadius:16, padding:'28px 30px', marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:180, height:180, borderRadius:'50%', background:'rgba(249,115,22,.08)' }}/>
        <div style={{ position:'absolute', bottom:-50, right:60, width:120, height:120, borderRadius:'50%', background:'rgba(249,115,22,.05)' }}/>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', color:C.orange, textTransform:'uppercase', marginBottom:10, position:'relative' }}>Practice Success Blueprint</div>
        <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:26, margin:'0 0 4px', color:C.white, position:'relative' }}>{d.practiceName||'Your Practice'}</h3>
        <p style={{ margin:'0 0 18px', color:'#94A3B8', fontSize:15, position:'relative' }}>
          {d.principalDentist&&`${d.principalDentist} · `}{d.suburb}{d.state?`, ${d.state}`:''}{n(d.chairs)>0?` · ${d.chairs} chair${n(d.chairs)!==1?'s':''}`:''}</p>
        {(() => {
          const dateVal = d.practiceType==='new' ? d.openingDate : d.goLiveDate;
          const dateLabel = d.practiceType==='new' ? 'Opening' : 'Go-Live';
          return dateVal
            ? <div style={{ display:'inline-flex', alignItems:'center', background:C.orange, borderRadius:9, padding:'10px 20px', position:'relative' }}><span style={{ fontSize:14, fontWeight:700, color:C.white }}>🗓 {dateLabel} {fmtDate(dateVal)}</span></div>
            : <div style={{ display:'inline-flex', background:'rgba(255,255,255,.07)', borderRadius:9, padding:'10px 20px' }}><span style={{ fontSize:13, color:'#64748B' }}>Date not yet confirmed</span></div>;
        })()}
        <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap', position:'relative' }}>
          {[d.pms,
            ...(d.imagingSw||[]).filter(s=>s!=='Other'),
            ...(d.imagingSwOthers||[]).filter(Boolean),
            d.financeProvider&&`Finance: ${d.financeProvider}`,
            d.practiceType==='new'?'New build':'Existing fit-out'
          ].filter(Boolean).map(t=>(
            <span key={t} style={{ fontSize:12, fontWeight:600, color:'#94A3B8', background:'rgba(255,255,255,.07)', borderRadius:6, padding:'4px 10px' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Summary sections */}
      {d.q1req !== false && (
        <SumSection title="IT Infrastructure">
          {(rooms||[]).map(r=>{
            const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];
            return <SumRow key={r.id} label={r.name||'Room'} value={`${dev.label} × ${n(r.qty)}${r.database?' + RAID':''}${r.monitor&&r.monitor!=='No Monitor'?` · ${r.monitor}`:''}${r.kbMouse?' · KB+Mouse':''}`} />;
          })}
          <SumRow label="Switch" value={d.switchType||null} />
          <SumRow label="Wi-Fi" value={d.wifiAPs?`${d.wifiAPs}× UniFi U7 Pro (${d.apMount||'TBC'} mount)`:null} />
          <SumRow label="Firewall" value={d.firewall?'UDM Pro':null} />
          <SumRow label="4G Failover" value={d.failover?'Teltonika TRB140':null} />
          <SumRow label="Security Cameras" value={d.cameras?`${d.cameraCount||'?'}× UniFi G5 · ${d.nvrStorage||'NVR TBC'}`:null} />
          <SumRow label="Microsoft 365" value={[d.m365Premium&&`${d.m365Premium}× Business Premium`,d.m365F1&&`${d.m365F1}× F1`].filter(Boolean).join(', ')||null} />
        </SumSection>
      )}

      <SumSection title="Imaging Equipment">
        {(d.intraoralScanners||[]).map((s,i)=><SumRow key={s.id} label={`Intraoral Scanner ${(d.intraoralScanners||[]).length>1?i+1:''}`} value={[s.model,s.software].filter(Boolean).join(' · ')||'Model TBC'} />)}
        {(d.xrayMachines||[]).map((x,i)=><SumRow key={x.id} label={`${x.type||'X-ray'} ${(d.xrayMachines||[]).length>1?i+1:''}`} value={[x.model,x.timing].filter(Boolean).join(' · ')||'Model TBC'} />)}
        {(d.otherImaging||[]).map((o,i)=><SumRow key={o.id} label={`Other Imaging ${(d.otherImaging||[]).length>1?i+1:''}`} value={o.desc||'Device TBC'} />)}
        {!(d.intraoralScanners||[]).length&&!(d.xrayMachines||[]).length&&!(d.otherImaging||[]).length&&<SumRow label="Imaging" value="None captured" />}
      </SumSection>

      {d.q2req !== false && (
        <SumSection title="Telecommunications">
          <SumRow label="Internet" value={d.nbn?`Business NBN ${d.nbnTier||''}`:null} />
          <SumRow label="4G Backup SIM" value={d.sim4g?'Included':null} />
          <SumRow label="VoIP Phone Service" value={d.voip?`${d.voipLicences||'?'} licences${d.porting?' · Number porting':''}`:null} />
          {(d.handsets||[]).filter(h=>n(h.qty)>0).map(h=><SumRow key={h.model} label={`${h.model} Handset`} value={`× ${h.qty}`} />)}
          {(d.headsets||[]).filter(h=>n(h.qty)>0).map(h=><SumRow key={h.model} label={`${h.model} Headset`} value={`× ${h.qty}`} />)}
          {(d.cordless||[]).filter(h=>n(h.qty)>0).map(h=><SumRow key={h.model} label={`${h.model} Cordless`} value={`× ${h.qty}`} />)}
        </SumSection>
      )}

      {d.q3req !== false && (
        <SumSection title="Managed IT Services" accent>
          <SumRow label="TotalCare MSA" value={endpoints>0?`${endpoints} device${endpoints!==1?'s':''}`:null} />
          <SumRow label="Advanced Cyber Security" value={d.advancedCyber?'Included':null} />
          <SumRow label="BCDR Appliance" value={d.datto?'Datto Siris — included on 36-month term':null} />
          <SumRow label="Cloud Backup" value={d.cloudBackup?'Included':null} />
        </SumSection>
      )}

      {(d.vendors||[]).length>0&&(
        <SumSection title="Project Vendors">
          {(d.vendors||[]).map(v=><SumRow key={v.id} label={v.type||'Vendor'} value={[v.company,v.contact,v.phone].filter(Boolean).join(' · ')||null} />)}
        </SumSection>
      )}

      {/* Meeting notes */}
      <Divider label="Meeting Notes" />
      <Field label="Notes for the client">
        <Textarea value={d.notes||''} onChange={v=>u('notes',v)} rows={3} disabled={!!locked}
          placeholder="Anything discussed that should appear in the client summary or follow-up email…" />
      </Field>
      <Field label="Internal Team Email" hint="Used for the internal summary — add before locking">
        <Input type="email" value={d.internalTeamEmail||''} onChange={v=>u('internalTeamEmail',v)} placeholder="team@32byte.com.au" disabled={!!locked} />
      </Field>

      {/* KQM Links */}
      <Divider label="KQM Quote Links (Internal)" />
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[
          { label:'Solution 1 — Hardware & Infrastructure', url:d.q1url, req:d.q1req },
          { label:'Solution 2 — Telecommunications',        url:d.q2url, req:d.q2req },
          { label:'Solution 3 — Managed Services',          url:d.q3url, req:d.q3req },
        ].filter(q=>q.req!==false).map(({ label, url })=>(
          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:9 }}>
            <span style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>{label}</span>
            {url
              ? <a href={url} target="_blank" rel="noreferrer" style={{ fontSize:12, fontWeight:700, color:C.orange, textDecoration:'none', background:C.orangeLight, padding:'4px 12px', borderRadius:6 }}>Open in KQM ↗</a>
              : <span style={{ fontSize:12, color:C.textMuted, fontStyle:'italic' }}>No URL — add in Solution Setup</span>}
          </div>
        ))}
      </div>

      {/* Lock */}
      {!locked
        ?<button onClick={onLock} style={{ width:'100%', padding:'16px', borderRadius:12, background:C.orange, color:C.white, border:'none', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'Sora,sans-serif', marginTop:8, transition:'background .2s' }} onMouseEnter={e=>e.target.style.background=C.orangeD} onMouseLeave={e=>e.target.style.background=C.orange}>
          🔒 Lock Blueprint
        </button>
        :<div style={{ background:C.greenLight, border:`1.5px solid ${C.greenBorder}`, borderRadius:14, padding:'20px 24px', textAlign:'center', marginTop:8 }}>
          <div style={{ fontSize:30, marginBottom:8 }}>✅</div>
          <p style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17, color:'#065F46', margin:'0 0 4px' }}>Blueprint Locked</p>
          <p style={{ fontSize:13, color:'#047857', margin:'0 0 16px' }}>Locked {new Date(locked).toLocaleString('en-AU',{ dateStyle:'full', timeStyle:'short' })}</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:14 }}>
            <button onClick={()=>setShowEmail(true)} style={{ padding:'13px 24px', borderRadius:10, background:C.orange, color:C.white, border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
              ✉️ Send Client Email
            </button>
            <button onClick={()=>setShowInternal(true)} style={{ padding:'13px 24px', borderRadius:10, background:C.navyMid, color:C.white, border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Sora,sans-serif' }}>
              📋 Send Internal Summary
            </button>
          </div>
          <div style={{ fontSize:13, color:'#047857', fontWeight:600 }}>Then build the three quotes in Kaseya using the KQM Entry Sheet below ↓</div>
        </div>}

      {/* KQM Entry Sheet — internal, collapsible */}
      <div style={{ marginTop:24 }}>
        <button onClick={()=>setShowKqm(v=>!v)} style={{ width:'100%', padding:'11px 16px', borderRadius:10, border:`1.5px solid ${C.border}`, background:C.surface, color:C.textSecondary, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>📋 KQM Entry Sheet (Internal)</span>
          <span style={{ fontSize:11 }}>{showKqm?'Hide ▲':'Show ▼'}</span>
        </button>
        {showKqm&&(
          <div style={{ marginTop:12 }}>
            <InfoBox>Use this checklist when building the quotes in Kaseya. Not shown to the client.</InfoBox>

            {d.q1req !== false && (
              <>
                <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary, marginBottom:8, fontFamily:'Sora,sans-serif' }}>Solution 1 — Hardware & Infrastructure</div>
                {(rooms||[]).map(r=>{
                  const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];
                  return (
                    <KSection key={r.id} title={r.name||'Room'}>
                      <KRow label="Device" value={`${dev.label} × ${n(r.qty)}`} />
                      {dev.gpu!=='None'&&<KRow label="GPU" value={dev.gpu} indent />}
                      {r.database&&<KRow label="RAID Storage" value="2 × NVMe SSD (RAID array)" indent />}
                      {r.monitor&&r.monitor!=='No Monitor'&&<KRow label="Monitor" value={`${r.monitor} × ${n(r.qty)}`} indent />}
                      {r.kbMouse&&<KRow label="Keyboard & Mouse" value={`Logitech MK345 × ${n(r.qty)}`} indent />}
                    </KSection>
                  );
                })}
                <KSection title="Networking">
                  <KRow label="Switch" value={d.switchType||null} />
                  <KRow label="Wi-Fi APs" value={d.wifiAPs?`UniFi U7 Pro × ${d.wifiAPs} (${d.apMount||'TBC'} mount)`:null} />
                  <KRow label="Firewall" value={d.firewall?'Ubiquiti UDM Pro':null} />
                  <KRow label="4G Failover" value={d.failover?'Teltonika TRB140':null} />
                </KSection>
                {d.cameras&&<KSection title="Security Cameras"><KRow label="Cameras" value={`UniFi G5 Turret Ultra × ${d.cameraCount||'?'}`} /><KRow label="NVR Storage" value={d.nvrStorage||null} /></KSection>}
                <KSection title="Microsoft 365">
                  <KRow label="Business Premium" value={d.m365Premium?`× ${d.m365Premium}`:null} />
                  <KRow label="F1" value={d.m365F1?`× ${d.m365F1}`:null} />
                </KSection>
                <KSection title="Professional Services — Q1">
                  <KRow label="Installation" value={`${(n(d.installHours)||psHrs).toFixed(1)} hrs @ $220`} />
                  {d.spSetup&&<KRow label="SharePoint / Intune Setup" value="5 hrs @ $220" />}
                  {d.emailMigration&&<KRow label="Email Migration" value="Included in installation block" />}
                </KSection>
              </>
            )}

            {d.q2req !== false && (
              <>
                <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary, margin:'16px 0 8px', fontFamily:'Sora,sans-serif' }}>Solution 2 — Telecommunications</div>
                <KSection title="NBN & Connectivity">
                  <KRow label="Business NBN" value={d.nbn?(d.nbnTier||'TBC'):null} />
                  <KRow label="NBN Termination" value={d.tenancy==='new'?'$300 passthrough — confirm with NBN co.':null} />
                  <KRow label="4G Backup SIM" value={d.sim4g?'Unlimited Data':null} />
                </KSection>
                <KSection title="VoIP Phone Service">
                  <KRow label="Licences" value={d.voip&&d.voipLicences?`× ${d.voipLicences}`:null} />
                  <KRow label="DDI Lines" value={d.ddiLines?`× ${d.ddiLines}`:null} />
                  <KRow label="Number Porting" value={d.porting?'Yes — coordinate with provider':null} />
                </KSection>
                <KSection title="Hardware">
                  {(d.handsets||[]).filter(h=>n(h.qty)>0).map(h=><KRow key={h.model} label={`${h.model} Handset`} value={`× ${h.qty}${h.notes?` (${h.notes})`:''}` } />)}
                  {(d.headsets||[]).filter(h=>n(h.qty)>0).map(h=><KRow key={h.model} label={`${h.model} Headset`} value={`× ${h.qty}${h.notes?` (${h.notes})`:''}` } />)}
                  {(d.cordless||[]).filter(h=>n(h.qty)>0).map(h=><KRow key={h.model} label={`${h.model} Cordless`} value={`× ${h.qty}${h.notes?` (${h.notes})`:''}` } />)}
                </KSection>
                {telPS>0&&<KSection title="Professional Services — Q2"><KRow label="Phone / Headset Setup" value="2 hrs @ $220" /></KSection>}
              </>
            )}

            {d.q3req !== false && (
              <>
                <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary, margin:'16px 0 8px', fontFamily:'Sora,sans-serif' }}>Solution 3 — Managed Services</div>
                <KSection title="TotalCare MSA">
                  <KRow label="TotalCare" value={endpoints?`${endpoints} device${endpoints!==1?'s':''}`:null} />
                  <KRow label="Advanced Cyber Suite" value={d.advancedCyber?'Included':null} />
                </KSection>
                {(d.datto||d.cloudBackup)&&(
                  <KSection title="Backup & Recovery">
                    <KRow label="Datto Siris BCDR" value={d.datto?'Hardware incl. on 36-month term':null} />
                    <KRow label="Cloud Backup" value={d.cloudBackup?'Included':null} />
                  </KSection>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── App ────────────────────────────────────────────────────────────────────────
const newScanner  = () => ({ id:uid(), model:'', software:'', dedicated:false, database:false, notes:'' });
const newXray     = () => ({ id:uid(), model:'', type:'', software:'', timing:'', dedicated:false, database:false, notes:'' });
const newOtherImg = () => ({ id:uid(), desc:'', notes:'' });

const INIT = {
  practiceName:'', principalDentist:'', suburb:'', state:'', postcode:'', address:'',
  chairs:'', dentists:'', adminStaff:'', otherStaff:'',
  pms:'', pmsOther:'', imagingSw:[], imagingSwOthers:[], practiceType:'new',
  openingDate:'', fitoutDate:'', goLiveDate:'', financeProvider:'', financeOther:'',
  salesRep:'', meetingDate:'', contactName:'', contactEmail:'',
  // Existing IT (for existing sites)
  existingIT:false,
  existingITCompany:'', existingITContact:'', existingITPhone:'', existingITEmail:'',
  existingITExpiry:'', existingITType:'',
  existingITManagesEmail:undefined, existingITManagesPhones:undefined, existingITManagesInternet:undefined,
  existingITManagesDevices:undefined, existingITManagesSecurity:undefined,
  existingITDevices:null, existingITEmail:null, existingITPhones:null, existingITInternet:null, existingITSecurity:null,
  existingITNotes:'',
  vendors:[],
  rooms:[],
  switchType:'', wifiAPs:'', apMount:'', floorPlanImage:null,
  cameras:false, cameraCount:'', nvrStorage:'',
  firewall:true, failover:true,
  m365Premium:'', m365F1:'',
  installHours:'', spSetup:false, emailMigration:false,
  infraNotes:'', server:'cloud',
  // Imaging — now arrays for multiple devices
  intraoralScanners:[], xrayMachines:[], otherImaging:[],
  nbn:true, nbnTier:'', tenancy:'', sim4g:true,
  voip:false, voipLicences:'', ddiLines:'', porting:false,
  handsets: HANDSET_MODELS.map(m=>({ model:m, qty:'', notes:'' })),
  headsets: HEADSET_MODELS.map(m=>({ model:m, qty:'', notes:'' })),
  cordless: CORDLESS_MODELS.map(m=>({ model:m, qty:'', notes:'' })),
  telecomNotes:'',
  endpoints:'', advancedCyber:false, datto:false, cloudBackup:false, additionalSites:'', msaNotes:'',
  // Cyber insurance
  cyberInsurer:'', cyberPolicyNumber:'', cyberExpiry:'',
  // Internal team
  internalTeamEmail:'',
  q1req:false, q2req:false, q3req:false,
  q1url:'', q2url:'', q3url:'', notes:'',
  // Internet
  internetType:'nbn', fibreProvider:'', fibreSpeed:'', customSpeed:'', otherInternetDesc:'', internetExpiry:'',
  // Existing network equipment
  existingNetwork:false, existingSwitchModel:'', existingSwitchVendor:'', existingWifiModel:'', existingWifiVendor:'', existingNetworkNotes:'',
  existingFirewall:false, existingFirewallModel:'', existingFirewallVendor:'',
  existingCameras:false, existingCameraVendor:'', existingCameraCount:'', existingCameraNotes:'', cameraLayoutImage:null,
  // Call flow
  callFlowType:'default', callFlowGreeting:'', callFlowHuntGroup:'', callFlowAfterHours:'', callFlowOverflow:'', callFlowVoicemailEmail:'', callFlowNotes:'',
  existing4G:false, existing4GModel:'', existing4GProvider:'', existing4GManagedBy:'',
  existingM365:false, m365Users:[], m365Tenant:'',
};

const STORAGE_KEY = 'psb_data_v1';
const AUTH_KEY    = 'psb_auth_v1';

// ── Change this to your team password ─────────────────────────────────────────
const APP_PASSWORD = '32byte';

// ── Password Gate ─────────────────────────────────────────────────────────────
const PasswordGate = ({ onAuth }) => {
  const [val,      setVal]      = useState('');
  const [error,    setError]    = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked,   setLocked]   = useState(false);

  const submit = () => {
    if(locked) return;
    if(val === APP_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuth();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setVal('');
      if(next >= 5) {
        setLocked(true);
        setError('Too many incorrect attempts. Close and reopen the tab to try again.');
      } else {
        setError(`Incorrect password. ${5 - next} attempt${5-next!==1?'s':''} remaining.`);
      }
    }
  };

  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.bg, fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:400, padding:'0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:60, height:60, borderRadius:14, background:C.orange, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 24px rgba(249,115,22,.35)' }}>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:C.white }}>32</span>
          </div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:C.textPrimary, marginBottom:4 }}>32 Byte</div>
          <div style={{ fontSize:13, color:C.textMuted, letterSpacing:'.08em', textTransform:'uppercase', fontWeight:600 }}>Practice Success Blueprint</div>
        </div>

        {/* Card */}
        <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:16, padding:'32px 28px' }}>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:18, color:C.textPrimary, marginBottom:6 }}>Staff Access Only</div>
          <div style={{ fontSize:14, color:C.textSecondary, marginBottom:24, lineHeight:1.6 }}>This tool is for internal use. Enter the team password to continue.</div>

          <label style={{ display:'block', fontWeight:600, fontSize:11, color:C.textSecondary, marginBottom:6, letterSpacing:'.06em', textTransform:'uppercase' }}>Password</label>
          <input
            type="password"
            value={val}
            disabled={locked}
            placeholder="Enter password…"
            onChange={e=>{ setVal(e.target.value); setError(''); }}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            style={{ width:'100%', padding:'12px 14px', fontSize:15, border:`1.5px solid ${error?C.red:C.border}`, borderRadius:9, background:C.surfaceHi, color:C.textPrimary, fontFamily:'inherit', marginBottom:14, outline:'none', transition:'border-color .15s' }}
            autoFocus
          />

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 13px', background:'rgba(239,68,68,.1)', border:`1px solid rgba(239,68,68,.3)`, borderRadius:8, marginBottom:14 }}>
              <span style={{ fontSize:14 }}>⚠️</span>
              <span style={{ fontSize:13, color:'#FCA5A5' }}>{error}</span>
            </div>
          )}

          <button
            onClick={submit}
            disabled={locked||!val}
            style={{ width:'100%', padding:'13px', borderRadius:10, background:locked||!val?C.surfaceHi:C.orange, color:locked||!val?C.textMuted:C.white, border:'none', fontSize:15, fontWeight:700, cursor:locked||!val?'default':'pointer', fontFamily:'Sora,sans-serif', transition:'background .15s' }}>
            {locked ? 'Access Locked' : 'Access Blueprint'}
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop:20, fontSize:12, color:C.textMuted }}>
          Session clears automatically when you close the tab.
        </div>
      </div>
    </div>
  );
};

function App() {
  const [step,   setStep]   = useState(0);
  const [locked, setLocked] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [d, setD] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved) { const p = JSON.parse(saved); return {...INIT, ...p}; }
    } catch(e) {}
    return INIT;
  });
  const u = (k,v) => setD(p => {
    const next = {...p,[k]:v};
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch(e) {}
    return next;
  });

  const exportData = () => {
    const blob = new Blob([JSON.stringify(d, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `blueprint-${d.practiceName||'draft'}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setSaveMsg('Exported!'); setTimeout(()=>setSaveMsg(''),2000);
  };

  const importData = (e) => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        setD({...INIT, ...imported});
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({...INIT,...imported})); } catch(e) {}
        setSaveMsg('Imported!'); setTimeout(()=>setSaveMsg(''),2000);
      } catch(e) { alert('Invalid file — could not import.'); }
    };
    r.readAsText(f);
  };

  const clearData = () => {
    if(!window.confirm('Start over? This will clear ALL data including rooms, vendors, imaging and settings. This cannot be undone.\n\nTip: Export first if you want to keep a copy.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setD(INIT); setLocked(null); setStep(0);
  };

  const goStep = (i) => {
    setStep(i);
    setMobileNav(false);
    document.getElementById('psb-main')?.scrollTo(0, 0);
  };

  const shortDate = s => s ? new Date(s+'T00:00:00').toLocaleDateString('en-AU',{ day:'numeric', month:'short', year:'numeric' }) : null;

  const phases = [
    <Phase0 d={d} u={u} />,
    <Phase1 d={d} u={u} />,
    <Phase2 d={d} u={u} />,
    <Phase3 d={d} u={u} />,
    <Phase4 d={d} u={u} />,
    <Phase5 d={d} u={u} rooms={d.rooms} />,
    <Phase6 d={d} u={u} locked={locked} onLock={()=>setLocked(new Date().toISOString())} rooms={d.rooms} />,
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%}
        body{font-family:'DM Sans',sans-serif;background:#111827}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px}
        input[type=number]::-webkit-inner-spin-button{opacity:.4}
        button:focus{outline:none}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.25)}
        select option{background:#1F2937;color:#F9FAFB}
        /* Mobile responsive overrides */
        @media(max-width:768px){
          .psb-layout{flex-direction:column!important}
          .psb-sidebar{display:none!important;width:100%!important;height:auto!important;position:fixed!important;inset:0!important;z-index:50!important;overflow-y:auto!important}
          .psb-sidebar.open{display:flex!important}
          .psb-topbar{display:flex!important}
          .psb-main-content{padding:20px 16px 140px!important}
          .psb-nav-bar{padding:10px 16px!important}
          .psb-nav-label{display:none!important}
          .psb-row-2,.psb-row-3,.psb-row-4{grid-template-columns:1fr!important}
          .psb-pick-group{flex-wrap:wrap!important}
          .psb-pick-group button{min-width:calc(50% - 4px)!important;flex:none!important}
          .psb-phase-title{font-size:22px!important}
          .psb-hero-name{font-size:20px!important}
        }
        @media(min-width:769px){
          .psb-topbar{display:none!important}
          .psb-sidebar-overlay{display:none!important}
        }
      `}</style>

      {/* Mobile top bar */}
      <div className="psb-topbar" style={{ display:'none', position:'fixed', top:0, left:0, right:0, zIndex:40, background:C.navy, borderBottom:'1px solid rgba(255,255,255,.07)', padding:'0 16px', height:56, alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:7, background:C.orange, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:13, color:C.white }}>32</span>
          </div>
          <div>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:13, color:C.white, lineHeight:1.2 }}>
              {d.practiceName || 'Practice Blueprint'}
            </div>
            <div style={{ fontSize:10, color:C.orange, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>
              {STEPS[step]?.label}
            </div>
          </div>
        </div>
        <button onClick={()=>setMobileNav(v=>!v)} style={{ background:'none', border:`1.5px solid rgba(255,255,255,.1)`, borderRadius:8, padding:'6px 10px', cursor:'pointer', color:C.textPrimary, fontSize:18, lineHeight:1 }}>
          ☰
        </button>
      </div>

      {/* Mobile sidebar overlay backdrop */}
      {mobileNav && (
        <div className="psb-sidebar-overlay" onClick={()=>setMobileNav(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:49 }} />
      )}

      <div className="psb-layout" style={{ display:'flex', height:'100vh', paddingTop:0 }}>

        {/* Sidebar */}
        <div className={`psb-sidebar${mobileNav?' open':''}`}
          style={{ width:258, background:C.navy, display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }}>

          {/* Mobile close button */}
          <div style={{ display:'none' }} className="psb-mobile-only">
            <button onClick={()=>setMobileNav(false)} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:C.textMuted, fontSize:22, cursor:'pointer', zIndex:51 }}>✕</button>
          </div>

          <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:C.orange, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:14, color:C.white }}>32</span>
              </div>
              <div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, color:C.white, lineHeight:1.2 }}>32 Byte</div>
                <div style={{ fontSize:11, color:'#475569' }}>Dental IT Specialists</div>
              </div>
            </div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', color:C.orange, textTransform:'uppercase', marginBottom:10 }}>Practice Success Blueprint</div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={exportData} title="Export to file" style={{ flex:1, padding:'6px 4px', borderRadius:6, border:`1px solid rgba(255,255,255,.1)`, background:'rgba(255,255,255,.06)', color:C.textSecondary, fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                {saveMsg==='Exported!'?'✓ Saved':'⬇ Export'}
              </button>
              <label title="Import from file" style={{ flex:1, padding:'6px 4px', borderRadius:6, border:`1px solid rgba(255,255,255,.1)`, background:'rgba(255,255,255,.06)', color:C.textSecondary, fontSize:10, fontWeight:600, cursor:'pointer', textAlign:'center', display:'block' }}>
                {saveMsg==='Imported!'?'✓ Loaded':'⬆ Import'}
                <input type="file" accept=".json" style={{ display:'none' }} onChange={importData} />
              </label>
              <button onClick={clearData} title="Start over — clear all data" style={{ padding:'6px 8px', borderRadius:6, border:`1px solid rgba(239,68,68,.3)`, background:'rgba(239,68,68,.1)', color:'#EF4444', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                🗑 Start Over
              </button>
            </div>
            {d.practiceName && <div style={{ marginTop:6, fontSize:10, color:'rgba(255,255,255,.25)', fontStyle:'italic' }}>Auto-saved locally</div>}
          </div>

          <div style={{ padding:'10px 0', flex:1 }}>
            {STEPS.map((s,i)=>{
              const isA=step===i, isDone=locked?true:step>i;
              const vendorsInScope = d.q1req !== false || d.practiceType === 'new';
              const scopeMap = { 2:vendorsInScope, 3:d.q1req, 4:d.q2req, 5:d.q3req };
              const outOfScope = scopeMap[i] === false;
              return (
                <button key={i} onClick={()=>!locked&&goStep(i)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 20px', background:isA?'rgba(249,115,22,.1)':'transparent', border:'none', borderLeft:`3px solid ${isA?C.orange:'transparent'}`, cursor:locked?'default':'pointer', textAlign:'left', transition:'all .15s', opacity:outOfScope?.38:1 }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:isDone&&!isA?C.orange:isA?'rgba(249,115,22,.2)':'rgba(255,255,255,.05)' }}>
                    {outOfScope
                      ? <span style={{ fontSize:11, color:'#64748B', fontWeight:700 }}>—</span>
                      : isDone&&!isA
                        ? <span style={{ fontSize:11, color:C.white, fontWeight:700 }}>✓</span>
                        : <span style={{ fontSize:11, fontWeight:700, color:isA?C.orange:'#3D506B' }}>{i+1}</span>}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:isA?C.white:outOfScope?'#3D506B':isDone?'#64748B':'#94A3B8', fontFamily:'Sora,sans-serif', lineHeight:1.3, textDecoration:outOfScope?'line-through':'none' }}>{s.label}</div>
                    <div style={{ fontSize:11, color:isA?'#FED7AA':isDone?'#475569':'#64748B', marginTop:1 }}>{outOfScope?'Not in scope':s.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {d.practiceName&&(
            <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>Current Practice</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.white, marginBottom:2 }}>{d.practiceName}</div>
              {d.openingDate&&<div style={{ fontSize:12, color:C.orange, fontWeight:600 }}>Opens {shortDate(d.openingDate)}</div>}
              {locked&&<div style={{ marginTop:5, fontSize:11, color:C.green, fontWeight:700 }}>● Blueprint locked</div>}
            </div>
          )}
        </div>

        {/* Main */}
        <div id="psb-main" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', background:C.bg, paddingTop:0 }}
          ref={el => { if(el) el._mainRef = true; }}>
          <div className="psb-main-content" style={{ maxWidth:740, margin:'0 auto', padding:'40px 40px 120px', width:'100%' }}>
            {/* Mobile top spacer */}
            <div className="psb-mobile-spacer" style={{ height:0 }} />
            {phases[step]}
          </div>
          {!locked&&(
            <div className="psb-nav-bar" style={{ position:'sticky', bottom:0, background:'rgba(17,24,39,.97)', backdropFilter:'blur(10px)', borderTop:`1px solid ${C.border}`, padding:'13px 40px' }}>
              <div style={{ maxWidth:740, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="psb-nav-label" style={{ fontSize:13, color:C.textMuted }}>{step<6?`Step ${step+1} of ${STEPS.length} · Next: ${STEPS[step+1]?.label}`:'Final step — review & lock'}</span>
                <div style={{ display:'flex', gap:10, width:'100%', justifyContent:'space-between' }}>
                  {step>0
                    ? <button onClick={()=>goStep(step-1)} style={{ flex:1, padding:'12px 22px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>← Back</button>
                    : <div/>}
                  {step<STEPS.length-1&&<button onClick={()=>goStep(step+1)} style={{ flex:2, padding:'12px 26px', borderRadius:10, border:'none', background:C.orange, color:C.white, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Sora,sans-serif', transition:'background .2s' }}>Next →</button>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .psb-topbar{display:flex!important}
          .psb-layout{padding-top:56px!important}
          .psb-main-content{padding:20px 16px 140px!important}
          .psb-nav-bar{padding:10px 16px!important}
          .psb-nav-label{display:none!important}
        }
      `}</style>
    </>
  );
}

// ── Root — keeps auth state isolated from App so password → app transition works ─
export default function Root() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  return <App />;
}
