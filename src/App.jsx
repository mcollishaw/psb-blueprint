import { useState, useRef } from "react";

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
  { v:'practice', label:'General Computer',             sub:'No GPU · Reception, admin, general use',           gpu:'None',         imaging:false },
];

const uid = () => Math.random().toString(36).slice(2,8);

// ── CPU release year lookup ────────────────────────────────────────────────────
const guessCpuYear = (cpu) => {
  if(!cpu) return null;
  const c = cpu.toUpperCase();
  const now = new Date().getFullYear();

  // Intel Core Ultra (Arrow Lake / Meteor Lake) — 2023-2024
  if(c.includes('ULTRA')) return 2024;

  // Intel Core i-series — extract generation from model number
  // Pattern: i3/i5/i7/i9-XXXXX where first 2 digits = generation (>9) or 1 digit (<=9)
  // i7-870, i5-760 etc = gen 1 (3-digit, no dash generation prefix)
  const intelMatch1 = c.match(/I[3579]-?(\d{3})[A-Z\s]/);
  if(intelMatch1) return 2009; // Gen 1 Nehalem/Westmere era

  const intelMatch = c.match(/I[3579]-(\d{4,5})/);
  if(intelMatch) {
    const num = intelMatch[1];
    const gen = num.length === 5 ? parseInt(num.slice(0,2)) : parseInt(num.slice(0,1));
    const genYears = {1:2009,2:2011,3:2012,4:2013,5:2015,6:2015,7:2017,8:2018,9:2019,10:2020,11:2021,12:2022,13:2023,14:2024};
    if(genYears[gen]) return genYears[gen];
  }

  // Intel 11th/12th/13th/14th gen text form
  if(c.includes('14TH GEN')) return 2024;
  if(c.includes('13TH GEN')) return 2023;
  if(c.includes('12TH GEN')) return 2022;
  if(c.includes('11TH GEN')) return 2021;
  if(c.includes('10TH GEN')) return 2020;

  // Intel Xeon
  if(c.includes('XEON')) {
    if(c.match(/W-2[0-9]{3}/)||c.match(/SILVER 4[12]/)) return 2019;
    if(c.match(/E5-2[0-9]{3}/)) return 2013;
    if(c.match(/E-2[0-9]{3}/)) return 2018;
    if(c.match(/SILVER 42[0-9]{2}/)) return 2020;
    return 2016;
  }

  // Intel Celeron / Pentium
  if(c.includes('J4125')||c.includes('J4105')) return 2019;
  if(c.includes('J6412')||c.includes('J6413')) return 2021;

  // AMD Ryzen — extract series number
  const amdMatch = c.match(/RYZEN\s+[357\s]+(\d)(\d{3})/);
  if(amdMatch) {
    const series = parseInt(amdMatch[1]);
    const amdYears = {1:2017,2:2018,3:2019,4:2020,5:2020,6:2022,7:2022,8:2023,9:2024};
    if(amdYears[series]) return amdYears[series];
  }
  // AMD Ryzen AI / 9000 series
  if(c.includes('RYZEN AI')||c.match(/RYZEN\s+[357]\s+9\d{3}/)) return 2024;

  return null;
};

const cpuAgeYears = (cpu) => {
  const yr = guessCpuYear(cpu);
  if(!yr) return null;
  return new Date().getFullYear() - yr;
};

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
  <div style={{ display:'flex', alignItems:'center', gap:10, margin:'28px 0 18px' }}>
    <div style={{ height:1, flex:1, background:'rgba(255,255,255,.12)' }}/>
    <span style={{ fontSize:11, fontWeight:800, color:'#94A3B8', letterSpacing:'.1em', textTransform:'uppercase', whiteSpace:'nowrap', background:C.bg, padding:'0 4px' }}>{label}</span>
    <div style={{ height:1, flex:1, background:'rgba(255,255,255,.12)' }}/>
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

// Calendar-only date picker — large clickable button that opens native date picker
const DatePicker = ({ value, onChange, placeholder='Select date…' }) => {
  const ref = useRef(null);
  const fmt = s => s ? new Date(s+'T00:00:00').toLocaleDateString('en-AU',{ weekday:'short', day:'numeric', month:'short', year:'numeric' }) : '';
  const open = () => {
    if(ref.current) {
      try { ref.current.showPicker(); } catch(e) { ref.current.focus(); ref.current.click(); }
    }
  };
  return (
    <div style={{ position:'relative' }}>
      <button type="button" onClick={open}
        style={{ width:'100%', padding:'12px 16px', fontSize:14, border:`1.5px solid ${value?C.orange:C.border}`, borderRadius:9, background:C.surfaceHi, color:value?C.textPrimary:'rgba(255,255,255,.3)', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'inherit' }}>
        <span>{value ? fmt(value) : placeholder}</span>
        <span style={{fontSize:20,lineHeight:1}}>📅</span>
      </button>
      <input ref={ref} type="date" value={value||''} onChange={e=>onChange(e.target.value)}
        style={{ position:'absolute', opacity:0, width:'1px', height:'1px', top:0, left:0, pointerEvents:'none' }} />
      {value && <button type="button" onClick={()=>onChange('')} style={{position:'absolute',right:44,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,.3)',cursor:'pointer',fontSize:16,padding:'0 4px'}}>×</button>}
    </div>
  );
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
            <span style={{ fontSize:14, color:checked?C.orange:'#94A3B8', fontWeight:checked?700:400 }}>{o}</span>
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

// Hardware quantity row with model and optional per-device fields
const HwRow = ({ label, model, qty, onQty, notes, onNotes, showNotes, devices, onDevices, showDeviceFields, existingQty, onExistingQty, existingDevices, onExistingDevices }) => {
  const count = n(qty);
  const exCount = n(existingQty);
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ flex:1, fontSize:14, color:C.textPrimary, fontWeight:500 }}>{label}</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:C.textMuted, whiteSpace:'nowrap' }}>New:</span>
          <div style={{ width:70 }}><Num value={qty||''} onChange={onQty} /></div>
          <span style={{ fontSize:11, color:C.textMuted, whiteSpace:'nowrap' }}>Existing:</span>
          <div style={{ width:70 }}><Num value={existingQty||''} onChange={onExistingQty} /></div>
        </div>
        {showNotes && count>0 && (
          <div style={{ flex:1 }}>
            <Input value={notes||''} onChange={onNotes} placeholder="Describe model / notes…" />
          </div>
        )}
      </div>
      {showDeviceFields && exCount>0 && Array.from({length:exCount}).map((_,i)=>{
        const dev = (existingDevices||[])[i]||{};
        return (
          <div key={`ex-${i}`} style={{marginLeft:10,padding:'8px 12px',background:'rgba(100,116,139,.1)',borderRadius:8,marginBottom:6,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Existing {label} {exCount>1?i+1:''}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:6}}>
              <Input value={dev.location||''} onChange={v=>{const arr=[...(existingDevices||[])];arr[i]={...arr[i],location:v};onExistingDevices(arr);}} placeholder="Location / room" />
              <Input value={dev.extension||''} onChange={v=>{const arr=[...(existingDevices||[])];arr[i]={...arr[i],extension:v};onExistingDevices(arr);}} placeholder="Extension number" />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <Input value={dev.username||''} onChange={v=>{const arr=[...(existingDevices||[])];arr[i]={...arr[i],username:v};onExistingDevices(arr);}} placeholder="Username / display name" />
              <Input value={dev.mac||''} onChange={v=>{const arr=[...(existingDevices||[])];arr[i]={...arr[i],mac:v};onExistingDevices(arr);}} placeholder="MAC address (required)" style={{borderColor: !dev.mac ? C.amber : C.border}} />
            </div>
          </div>
        );
      })}
      {showDeviceFields && count>0 && Array.from({length:count}).map((_,i)=>{
        const dev = (devices||[])[i]||{};
        return (
          <div key={i} style={{marginLeft:10,padding:'8px 12px',background:C.surfaceHi,borderRadius:8,marginBottom:6,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>{label} {count>1?i+1:''} — New</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:6}}>
              <Input value={dev.location||''} onChange={v=>{const arr=[...(devices||[])];arr[i]={...arr[i],location:v};onDevices(arr);}} placeholder="Location / room" />
              <Input value={dev.extension||''} onChange={v=>{const arr=[...(devices||[])];arr[i]={...arr[i],extension:v};onDevices(arr);}} placeholder="Extension number" />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <Input value={dev.username||''} onChange={v=>{const arr=[...(devices||[])];arr[i]={...arr[i],username:v};onDevices(arr);}} placeholder="Username / display name" />
              <Input value={dev.mac||''} onChange={v=>{const arr=[...(devices||[])];arr[i]={...arr[i],mac:v};onDevices(arr);}} placeholder="MAC address (optional)" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
      <Field label="Meeting Date"><DatePicker value={d.meetingDate||''} onChange={v=>u('meetingDate',v)} /></Field>
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
            <DatePicker value={d.openingDate||''} onChange={v=>u('openingDate',v)} />
          </Field>
          <Field label="Fitout Completion (estimated)">
            <DatePicker value={d.fitoutDate||''} onChange={v=>u('fitoutDate',v)} />
          </Field>
        </Row>
      ) : (
        <Field label="Go-Live Date" required hint="The date 32 Byte takes over support and management.">
          <DatePicker value={d.goLiveDate||''} onChange={v=>u('goLiveDate',v)} />
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
                <DatePicker value={d.existingITExpiry||''} onChange={v=>u('existingITExpiry',v)} />
              </Field>
              <Field label="What does the current provider manage?" hint="All items default to yes — toggle off if they don't manage that item. Use the takeover toggle to flag services 32 Byte will take over.">
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:4 }}>
                  {[
                    {k:'existingITManagesDevices',  pk:'existingITDevices',  tk:'takeoverDevices',  l:'Devices (computers, servers)', hint:'Current RMM, AV, endpoint management'},
                    {k:'existingITManagesEmail',     pk:'existingITEmail',    tk:'takeoverEmail',    l:'Email (Microsoft 365 / Google)', hint:'Tenant name, current licences, migration needed?'},
                    {k:'existingITManagesPhones',    pk:'existingITPhones',   tk:'takeoverPhones',   l:'Phone system', hint:'Current provider, DDI numbers, contract expiry'},
                    {k:'existingITManagesInternet',  pk:'existingITInternet', tk:'takeoverInternet', l:'Internet / NBN', hint:'ISP, speed tier, contract expiry, IP addresses'},
                    {k:'existingITManagesSecurity',  pk:'existingITSecurity', tk:'takeoverSecurity', l:'Security (AV, patching, monitoring)', hint:'Current AV/EDR vendor, licence count'},
                  ].map(({k,pk,tk,l,hint})=>(
                    <div key={k}>
                      <Toggle checked={d[k]!==false} onChange={v=>u(k,v)} label={l} sub={d[k]!==false?'Managed by existing IT provider':'Not managed by existing IT — capture responsible party below'} />
                      {d[k]===false && (
                        <div style={{ marginLeft:54, marginTop:10, padding:'12px 14px', background:C.surfaceHi, borderRadius:9, border:`1.5px solid ${C.border}` }}>
                          <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Who manages {l.toLowerCase()}?</div>
                          <Row>
                            <Field label="Company" tight><Input value={(d[pk]||{}).company||''} onChange={v=>u(pk,{...(d[pk]||{}),company:v})} placeholder="Provider / company name" /></Field>
                            <Field label="Contact" tight><Input value={(d[pk]||{}).contact||''} onChange={v=>u(pk,{...(d[pk]||{}),contact:v})} placeholder="Contact name" /></Field>
                          </Row>
                          <Row>
                            <Field label="Phone" tight><Input value={(d[pk]||{}).phone||''} onChange={v=>u(pk,{...(d[pk]||{}),phone:v})} placeholder="Phone" /></Field>
                            <Field label="Email" tight><Input type="email" value={(d[pk]||{}).email||''} onChange={v=>u(pk,{...(d[pk]||{}),email:v})} placeholder="email@provider.com" /></Field>
                          </Row>
                          {hint&&<div style={{fontSize:11,color:'#64748B',marginTop:6,lineHeight:1.5}}>📋 Capture: {hint}</div>}
                        </div>
                      )}
                      <div style={{marginLeft:54,marginTop:4}}>
                        <Toggle checked={!!d[tk]} onChange={v=>u(tk,v)}
                          label="32 Byte to take over this service"
                          sub={d[tk]?'Will migrate to 32 Byte — include in scope & quote':'Staying with current provider — exclude from scope'} />
                      </div>
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
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');
  const [importCompanies, setImportCompanies] = useState([]);
  const [importCompany, setImportCompany] = useState('');
  const [importAllRows, setImportAllRows] = useState([]);
  const [importSearch, setImportSearch] = useState('');

  const addR  = () => u('rooms',[...rooms,{ id:uid(), name:'', deviceType:'practice', qty:1, monitor:'No Monitor', kbMouse:false, database:false, notes:'', existingPC:false, pcAge:'', pcBrand:'', pcCondition:'Functional', pcNotes:'' }]);
  const updR  = (id,k,v) => u('rooms', rooms.map(x=>x.id===id?{...x,[k]:v}:x));
  const delR  = id => u('rooms', rooms.filter(x=>x.id!==id));
  const totalD = rooms.reduce((a,r)=>a+n(r.qty),0);
  const newDevices = rooms.filter(r=>!r.existingPC || r.replacePC).reduce((a,r)=>a+n(r.qty),0);
  const networkingHrs = (d.switchType||d.wifiAPs||d.firewall||d.failover) ? 2 : 0;
  const cameraHrs = d.cameras ? (n(d.cameraCount)*0.25) : 0;
  const totalHandsets = (d.handsets||[]).reduce((a,h)=>a+n(h.qty),0) + (d.cordless||[]).reduce((a,h)=>a+n(h.qty),0);
  const phoneHrs = totalHandsets > 0 ? 2 + Math.max(0, totalHandsets-4) * 0.25 : 0;
  const psHrs  = (newDevices * 2.5) + networkingHrs + cameraHrs;
  const notReq = d.q1req === false;

  // Parse Datto RMM CSV or ScreenConnect JSON
  const parseImport = (text) => {
    setImportError('');
    setImportCompany('');
    setImportCompanies([]);
    setImportAllRows([]);
    setImportPreview([]);

    if(!text.trim()) return;

    // Detect CSV (has header row with commas)
    if(text.includes('GuestOperatingSystemName') || text.includes('CustomProperty1')) {
      // Datto RMM CSV
      try {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h=>h.replace(/"/g,'').trim());
        const rows = lines.slice(1).filter(l=>l.trim()).map(line=>{
          // Handle quoted CSV values
          const vals = []; let cur = ''; let inQ = false;
          for(let i=0;i<line.length;i++){
            if(line[i]==='"'){inQ=!inQ;}
            else if(line[i]===','&&!inQ){vals.push(cur.trim());cur='';}
            else cur+=line[i];
          }
          vals.push(cur.trim());
          const obj = {};
          headers.forEach((h,i)=>{ obj[h]=vals[i]||''; });
          return obj;
        });
        const companies = [...new Set(rows.map(r=>r['CustomProperty1']||'').filter(Boolean))].sort();
        setImportAllRows(rows);
        setImportCompanies(companies);
        if(companies.length===1) { setImportCompany(companies[0]); buildPreviewFromCSV(rows, companies[0]); }
      } catch(e) {
        setImportError('Could not parse CSV. Make sure you copied the full file content.');
      }
      return;
    }

    // ScreenConnect JSON (one JSON object per line)
    const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
    const parsed = [];
    for(const line of lines){
      try { parsed.push(JSON.parse(line)); } catch(e) {}
    }
    if(!parsed.length){ setImportError('No valid data found. Paste the JSON output from ScreenConnect Run Command, or a Datto RMM CSV export.'); return; }
    setImportPreview(parsed.map(obj=>({
      name: obj.Name||obj.name||obj.ComputerName||'Unknown',
      cpu:  obj.CPU||obj.cpu||obj.Processor||'',
      ram:  obj.RAM||obj.ram||'',
      storage: obj.Storage||obj.storage||'',
      gpu:  obj.GPU||obj.gpu||'',
      os:   obj.OS||obj.os||'',
      model:'',
    })));
  };

  const buildPreviewFromCSV = (rows, company) => {
    const filtered = rows.filter(r=>(r['CustomProperty1']||'')=== company);
    setImportPreview(filtered.map(r=>({
      name:    r['Name']||r['GuestMachineName']||'Unknown',
      cpu:     r['GuestProcessorName']||'',
      ram:     r['GuestSystemMemoryTotalMegabytes'] ? Math.round(parseInt(r['GuestSystemMemoryTotalMegabytes'])/1024)+'GB' : '',
      storage: '',
      gpu:     '',
      os:      r['GuestOperatingSystemName']||'',
      model:   r['GuestMachineModel']||'',
      serial:  r['GuestMachineSerialNumber']||'',
    })));
  };

  const confirmImport = () => {
    const newRooms = importPreview.map(dev => {
      const hasGpu = dev.gpu && dev.gpu !== 'None' && dev.gpu !== '';
      const gpuUp = (dev.gpu||'').toUpperCase();
      let deviceType = 'practice';
      if(gpuUp.includes('A2000')||gpuUp.includes('PRO 2000')) deviceType = 'iw-high';
      else if(gpuUp.includes('A1000')||gpuUp.includes('PRO 1000')) deviceType = 'iw-mid';
      else if(gpuUp.includes('A400')) deviceType = 'iw-entry';
      else if(gpuUp.includes('RTX')||gpuUp.includes('QUADRO')||gpuUp.includes('NVIDIA')) deviceType = 'iw-mid';
      // Clean up CPU string
      const cpuClean = (dev.cpu||'').replace(/Intel\(R\)|Core\(TM\)|CPU|AMD|@/g,'').replace(/\s+/g,' ').trim();
      return {
        id: uid(),
        name: '',
        deviceName: dev.name,
        deviceType,
        qty: 1,
        monitor: 'No Monitor',
        kbMouse: false,
        database: false,
        notes: [dev.serial?`S/N: ${dev.serial}`:''].filter(Boolean).join(' | '),
        existingPC: true,
        pcBrand: dev.model || dev.name,
        pcAge: '',
        pcCondition: 'Functional',
        pcNotes: '',
        pcCpu: cpuClean,
        pcAge: cpuAgeYears(cpuClean)?.toString() || '',
        pcRam: (() => {
          const r = (dev.ram||'').replace(/GB/i,'').trim();
          const gb = parseInt(r);
          if(!gb) return '';
          const opts = ['4 GB','8 GB','16 GB','32 GB','64 GB'];
          return opts.find(o=>parseInt(o)===gb) || (gb+' GB');
        })(),
        pcStorage: dev.storage || '',
        pcHasGpu: hasGpu,
        pcGpuModel: hasGpu ? dev.gpu : '',
        pcOs: (() => {
          const os = (dev.os||'').toLowerCase();
          if(os.includes('windows 11 pro')) return 'Windows 11 Pro';
          if(os.includes('windows 11 business')) return 'Windows 11 Business';
          if(os.includes('windows 11 home')) return 'Windows 11 Home';
          if(os.includes('windows 11')) return 'Windows 11 Pro';
          if(os.includes('windows 10 pro')) return 'Windows 10 Pro';
          if(os.includes('windows 10 business')) return 'Windows 10 Business';
          if(os.includes('windows 10')) return 'Windows 10 Pro';
          if(os.includes('server 2022')) return 'Windows Server 2022';
          if(os.includes('server 2019')) return 'Windows Server 2019';
          if(os.includes('server 2016')) return 'Windows Server 2016';
          if(os.includes('mac')) return 'macOS';
          return '';
        })(),
      };
    });
    u('rooms', [...rooms, ...newRooms]);
    setShowImport(false);
    setImportText(''); setImportPreview([]); setImportCompanies([]);
    setImportCompany(''); setImportAllRows([]); setImportSearch('');
  };

  return (
    <div>
      {/* ScreenConnect Import Modal */}
      {showImport && (
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20}}>
          <div style={{background:C.surface,borderRadius:16,width:'100%',maxWidth:680,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 25px 60px rgba(0,0,0,.4)'}}>
            <div style={{padding:'20px 24px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:18,color:C.textPrimary}}>Import from ScreenConnect</div>
                <div style={{fontSize:13,color:C.textSecondary,marginTop:2}}>Paste the PowerShell output from Run Command</div>
              </div>
              <button onClick={()=>{setShowImport(false);setImportText('');setImportPreview([]);setImportError('');setImportCompanies([]);setImportCompany('');setImportAllRows([]);}} style={{background:'none',border:'none',fontSize:20,color:C.textMuted,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>

              {/* Two input methods */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                {/* Datto RMM CSV */}
                <div style={{background:C.navy,borderRadius:10,padding:'14px 16px'}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>ScreenConnect CSV Export</div>
                  <div style={{fontSize:12,color:C.textSecondary,lineHeight:1.7,marginBottom:12}}>
                    In ScreenConnect → select all machines → <strong style={{color:C.textPrimary}}>More → Export CSV</strong>. Upload the whole file and pick the client below.
                  </div>
                  <label style={{display:'block',padding:'9px 14px',borderRadius:8,border:`2px dashed ${C.border}`,background:C.surfaceHi,color:C.orange,fontWeight:700,fontSize:13,cursor:'pointer',textAlign:'center'}}>
                    📂 Upload CSV
                    <input type="file" accept=".csv,.txt" style={{display:'none'}} onChange={e=>{
                      const f=e.target.files[0]; if(!f) return;
                      const r=new FileReader(); r.onload=ev=>{setImportText(ev.target.result);parseImport(ev.target.result);}; r.readAsText(f);
                    }} />
                  </label>
                  {importText && importCompanies.length>0 && (
                    <div style={{marginTop:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.textSecondary,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>{importCompanies.length} clients found — select one:</div>
                      <input
                        type="text"
                        placeholder="Search clients…"
                        onChange={e=>setImportSearch(e.target.value||'')}
                        style={{width:'100%',padding:'7px 10px',fontSize:12,border:`1.5px solid ${C.border}`,borderRadius:7,background:C.surfaceHi,color:C.textPrimary,marginBottom:6,outline:'none'}}
                      />
                      <div style={{maxHeight:160,overflowY:'auto',display:'flex',flexDirection:'column',gap:4}}>
                        {importCompanies.filter(c=>!importSearch||c.toLowerCase().includes(importSearch.toLowerCase())).map(c=>(
                          <button key={c} onClick={()=>{setImportCompany(c);buildPreviewFromCSV(importAllRows,c);}}
                            style={{padding:'7px 10px',borderRadius:7,border:`1.5px solid ${importCompany===c?C.orange:C.border}`,background:importCompany===c?C.orangeLight:C.surface,color:importCompany===c?C.orange:C.textSecondary,fontSize:12,fontWeight:importCompany===c?700:400,cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ScreenConnect JSON */}
                <div style={{background:C.navy,borderRadius:10,padding:'14px 16px'}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>ScreenConnect</div>
                  <div style={{fontSize:12,color:C.textSecondary,lineHeight:1.7,marginBottom:8}}>
                    Select machines → <strong style={{color:C.textPrimary}}>Run Command</strong> → paste and run:
                  </div>
                  <div style={{background:'rgba(0,0,0,.5)',borderRadius:7,padding:'8px 10px',fontFamily:'monospace',fontSize:10,color:'#93C5FD',lineHeight:1.5,wordBreak:'break-all',marginBottom:10,userSelect:'all'}}>
                    {'$g=(Get-WmiObject Win32_VideoController|Where{$_.Name -notlike \'*Basic*\'-and$_.Name -notlike \'*Microsoft*\'}|Select -First 1).Name;[PSCustomObject]@{Name=$env:COMPUTERNAME;CPU=(Get-WmiObject Win32_Processor|Select -First 1).Name;RAM=[math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory/1GB).ToString()+\'GB\';Storage=([math]::Round((Get-WmiObject Win32_LogicalDisk -Filter "DeviceID=\'C:\'"| Select -First 1).Size/1GB)).ToString()+\'GB\';GPU=if($g){$g}else{\'None\'};OS=(Get-WmiObject Win32_OperatingSystem).Caption}|ConvertTo-Json -Compress'}
                  </div>
                  <textarea
                    value={importCompanies.length>0?'':importText}
                    onChange={e=>{setImportText(e.target.value);parseImport(e.target.value);}}
                    placeholder={'Paste JSON output here…\n{"Name":"SURGERY1","CPU":"Intel i7","RAM":"16GB",...}'}
                    style={{width:'100%',padding:'8px 10px',fontSize:12,borderRadius:7,border:`1.5px solid ${C.border}`,background:C.surfaceHi,color:C.textPrimary,fontFamily:'monospace',resize:'vertical',minHeight:80,outline:'none'}}
                  />
                </div>
              </div>

              {importError && <InfoBox type="alert">{importError}</InfoBox>}

              {/* Preview */}
              {importPreview.length>0 && (
                <div>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:14,color:C.textPrimary,marginBottom:10}}>
                    {importPreview.length} device{importPreview.length!==1?'s':''} found{importCompany?' for '+importCompany:''} — review before importing
                  </div>
                  {importPreview.map((dev,i)=>(
                    <div key={i} style={{background:C.surfaceHi,borderRadius:9,padding:'12px 14px',marginBottom:8,border:`1px solid ${C.border}`}}>
                      <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:13,color:C.textPrimary,marginBottom:5}}>{dev.name}{dev.model&&dev.model!==dev.name?<span style={{fontWeight:400,color:C.textSecondary,fontSize:12}}> · {dev.model}</span>:''}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                        {dev.cpu&&<div style={{fontSize:11,color:C.textSecondary}}>CPU: <span style={{color:C.textPrimary}}>{dev.cpu.replace(/Intel\(R\)|Core\(TM\)|CPU|@/g,'').replace(/\s+/g,' ').trim()}</span></div>}
                        {dev.ram&&<div style={{fontSize:11,color:C.textSecondary}}>RAM: <span style={{color:C.textPrimary}}>{dev.ram}</span></div>}
                        {dev.storage&&<div style={{fontSize:11,color:C.textSecondary}}>Disk: <span style={{color:C.textPrimary}}>{dev.storage}</span></div>}
                        {dev.gpu&&dev.gpu!=='None'&&<div style={{fontSize:11,color:C.textSecondary}}>GPU: <span style={{color:C.orange}}>{dev.gpu}</span></div>}
                        {dev.os&&<div style={{fontSize:11,color:C.textSecondary,gridColumn:'span 2'}}>OS: <span style={{color:C.textPrimary}}>{dev.os}</span></div>}
                      </div>
                    </div>
                  ))}
                  <InfoBox>Note: GPU and storage are not in the ScreenConnect CSV export — fill those in manually after import, or use the Run Command method on the right.</InfoBox>
                  <button onClick={confirmImport} style={{width:'100%',padding:'13px',borderRadius:10,background:C.orange,color:C.white,border:'none',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Sora,sans-serif',marginTop:4}}>
                    Import {importPreview.length} Device{importPreview.length!==1?'s':''} as Existing Computers →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PhaseHeader num={3} title="IT Infrastructure" sub="Room by room, then imaging equipment and networking." />

      {notReq && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'rgba(239,68,68,.1)', border:`1.5px solid #EF4444`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#FCA5A5' }}>Quote 1 not selected for this engagement</span>
            <span style={{ fontSize:13, color:'#FCA5A5' }}> — you can still capture details here, but this section won't appear in the Blueprint.</span>
          </div>
          <button onClick={()=>u('q1req',true)} style={{ fontSize:12, fontWeight:700, color:C.orange, background:C.surface, border:`1.5px solid ${C.orange}`, borderRadius:7, padding:'4px 12px', cursor:'pointer', whiteSpace:'nowrap' }}>Add to scope</button>
        </div>
      )}

      {/* Room cards */}
      {rooms.length>1&&(
        <div style={{display:'flex',gap:8,marginBottom:12,justifyContent:'flex-end'}}>
          <button onClick={()=>u('rooms',rooms.map(r=>({...r,collapsed:true})))} style={{padding:'6px 12px',borderRadius:8,border:`1.5px solid ${C.border}`,background:'transparent',color:C.textSecondary,fontWeight:600,fontSize:12,cursor:'pointer'}}>⊟ Collapse All</button>
          <button onClick={()=>u('rooms',rooms.map(r=>({...r,collapsed:false})))} style={{padding:'6px 12px',borderRadius:8,border:`1.5px solid ${C.border}`,background:'transparent',color:C.textSecondary,fontWeight:600,fontSize:12,cursor:'pointer'}}>⊞ Expand All</button>
        </div>
      )}
      {rooms.length===0&&<div style={{ textAlign:'center', padding:'28px 0', color:C.textMuted, fontSize:14 }}>No rooms yet. Start with reception.</div>}
      {rooms.map((r,i)=>{
        const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];
        return (
          <Card key={r.id} style={{ borderColor:dev.imaging?C.orangeBorder:C.gray200 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:r.collapsed?0:14 }}>
              <div style={{flex:1,cursor:'pointer'}} onClick={()=>updR(r.id,'collapsed',!r.collapsed)}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{color:C.textMuted,fontSize:12}}>{r.collapsed?'▶':'▼'}</span>
                  <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15, color:C.textPrimary }}>{r.name||`Room ${i+1}`}{r.deviceName?<span style={{fontWeight:400,color:C.textSecondary,fontSize:13}}> · {r.deviceName}</span>:''}</div>
                </div>
                {r.collapsed && <div style={{ marginTop:4, marginLeft:20 }}>
                  <Pill label={dev.label} color={dev.imaging?C.orange:C.navyMid} />
                  {r.existingPC&&<Pill label={`Existing${r.pcAge?' · '+r.pcAge+'yr':''}`} color={C.gray600} />}
                  {r.replacePC&&<Pill label="Replace" color={C.orange} />}
                </div>}
                {!r.collapsed && <div style={{ marginTop:4 }}>
                  <Pill label={dev.label} color={dev.imaging?C.orange:C.navyMid} />
                  {dev.gpu!=='None'&&<Pill label={dev.gpu} color={C.gray600} />}
                  {r.database&&<Pill label="RAID Storage" color={C.amber} />}
                  {r.monitor&&r.monitor!=='No Monitor'&&<Pill label={r.monitor} color={C.navyMid} />}
                </div>}
              </div>
              <button onClick={()=>delR(r.id)} style={{ fontSize:12, color:C.red, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Remove</button>
            </div>
            {!r.collapsed && <>
            <Row cols={r.existingPC?2:3}>
              <Field label="Room / Location Name" tight><Input value={r.name} onChange={v=>updR(r.id,'name',v)} placeholder="e.g. Treatment Room 1, Reception…" /></Field>
              <Field label="Device Name" tight hint="Hostname / PC name"><Input value={r.deviceName||''} onChange={v=>updR(r.id,'deviceName',v)} placeholder="e.g. SURGERY1-PC, REC-01" /></Field>
              {!r.existingPC && <Field label="Qty" tight><Num value={r.qty} onChange={v=>updR(r.id,'qty',v)} min={1} /></Field>}
            </Row>

            {/* Existing PC toggle — if on, hide device/monitor/peripherals */}
            <div style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.border}` }}>
              <Toggle checked={!!r.existingPC} onChange={v=>updR(r.id,'existingPC',v)}
                label="Existing computer in this room"
                sub={r.existingPC?'Device specs captured below — no new device or install required':'New computer will be supplied by 32 Byte'} />
            </div>

            {/* Existing PC details — shown when existingPC is on */}
            {r.existingPC && (()=>{
              const inferredAge = r.pcCpu ? cpuAgeYears(r.pcCpu) : null;
              const age = parseInt(r.pcAge) || inferredAge || 0;
              const ageBorder = age>=5 ? C.red : age>=3 ? C.amber : C.border;
              const ageBg = age>=5 ? 'rgba(239,68,68,.08)' : age>=3 ? 'rgba(245,158,11,.08)' : C.surfaceHi;
              return (
                <div style={{ padding:'14px 16px', background:ageBg, borderRadius:9, border:`1.5px solid ${ageBorder}`, marginBottom:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.orange, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Existing Computer Details</div>
                  <Row>
                    <Field label="Brand / Model" tight><Input value={r.pcBrand||''} onChange={v=>updR(r.id,'pcBrand',v)} placeholder="e.g. Dell OptiPlex, HP EliteDesk…" /></Field>
                    <Field label="Age (years)" tight hint={inferredAge&&!r.pcAge?`Auto-detected from CPU: ~${inferredAge} yrs`:'Override if you know the exact age'}>
                      <Input type="number" value={r.pcAge||''} onChange={v=>updR(r.id,'pcAge',v)} placeholder={inferredAge?`~${inferredAge} (auto)`:'e.g. 3'} />
                    </Field>
                  </Row>
                  {age>=5 && <InfoBox type="alert">⚠️ Device is ~{age} years old — likely end of life. Consider replacement.</InfoBox>}
                  {age>=3 && age<5 && <InfoBox type="warn">⚠️ Device is ~{age} years old — likely out of manufacturer warranty. Discuss support options.</InfoBox>}
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
                  <Row>
                    <Field label="Operating System" tight>
                      <Select value={r.pcOs||''} onChange={v=>updR(r.id,'pcOs',v)}
                        options={['Windows 11 Pro','Windows 11 Business','Windows 11 Home','Windows 10 Pro','Windows 10 Business','Windows 10 Home','Windows Server 2022','Windows Server 2019','Windows Server 2016','macOS','Other']}
                        placeholder="Select OS…" />
                    </Field>
                    <Field label="Notes" tight><Input value={r.pcNotes||''} onChange={v=>updR(r.id,'pcNotes',v)} placeholder="Issues, imaging software, reuse potential…" /></Field>
                  </Row>
                  {r.pcOs && !r.pcOs.includes('Windows 11') && !r.pcOs.includes('Server') && <InfoBox type="alert">⚠️ {r.pcOs} — not Windows 11. Upgrade or replacement recommended before go-live.</InfoBox>}
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                    <Toggle checked={!!r.replacePC} onChange={v=>updR(r.id,'replacePC',v)}
                      label="Replace this computer"
                      sub={r.replacePC?'Select replacement below — existing details kept for handover':'Keep existing computer, no replacement required'} />
                  </div>
                </div>
              );
            })()}

            {/* Replacement device options — shown when replacePC is true */}
            {r.existingPC && r.replacePC && (
              <div style={{marginTop:10,padding:'14px 16px',background:C.orangeLight,borderRadius:9,border:`1.5px solid ${C.orangeBorder}`,marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Replacement Device</div>
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
              </div>
            )}

            {/* New device options — shown when no existing PC */}
            {!r.existingPC && (
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
            </>}
          </Card>
        );
      })}
      <div style={{display:'flex',gap:8,marginBottom:22,flexWrap:'wrap'}}>
        <button onClick={addR} style={{ flex:1, minWidth:120, padding:'12px', borderRadius:10, border:`2px dashed ${C.border}`, background:'transparent', color:C.orange, fontWeight:700, fontSize:14, cursor:'pointer' }}>+ Add Room</button>
        <button onClick={()=>setShowImport(true)} style={{ padding:'12px 14px', borderRadius:10, border:`2px solid ${C.navyMid}`, background:C.navyMid, color:C.white, fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>⬆ Import</button>
        {rooms.length>1&&<button onClick={()=>u('rooms',rooms.map(r=>({...r,collapsed:true})))} style={{ padding:'12px 12px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontWeight:600, fontSize:12, cursor:'pointer' }}>⊟ Collapse All</button>}
        {rooms.length>1&&<button onClick={()=>u('rooms',rooms.map(r=>({...r,collapsed:false})))} style={{ padding:'12px 12px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'transparent', color:C.textSecondary, fontWeight:600, fontSize:12, cursor:'pointer' }}>⊞ Expand All</button>}
      </div>



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

            {sc.database && (
              <Field label="Database Device Name" tight hint="Which PC hosts the local database?">
                {(d.rooms||[]).length>0
                  ? <Select value={sc.dbDeviceName||''} onChange={v=>u('intraoralScanners',(d.intraoralScanners||[]).map(x=>x.id===sc.id?{...x,dbDeviceName:v}:x))}
                      options={(d.rooms||[]).map(r=>r.deviceName||r.name).filter(Boolean)} placeholder="Select PC…" />
                  : <Input value={sc.dbDeviceName||''} onChange={v=>u('intraoralScanners',(d.intraoralScanners||[]).map(x=>x.id===sc.id?{...x,dbDeviceName:v}:x))} placeholder="e.g. RECEPTION-PC, SERVER-01" />}
              </Field>
            )}
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
                <Select value={xr.type||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,type:v}:x))} options={['Intraoral X-ray sensor','OPG (panoramic)','CBCT','OPG + CBCT combined','Phosphor Plate Reader','Other']} placeholder="Select type…" />
              </Field>
            </Row>
            <Row>
              <Field label="Imaging Software" tight><Input value={xr.software||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,software:v}:x))} placeholder="e.g. Vistasoft, Sidexis, Romexis" /></Field>
              <Field label="Timing" tight>
                <Select value={xr.timing||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,timing:v}:x))} options={['Already installed','Day one (opening)','Within 6 months','6–12 months','Future — not yet confirmed']} placeholder="When is this going in?" />
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

            {xr.database && (
              <Field label="Database Device Name" tight hint="Which PC hosts the local database?">
                {(d.rooms||[]).length>0
                  ? <Select value={xr.dbDeviceName||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,dbDeviceName:v}:x))}
                      options={(d.rooms||[]).map(r=>r.deviceName||r.name).filter(Boolean)} placeholder="Select PC…" />
                  : <Input value={xr.dbDeviceName||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,dbDeviceName:v}:x))} placeholder="e.g. XRAY-PC-01, SERVER-01" />}
              </Field>
            )}
            <Field label="Acquisition / Capture PC" tight hint="PC connected to this machine for image capture">
              {(d.rooms||[]).length>0
                ? <Select value={xr.acquisitionPc||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,acquisitionPc:v}:x))}
                    options={[...(d.rooms||[]).map(r=>r.deviceName||r.name).filter(Boolean), 'Standalone / embedded']} placeholder="Select acquisition PC…" />
                : <Input value={xr.acquisitionPc||''} onChange={v=>u('xrayMachines',(d.xrayMachines||[]).map(x=>x.id===xr.id?{...x,acquisitionPc:v}:x))} placeholder="e.g. SURGERY1-PC, standalone" />}
            </Field>
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
      <Toggle checked={!!d.newNetworking} onChange={v=>u('newNetworking',v)}
        label="New networking equipment required"
        sub={d.newNetworking?'Select equipment below':'No new networking — existing infrastructure only'} />
      {d.newNetworking && (
        <div style={{padding:'14px 16px',background:C.surfaceHi,borderRadius:10,border:`1.5px solid ${C.border}`,marginTop:10}}>
          <Row>
            <Field label="Managed Switch" tight>
              <Select value={d.switchType||''} onChange={v=>u('switchType',v)} placeholder="Select switch…" options={['Ubiquiti 24-port POE','Ubiquiti 48-port POE (recommended)']} />
            </Field>
            <Field label="Wi-Fi APs (UniFi U7 Pro)" tight hint="Confirm count from floor plan">
              <Num value={d.wifiAPs||''} onChange={v=>u('wifiAPs',v)} />
            </Field>
          </Row>
        </div>
      )}
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
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['Ceiling','Wall','Mixed','Not mounted'].map(o=>{
            const a=d.apMount===o;
            return <button key={o} onClick={()=>u('apMount',o)} style={{ flex:1, minWidth:80, padding:'9px 8px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:`2px solid ${a?C.orange:C.gray200}`, background:a?C.orangeLight:C.surfaceHi, color:a?C.orange:C.textSecondary }}>{o}</button>;
          })}
        </div>
        {d.apMount==='Not mounted' && (
          <div style={{marginTop:8}}>
            <Input value={d.apMountNotes||''} onChange={v=>u('apMountNotes',v)} placeholder="Describe AP placement — e.g. on desk in comms room, wall bracket in hallway…" />
          </div>
        )}
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
      <Divider label="Security Cameras" />
      <Toggle checked={!!d.cameras} onChange={v=>u('cameras',v)} label="New security cameras required" />
      <div style={{marginTop:10}}>
        <Toggle checked={!!d.existingCameras} onChange={v=>u('existingCameras',v)} label="Existing camera system in place" sub={d.existingCameras?'Capture details below':'No existing cameras'} />
        {d.existingCameras && (
          <div style={{ marginLeft:54, marginTop:10, padding:'12px 14px', background:C.surfaceHi, borderRadius:9, border:`1.5px solid ${C.border}` }}>
            <Row>
              <Field label="Vendor / Brand" tight><Input value={d.existingCameraVendor||''} onChange={v=>u('existingCameraVendor',v)} placeholder="e.g. Hikvision, Dahua, Axis" /></Field>
              <Field label="Number of existing cameras" tight><Num value={d.existingCameraCount||''} onChange={v=>u('existingCameraCount',v)} /></Field>
            </Row>
            <Field label="Notes" tight><Input value={d.existingCameraNotes||''} onChange={v=>u('existingCameraNotes',v)} placeholder="Age, condition, NVR details, reuse potential…" /></Field>
          </div>
        )}
      </div>
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
      <InfoBox>Firewall and 4G Failover are part of the network infrastructure. Both are enabled by default — toggle off if not required.</InfoBox>
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
              {mu.licence==='Other'
                ? <Input value={mu.licenceOther||''} onChange={v=>u('m365Users',(d.m365Users||[]).map(x=>x.id===mu.id?{...x,licenceOther:v}:x))} placeholder="Describe licence type…" />
                : <Select value={mu.licence||''} onChange={v=>u('m365Users',(d.m365Users||[]).map(x=>x.id===mu.id?{...x,licence:v}:x))}
                    options={['Business Basic','Business Standard','Business Premium','Apps for Business','F1','F3','E3','E5','Other']} placeholder="Licence type…" />}
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
      {(totalD>0||d.cameras||d.switchType||d.wifiAPs||phoneHrs>0)&&(
        <div style={{ background:C.navy, borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:13, color:C.textPrimary, marginBottom:10 }}>Estimated Professional Services Hours</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div style={{ background:'rgba(255,255,255,.06)', borderRadius:8, padding:'10px 14px' }}>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:3 }}>Total Devices</div>
              <div style={{ fontSize:18, fontWeight:700, color:C.orange, fontFamily:'Sora,sans-serif' }}>{totalD}</div>
            </div>
            <div style={{ background:'rgba(255,255,255,.06)', borderRadius:8, padding:'10px 14px' }}>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:3 }}>Est. Install Hours</div>
              <div style={{ fontSize:18, fontWeight:700, color:C.orange, fontFamily:'Sora,sans-serif' }}>{(psHrs+phoneHrs).toFixed(1)} hrs</div>
            </div>
          </div>
          <div style={{fontSize:11,color:C.textMuted,lineHeight:1.9}}>
            {newDevices>0&&<div>• Devices: {newDevices} × 2.5 hrs = {(newDevices*2.5).toFixed(1)} hrs</div>}
            {networkingHrs>0&&<div>• Networking setup: 2.0 hrs</div>}
            {cameraHrs>0&&<div>• Cameras: {n(d.cameraCount)} × 15 min = {cameraHrs.toFixed(1)} hrs</div>}
            {phoneHrs>0&&<div>• Phone system: 2 hrs base{totalHandsets>4?` + ${totalHandsets-4} extra handsets × 15 min = ${phoneHrs.toFixed(1)} hrs`:` (${totalHandsets} handset${totalHandsets!==1?'s':''} included)`}</div>}
            {totalD>newDevices&&<div>• {totalD-newDevices} existing device{totalD-newDevices!==1?'s':''} excluded from install time</div>}
          </div>
        </div>
      )}
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
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'rgba(239,68,68,.1)', border:`1.5px solid #EF4444`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#FCA5A5' }}>Quote 2 not selected for this engagement</span>
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
          <Field label="Contract Expiry" tight><DatePicker value={d.internetExpiry||''} onChange={v=>u('internetExpiry',v)} /></Field>
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
        <div style={{marginTop:14}}>
          <Row>
            <Field label="Extensions / Licences" hint="Per user / extension"><Num value={d.voipLicences||''} onChange={v=>u('voipLicences',v)} /></Field>
            <Field label="Total DID Lines"><Num value={d.ddiLines||''} onChange={v=>u('ddiLines',v)} /></Field>
          </Row>
          <Toggle checked={!!d.porting} onChange={v=>u('porting',v)} label="Number porting required" sub="Existing number(s) to be transferred to this service" />
          {d.porting && (
            <div style={{marginLeft:54,marginTop:8}}>
              <Field label="Numbers to port" hint="List all DIDs / phone numbers being ported">
                <Textarea value={d.portingNumbers||''} onChange={v=>u('portingNumbers',v)} rows={2} placeholder="e.g. 03 9123 4567, 03 9123 4568, 0412 345 678…" />
              </Field>
              <Field label="Current carrier / provider" tight>
                <Input value={d.portingCarrier||''} onChange={v=>u('portingCarrier',v)} placeholder="e.g. Telstra, Optus, Vonex…" />
              </Field>
            </div>
          )}
        </div>
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
                <div style={{ textAlign:'center', color:C.textMuted, fontSize:13, padding:'12px 0' }}>
                  Custom call flow — fill in the fields below and optionally upload a call flow diagram.
                </div>
              );
            })()}
          </div>

          {(true) && ( // Show call flow fields for both default and custom
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
          <Field label="Call Flow Files" hint="Upload diagram and/or audio recordings (greetings, after-hours messages etc.)">
            <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
              <label style={{padding:'8px 14px',borderRadius:8,border:`2px dashed ${C.border}`,background:C.surfaceHi,color:C.orange,fontWeight:600,fontSize:12,cursor:'pointer'}}>
                📎 Upload Diagram
                <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e=>{
                  const f=e.target.files[0]; if(!f) return;
                  if(f.type.startsWith('image/')){const r=new FileReader();r.onload=ev=>u('callFlowImage',ev.target.result);r.readAsDataURL(f);}
                  else{u('callFlowFileName',f.name);}
                }} />
              </label>
              <label style={{padding:'8px 14px',borderRadius:8,border:`2px dashed ${C.border}`,background:C.surfaceHi,color:'#60A5FA',fontWeight:600,fontSize:12,cursor:'pointer'}}>
                🎵 Upload Audio
                <input type="file" accept="audio/*,.mp3,.wav,.m4a" style={{display:'none'}} onChange={e=>{
                  const files = Array.from(e.target.files||[]);
                  const cur = d.callFlowAudio||[];
                  files.forEach(f=>{
                    const r=new FileReader();
                    r.onload=ev=>u('callFlowAudio',[...cur,{name:f.name,data:ev.target.result,type:f.type}]);
                    r.readAsDataURL(f);
                  });
                }} />
              </label>
            </div>
            {d.callFlowImage && <div style={{borderRadius:9,overflow:'hidden',border:`1.5px solid ${C.border}`,maxHeight:200,marginBottom:6}}><img src={d.callFlowImage} alt="Call flow" style={{width:'100%',display:'block',objectFit:'contain'}} /></div>}
            {d.callFlowFileName && <div style={{fontSize:12,color:C.green,marginBottom:4}}>✓ {d.callFlowFileName}</div>}
            {(d.callFlowAudio||[]).map((a,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:C.surfaceHi,borderRadius:7,marginBottom:4,border:`1px solid ${C.border}`}}>
                <span style={{fontSize:14}}>🎵</span>
                <span style={{fontSize:12,color:C.textSecondary,flex:1}}>{a.name}</span>
                <audio controls src={a.data} style={{height:28,flex:2}} />
                <button onClick={()=>u('callFlowAudio',(d.callFlowAudio||[]).filter((_,j)=>j!==i))} style={{color:C.red,background:'none',border:'none',cursor:'pointer',fontSize:12,fontWeight:700}}>×</button>
              </div>
            ))}
            {(d.callFlowImage||d.callFlowFileName) && <button onClick={()=>{u('callFlowImage',null);u('callFlowFileName','');}} style={{fontSize:11,color:C.red,background:'none',border:'none',cursor:'pointer'}}>Remove diagram</button>}
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
              notes={h.notes} onNotes={v=>updHw('handsets',i,'notes',v)} showNotes={h.model==='Other'}
              showDeviceFields={h.model!=='Other'} devices={h.devices||[]} onDevices={v=>updHw('handsets',i,'devices',v)} existingQty={h.existingQty||''} onExistingQty={v=>updHw('handsets',i,'existingQty',v)} existingDevices={h.existingDevices||[]} onExistingDevices={v=>updHw('handsets',i,'existingDevices',v)} />
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
              notes={h.notes} onNotes={v=>updHw('cordless',i,'notes',v)} showNotes={h.model==='Other'}
              showDeviceFields={h.model!=='Other'} devices={h.devices||[]} onDevices={v=>updHw('cordless',i,'devices',v)} existingQty={h.existingQty||''} onExistingQty={v=>updHw('cordless',i,'existingQty',v)} existingDevices={h.existingDevices||[]} onExistingDevices={v=>updHw('cordless',i,'existingDevices',v)} />
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
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'rgba(239,68,68,.1)', border:`1.5px solid #EF4444`, borderRadius:10, marginBottom:20 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#FCA5A5' }}>Quote 3 not selected for this engagement</span>
            <span style={{ fontSize:13, color:'#FDE68A' }}> — you can still capture details here, but this section won't appear in the Blueprint.</span>
          </div>
          <button onClick={()=>u('q3req',true)} style={{ fontSize:12, fontWeight:700, color:C.orange, background:C.surface, border:`1.5px solid ${C.orange}`, borderRadius:7, padding:'4px 12px', cursor:'pointer', whiteSpace:'nowrap' }}>Add to scope</button>
        </div>
      )}
      <Divider label="TotalCare MSA — Baseline" />
      <Toggle checked={d.msaSelected!==false} onChange={v=>u('msaSelected',v)} label="TotalCare MSA — All-inclusive managed IT" sub="Unlimited remote support · On-site when needed · Proactive monitoring · Automated patching · Practice software & vendor management" />
      {d.msaSelected===false && <InfoBox type="alert">⚠️ MSA not selected — practice will have no ongoing support, monitoring or patching. This is not recommended. Document any known risks.</InfoBox>}
      {d.msaSelected!==false && (
        <Field label="Managed Endpoints" hint={autoEP>0?`${autoEP} devices detected from Phase 3 — adjust if needed`:'Total PCs, laptops and managed workstations'}>
          <Input type="number" value={d.endpoints||''} onChange={v=>u('endpoints',v)} placeholder={autoEP>0?autoEP.toString():'0'} />
        </Field>
      )}

      <Divider label="Advanced Cyber Security" />
      <div style={{border:`1.5px solid ${d.advancedCyber?C.orangeBorder:'rgba(239,68,68,.3)'}`,borderRadius:11,padding:'14px 16px',marginBottom:8}}>
        <Toggle checked={!!d.advancedCyber} onChange={v=>u('advancedCyber',v)}
          label="Advanced Cyber Security Suite (Full Bundle)"
          sub="Select the bundle or choose individual components below" />
        {[
          {k:'cyberSoc',     l:'Managed SOC — 24/7 threat monitoring',    warn:'Practice has no 24/7 security monitoring — high risk for ransomware'},
          {k:'cyberPam',     l:'PAM — Privileged Access Management',       warn:'Admin accounts unprotected — easy target for credential attacks'},
          {k:'cyberDwm',     l:'Dark Web Monitoring',                      warn:'No visibility of compromised staff credentials on the dark web'},
          {k:'cyberPwdMgr',  l:'Password Manager',                         warn:'Staff likely reusing weak passwords — major security risk'},
        ].map(({k,l,warn})=>{
          const on = d.advancedCyber || !!d[k];
          return (
            <div key={k} style={{marginLeft:54,marginTop:8,padding:'8px 12px',background:C.surfaceHi,borderRadius:8,border:`1px solid ${on?C.border:'rgba(239,68,68,.2)'}`}}>
              <Toggle checked={on} onChange={v=>{ if(!d.advancedCyber) u(k,v); }}
                label={l} sub={on?'Selected':'Not selected'} />
              {!on&&<div style={{fontSize:11,color:'#FCA5A5',marginTop:4,marginLeft:50}}>⚠️ {warn}</div>}
            </div>
          );
        })}
        {!d.advancedCyber && !d.cyberSoc && !d.cyberPam && !d.cyberDwm && !d.cyberPwdMgr && (
          <div style={{marginTop:10,padding:'8px 12px',background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:7,fontSize:12,color:'#FCA5A5'}}>
            ⚠️ No cyber security components selected — practice is at significant risk. Document any known risks below.
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:10,marginTop:8,marginBottom:4}}>
        <a href="https://32byte.com.au/calculator/" target="_blank" rel="noopener noreferrer"
          style={{flex:1,padding:'9px 12px',borderRadius:8,background:C.navyMid,color:C.textPrimary,fontSize:12,fontWeight:600,textDecoration:'none',textAlign:'center',border:`1px solid ${C.border}`}}>
          🧮 Dental IT ROI Calculator
        </a>
        <a href="https://32byte.com.au/data-breach-cost-calculator/" target="_blank" rel="noopener noreferrer"
          style={{flex:1,padding:'9px 12px',borderRadius:8,background:C.navyMid,color:C.textPrimary,fontSize:12,fontWeight:600,textDecoration:'none',textAlign:'center',border:`1px solid ${C.border}`}}>
          🔐 Data Breach Cost Calculator
        </a>
      </div>

      <Divider label="Backup & Disaster Recovery" />
      <InfoBox>Select all that apply. BCDR includes local appliance + cloud replication. Cloud backup is cloud-only.</InfoBox>
      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:14}}>
        <InfoBox>Add each device that needs to be backed up. The app will recommend a Datto appliance or cloud plan based on the total data.</InfoBox>
        {/* Backup devices list */}
        {(d.backupDevices||[]).map((bd,bi)=>(
          <div key={bd.id} style={{marginBottom:10,padding:'14px 16px',background:C.surfaceHi,borderRadius:10,border:`1.5px solid ${C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:13,color:C.textPrimary}}>Device {bi+1}: {bd.name||'Unnamed'}</div>
              <button onClick={()=>u('backupDevices',(d.backupDevices||[]).filter((_,x)=>x!==bi))} style={{color:C.red,background:'none',border:'none',cursor:'pointer',fontSize:12,fontWeight:700}}>Remove</button>
            </div>
            <Row>
              <Field label="Device / PC Name" tight hint="Select from Phase 3 or type manually">
                {(d.rooms||[]).length>0 && bd.name!=='Other — type manually'
                  ? <Select value={bd.name||''} onChange={v=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,name:v}:x))}
                      options={[(d.rooms||[]).map(r=>r.deviceName||r.name).filter(Boolean),'Other — type manually'].flat()}
                      placeholder="Select device…" />
                  : <div style={{display:'flex',gap:6}}>
                      <Input value={bd.name==='Other — type manually'?'':bd.name||''} onChange={v=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,name:v}:x))} placeholder="e.g. SERVER-01, RECEPTION-PC" />
                      {(d.rooms||[]).length>0&&<button onClick={()=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,name:''}:x))} style={{padding:'0 10px',borderRadius:7,background:C.surface,border:`1px solid ${C.border}`,color:C.textSecondary,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>Pick</button>}
                    </div>}
              </Field>
              <Field label="Data Volume" tight>
                <Select value={bd.dataVol||''} onChange={v=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,dataVol:v}:x))}
                  options={['Under 100GB','100–250GB','250–500GB','500GB–1TB','1–2TB','2–4TB','4–6TB','6–8TB','8TB+']} placeholder="Select data size…" />
              </Field>
            </Row>
            <Row>
              <Field label="Backup Type" tight>
                {(() => {
                  const nm = (bd.name||'').toLowerCase();
                  const roomRef = (d.rooms||[]).find(r=>(r.deviceName||r.name||'').toLowerCase()===nm);
                  const isImaging = roomRef && DEVICE_OPTIONS.find(o=>o.v===roomRef.deviceType)?.imaging;
                  const hasPms = (d.pms||'').length>0;
                  const suggested = isImaging||hasPms ? 'BCDR Appliance (on-premise + cloud)' : 'Cloud Backup Only';
                  const hasSuggestion = !bd.backupType && (isImaging||hasPms);
                  return (
                    <>
                      {hasSuggestion&&<div style={{fontSize:11,color:C.orange,marginBottom:4}}>💡 Recommended: {suggested} — imaging or PMS data detected</div>}
                      <Select value={bd.backupType||''} onChange={v=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,backupType:v}:x))}
                        options={['BCDR Appliance (on-premise + cloud)','Cloud Backup Only','Both']} placeholder="Select backup type…" />
                      {bd.backupType==='Cloud Backup Only'&&(isImaging||hasPms)&&<div style={{fontSize:11,color:C.amber,marginTop:4}}>⚠️ Cloud-only not recommended for imaging/PMS databases — BCDR provides faster local recovery</div>}
                    </>
                  );
                })()}
              </Field>
              <Field label="RPO (Recovery Point Obj.)" tight hint="How much data loss is acceptable?">
                <Select value={bd.rpo||''} onChange={v=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,rpo:v}:x))}
                  options={['1 hour','4 hours','8 hours','24 hours','Best effort']} placeholder="Select RPO…" />
              </Field>
            </Row>
            <Row>
              <Field label="RTO (Recovery Time Obj.)" tight hint="How quickly must they be back online?">
                <Select value={bd.rto||''} onChange={v=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,rto:v}:x))}
                  options={['Same day','Within 4 hours','Within 1 hour','24–48 hours']} placeholder="Select RTO…" />
              </Field>
              <Field label="Data Retention" tight>
                <Select value={bd.retention||''} onChange={v=>u('backupDevices',(d.backupDevices||[]).map((x,i)=>i===bi?{...x,retention:v}:x))}
                  options={['30 days','90 days','1 year','3 years','7 years']} placeholder="Select retention…" />
              </Field>
            </Row>
          </div>
        ))}
        <button onClick={()=>u('backupDevices',[...(d.backupDevices||[]),{id:uid(),name:'',dataVol:'',backupType:'',rpo:'',rto:'',retention:''}])}
          style={{width:'100%',padding:'10px',borderRadius:9,border:`2px dashed ${C.border}`,background:'transparent',color:C.orange,fontWeight:700,fontSize:13,cursor:'pointer',marginBottom:12}}>
          + Add Device to Back Up
        </button>
        {/* Auto-recommend based on total data */}
        {(d.backupDevices||[]).some(bd=>bd.backupType&&bd.backupType.includes('BCDR'))&&(()=>{
          const dataMap = {'Under 100GB':0.1,'100–250GB':0.25,'250–500GB':0.5,'500GB–1TB':1,'1–2TB':2,'2–4TB':4,'4–6TB':6,'6–8TB':8,'8TB+':10};
          const totalTB = (d.backupDevices||[]).filter(bd=>bd.backupType&&bd.backupType.includes('BCDR')).reduce((a,bd)=>a+(dataMap[bd.dataVol]||0),0);
          let model='S6-X', mn='2TB · Micro desktop';
          if(totalTB<=2){model='S6-X';mn='2TB · Micro desktop';}
          else if(totalTB<=3){model='S6-3';mn='3TB · 1U rack';}
          else if(totalTB<=4){model='S6-4';mn='4TB · 1U rack';}
          else if(totalTB<=6){model='S6-6';mn='6TB · 1U rack';}
          else if(totalTB<=8){model='S6-8';mn='8TB · 1U rack';}
          else if(totalTB<=12){model='S6-12';mn='12TB · 1U rack';}
          else if(totalTB<=18){model='S6-18';mn='18TB · 1U rack';}
          else if(totalTB<=24){model='S6-24';mn='24TB · 1U rack';}
          else{model='S6-36';mn='36TB · 1U rack';}
          return (
            <div style={{background:C.orangeLight,border:`1.5px solid ${C.orangeBorder}`,borderRadius:9,padding:'12px 16px',marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.orange,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>Recommended BCDR Model</div>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:20,color:C.textPrimary}}>Datto Siris {model}</div>
              <div style={{fontSize:13,color:C.textSecondary,marginTop:2}}>{mn} · Est. total: {totalTB.toFixed(1)}TB across {(d.backupDevices||[]).filter(bd=>bd.backupType&&bd.backupType.includes('BCDR')).length} device(s)</div>
            </div>
          );
        })()}
        {/* datto/cloudBackup flags kept in sync via summary page reads */}
      </div>
      <Divider label="Cyber Liability Insurance" />
      <InfoBox>Capture the practice's existing cyber insurance details — important context for our Advanced Cyber Security recommendations.</InfoBox>
      <Row>
        <Field label="Insurer / Provider"><Input value={d.cyberInsurer||''} onChange={v=>u('cyberInsurer',v)} placeholder="e.g. AXA, Chubb, Emergence" /></Field>
        <Field label="Policy Number"><Input value={d.cyberPolicyNumber||''} onChange={v=>u('cyberPolicyNumber',v)} placeholder="Policy number" /></Field>
      </Row>
      <Field label="Policy Expiry">
        <DatePicker value={d.cyberExpiry||''} onChange={v=>u('cyberExpiry',v)} />
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
        headers:{ 'Content-Type':'application/json', 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{ role:'user', content:buildPrompt() }] })
      });
      if(!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const text = (data.content||[]).map(c=>c.text||'').join('\n');
      if(text) { setEmail(text); setLoading(false); return; }
      throw new Error('Empty response');
    } catch(e) {
      const fmtDate = s => s ? new Date(s+'T00:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'}) : null;
      const dateLabel = d.practiceType==='new' ? fmtDate(d.openingDate) : fmtDate(d.goLiveDate);
      setEmail(`Hi ${d.contactName||'there'},\n\nThank you for taking the time to meet with us today to discuss the technology requirements for ${d.practiceName||'your practice'}.\n\nFollowing our Practice Success Blueprint meeting, I wanted to reach out with a summary of what we covered and the next steps.\n\n${dateLabel ? `We have noted your ${d.practiceType==='new'?'target opening date':'go-live date'} of ${dateLabel} and will be working to ensure everything is in place well ahead of time.` : 'We will be in touch shortly with a proposed timeline.'}\n\nYour formal quotes will follow shortly. In the meantime, please don't hesitate to reach out if you have any questions.\n\nWarm regards,\n${d.salesRep||'The 32 Byte Team'}\n32 Byte — Dental IT Specialists`);
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

      // Build quote links as HTML buttons for email
      const quoteBtns = [
        d.q1req!==false&&d.q1url&&{label:'Solution 1 — Hardware & Infrastructure', url:d.q1url},
        d.q2req!==false&&d.q2url&&{label:'Solution 2 — Telecommunications', url:d.q2url},
        d.q3req!==false&&d.q3url&&{label:'Solution 3 — Managed Services', url:d.q3url},
      ].filter(Boolean);
      const quoteLines = quoteBtns.length>0
        ? quoteBtns.map(q=>`<a href="${q.url}" style="display:inline-block;margin:6px 0;padding:12px 24px;background:#fe5a25;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">${q.label} →</a>`).join('<br>')
        : 'Your formal quotes will follow shortly.';

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

const Phase6 = ({ d, u, locked, onLock, rooms, goStep }) => {
    const [showActionPts, setShowActionPts] = useState(false);
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
                  const el = document.querySelector('.psb-internal-summary');
                  const text = el ? el.innerText||el.textContent||'' : '';
                  navigator.clipboard.writeText(text);
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
                      const fmtD=s=>s?new Date(s+'T00:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'}):'—';

                      // Upload a file (base64 data URL or plain text) to file.io, returns link or null
                      const uploadFile = async(content, filename, mimeType='application/octet-stream') => {
                        try {
                          let blob;
                          if(typeof content === 'string' && content.startsWith('data:')) {
                            const arr = content.split(','), mime = arr[0].match(/:(.*?);/)[1];
                            const bStr = atob(arr[1]);
                            const u8 = new Uint8Array(bStr.length);
                            for(let i=0;i<bStr.length;i++) u8[i]=bStr.charCodeAt(i);
                            blob = new Blob([u8],{type:mime});
                          } else {
                            blob = new Blob([content],{type:mimeType});
                          }
                          const fd = new FormData();
                          fd.append('file', blob, filename);
                          const ctrl = new AbortController();
                          const timer = setTimeout(()=>ctrl.abort(), 8000);
                          const r = await fetch('https://file.io/?expires=14d',{method:'POST',body:fd,signal:ctrl.signal});
                          clearTimeout(timer);
                          const j = await r.json();
                          return j.success ? j.link : null;
                        } catch(e){ return null; }
                      };

                      const slug=(d.practiceName||'draft').replace(/\s+/g,'-');
                      const dt=new Date().toISOString().slice(0,10);

                      // Build full summary text
                      const fullSummary = [
`PRACTICE SUCCESS BLUEPRINT — INTERNAL BRIEF`,`${'═'.repeat(60)}`,
`Practice: ${d.practiceName||'—'} | ${[d.suburb,d.state].filter(Boolean).join(', ')||'—'}`,
`${d.practiceType==='new'?`Opening: ${fmtD(d.openingDate)} | Fitout: ${fmtD(d.fitoutDate)}`:`Go-Live: ${fmtD(d.goLiveDate)}`}`,
`PMS: ${d.pms||(d.pmsOther||'—')} | Finance: ${d.financeProvider||'None'} | Chairs: ${d.chairs||'—'}`,
`Imaging SW: ${(d.imagingSw||[]).join(', ')||'—'}`,
`Sales Rep: ${d.salesRep||'—'} | Meeting: ${fmtD(d.meetingDate)}`,
`Contact: ${d.contactName||'—'} | ${d.contactEmail||'—'}`,``,
`SOLUTIONS IN SCOPE`,`${'─'.repeat(40)}`,
[d.q1req!==false&&`S1 Hardware${d.q1url?' — '+d.q1url:''}`,d.q2req!==false&&`S2 Telecoms${d.q2url?' — '+d.q2url:''}`,d.q3req!==false&&`S3 MSA${d.q3url?' — '+d.q3url:''}`].filter(Boolean).join(' | '),``,
d.practiceType==='existing'&&d.existingIT?[`EXISTING IT PROVIDER`,`${'─'.repeat(40)}`,`Company: ${d.existingITCompany||'—'} | Type: ${d.existingITType||'—'}`,`Contact: ${[d.existingITContact,d.existingITPhone,d.existingITEmail].filter(Boolean).join(' | ')||'—'}`,`Expiry: ${d.existingITExpiry||'—'}`,`Manages: ${[d.existingITManagesDevices!==false&&'Devices',d.existingITManagesEmail!==false&&'Email',d.existingITManagesPhones!==false&&'Phones',d.existingITManagesInternet!==false&&'Internet',d.existingITManagesSecurity!==false&&'Security'].filter(Boolean).join(', ')||'—'}`,``].join('\n'):null,
`IT INFRASTRUCTURE`,`${'─'.repeat(40)}`,
rooms.map(r=>{const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];const base=r.deviceName&&r.deviceName!==r.name?`${r.name} (${r.deviceName})`:(r.name||'Room');return r.existingPC?`${base}: EXISTING — ${r.pcBrand||'TBC'} | ${r.pcAge||'?'}yr | ${r.pcCpu||'?'} | ${r.pcRam||'?'} | OS: ${r.pcOs||'?'}${r.replacePC?' → REPLACE with '+dev.label:''}` :`${base}: NEW ${dev.label}${r.monitor&&r.monitor!=='No Monitor'?' + '+r.monitor:''}${r.kbMouse?' + KB/Mouse':''}${r.database?' + RAID':''}`;}).join('\n')||'No rooms',
d.switchType||d.wifiAPs||d.firewall||d.failover?`Network: Switch=${d.switchType||'—'} | APs=${d.wifiAPs||'0'}× | Firewall=${d.firewall?'UDM Pro':'—'} | 4G=${d.failover?'TRB140':'—'}`:null,
d.cameras?`Cameras: ${d.cameraCount||'?'}× | NVR: ${d.nvrStorage||'TBC'}`:null,
d.m365Premium||d.m365F1?`M365: ${[d.m365Premium&&d.m365Premium+'× Business Premium',d.m365F1&&d.m365F1+'× F1'].filter(Boolean).join(', ')}`:null,``,
`IMAGING EQUIPMENT`,`${'─'.repeat(40)}`,
...(d.intraoralScanners||[]).map((s,i)=>`Intraoral ${i+1}: ${s.model||'TBC'} | SW: ${s.software||'—'}${s.dedicated?' [dedicated PC]':''}${s.database?' [RAID→'+s.dbDeviceName+']':''}`),
...(d.xrayMachines||[]).map((x,i)=>`X-ray ${i+1}: ${x.model||'TBC'} (${x.type||'?'}) | SW: ${x.software||'—'} | ${x.timing||'?'}${x.acquisitionPc?' [Acq: '+x.acquisitionPc+']':''}${x.database?' [RAID→'+x.dbDeviceName+']':''}`),
...(d.otherImaging||[]).map((o,i)=>`Other ${i+1}: ${o.desc||'TBC'}`),
(d.intraoralScanners||[]).length===0&&(d.xrayMachines||[]).length===0?'No imaging captured':null,``,
`EXTERNAL VENDORS`,`${'─'.repeat(40)}`,
...(d.vendors||[]).map(v=>`${v.type||(v.customType||'Vendor')}: ${v.company||'—'} | ${[v.contact,v.phone,v.email].filter(Boolean).join(' | ')||'—'} | Install: ${v.installResp||'TBD'}`),
(d.vendors||[]).length===0?'None captured':null,``,
`TELECOMS`,`${'─'.repeat(40)}`,
`Internet: ${d.internetType==='nbn'?'NBN '+d.nbnTier:d.internetType||'TBC'} | 4G SIM: ${d.sim4g?'Yes':'No'}`,
d.voip?`VoIP: ${d.voipLicences||'?'} licences${d.porting?' | Porting: '+(d.portingNumbers||'TBC')+' via '+(d.portingCarrier||'TBC'):''}`:null,
...(d.handsets||[]).filter(h=>n(h.qty)>0).map(h=>`${h.model} Handset ×${h.qty}`),
...(d.cordless||[]).filter(h=>n(h.qty)>0).map(h=>`${h.model} Cordless ×${h.qty}`),
...(d.headsets||[]).filter(h=>n(h.qty)>0).map(h=>`${h.model} Headset ×${h.qty}`),``,
`MANAGED SERVICES`,`${'─'.repeat(40)}`,
`MSA: ${d.msaSelected!==false?ep+' endpoints':'NOT SELECTED'}`,
`Cyber: ${d.advancedCyber?'Full Suite':([d.cyberSoc&&'SOC',d.cyberPam&&'PAM',d.cyberDwm&&'DWM',d.cyberPwdMgr&&'Password Mgr'].filter(Boolean).join(' + ')||'None selected')}`,
...(d.backupDevices||[]).map(b=>`Backup — ${b.name||'?'}: ${b.backupType||'TBC'} | ${b.dataVol||'?'} | RPO:${b.rpo||'?'} RTO:${b.rto||'?'} Retention:${b.retention||'?'}`),
d.cyberInsurer?`Cyber Insurance: ${d.cyberInsurer}${d.cyberPolicyNumber?' #'+d.cyberPolicyNumber:''}${d.cyberExpiry?' exp '+fmtD(d.cyberExpiry):''}`:null,``,
d.actionPoints?`ACTION POINTS
${'─'.repeat(40)}
${d.actionPoints}`:null,
d.followUps?`FOLLOW-UPS
${'─'.repeat(40)}
${d.followUps}`:null,
d.risks?`RISKS & NOTES
${'─'.repeat(40)}
${d.risks}`:null,
                      ].filter(v=>v!==false&&v!==null&&v!==undefined&&v!=='').join('\n');

                      // Upload JSON blueprint export
                      const jsonStr=JSON.stringify({...d,_exportDate:new Date().toISOString()},null,2);
                      const jsonLink=await uploadFile(jsonStr,`blueprint-${slug}-${dt}.json`,'application/json');

                      // Upload any images/files captured during the session
                      const uploads=[];
                      if(d.floorPlanImage){const l=await uploadFile(d.floorPlanImage,`floor-plan-${slug}.png`);if(l)uploads.push(`Floor Plan: ${l}`);}
                      if(d.cameraLayoutImage){const l=await uploadFile(d.cameraLayoutImage,`camera-layout-${slug}.png`);if(l)uploads.push(`Camera Layout: ${l}`);}
                      if(d.callFlowImage){const l=await uploadFile(d.callFlowImage,`call-flow-diagram-${slug}.png`);if(l)uploads.push(`Call Flow Diagram: ${l}`);}
                      for(let i=0;i<(d.callFlowAudio||[]).length;i++){const a=d.callFlowAudio[i];const l=await uploadFile(a.data,a.name||`audio-${i+1}.mp3`);if(l)uploads.push(`Call Flow Audio "${a.name}": ${l}`);}

                      // If any uploads failed, trigger local download as fallback
                      if(!jsonLink) {
                        try {
                          const _b = new Blob([jsonStr],{type:'application/json'});
                          const _a = document.createElement('a');
                          _a.href = URL.createObjectURL(_b);
                          _a.download = `blueprint-${slug}-${dt}.json`;
                          document.body.appendChild(_a); _a.click(); document.body.removeChild(_a);
                        } catch(e){}
                      }
                      // Download any images that failed to upload
                      const failedImages = [
                        !d.floorPlanImage||uploads.some(u=>u.includes('Floor Plan')) ? null : {data:d.floorPlanImage, name:`floor-plan-${slug}.png`},
                        !d.cameraLayoutImage||uploads.some(u=>u.includes('Camera')) ? null : {data:d.cameraLayoutImage, name:`camera-layout-${slug}.png`},
                        !d.callFlowImage||uploads.some(u=>u.includes('Call Flow Diagram')) ? null : {data:d.callFlowImage, name:`call-flow-${slug}.png`},
                      ].filter(Boolean);
                      for(const fi of failedImages){
                        try {
                          const _a2 = document.createElement('a');
                          _a2.href = fi.data; _a2.download = fi.name;
                          document.body.appendChild(_a2); _a2.click(); document.body.removeChild(_a2);
                        } catch(e){}
                      }

                      const fileSection=`
${'═'.repeat(60)}
ATTACHED FILES (links expire 14 days)
${'─'.repeat(40)}
${jsonLink?`📎 Blueprint JSON (re-import to resume): ${jsonLink}`:'⚠️ JSON upload failed — file downloaded to your device'}
${uploads.join('\n')}`;

                      await ejs.send(EMAILJS_SERVICE_ID,'template_k2an72p',{
                        to_email:d.internalTeamEmail,
                        practice:d.practiceName||'New Practice',
                        sales_rep:d.salesRep||'—',
                        go_live:d.practiceType==='new'?(fmtD(d.openingDate)||'TBD'):(fmtD(d.goLiveDate)||'TBD'),
                        practice_type:d.practiceType==='new'?'New build':'Existing / fit-out',
                        summary:(fullSummary+fileSection).slice(0,45000),
                      });
                      setInternalSent(true);
                    }catch(e){console.error(e);alert('Failed to send: '+(e.message||e.text||JSON.stringify(e)));}
                    setInternalSending(false);
                  }}
                  style={{ flex:2, padding:'10px', borderRadius:8, background:internalSent?C.green:C.navyMid, color:C.white, border:'none', fontSize:13, fontWeight:700, cursor:!d.internalTeamEmail||internalSending||internalSent?'default':'pointer', opacity:!d.internalTeamEmail?.6:1, fontFamily:'Sora,sans-serif' }}>
                  {internalSent?'✓ Sent':internalSending?'Uploading files & sending…':'Send to Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PhaseHeader num={6} title="Practice Success Blueprint" sub="Your complete technology solution, tailored for your practice." />

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg, #0F172A 0%, #1A2D45 60%, #0F172A 100%)", borderRadius:16, padding:"28px 30px", marginBottom:24, position:"relative", overflow:"hidden", borderTop:"3px solid #F97316" }}>
        <svg style={{position:"absolute",top:0,right:0,width:"100%",height:"100%",opacity:.09,pointerEvents:"none"}} viewBox="0 0 400 200" preserveAspectRatio="xMaxYMid slice"><polygon points="330,10 370,10 390,44 370,78 330,78 310,44" fill="none" stroke="#F97316" strokeWidth="2"/><polygon points="356,58 396,58 416,92 396,126 356,126 336,92" fill="rgba(249,115,22,0.25)"/><polygon points="288,38 318,38 333,63 318,88 288,88 273,63" fill="none" stroke="#F97316" strokeWidth="1.5"/><polygon points="308,98 338,98 353,123 338,148 308,148 293,123" fill="none" stroke="#64748B" strokeWidth="1"/><polygon points="360,128 385,128 397,149 385,170 360,170 348,149" fill="none" stroke="#F97316" strokeWidth="1"/><polygon points="370,-12 410,-12 430,22 410,56 370,56 350,22" fill="none" stroke="#64748B" strokeWidth="1"/></svg>
        <img src="data:image/png;base64,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" width="110" height="137" alt="" style={{objectFit:"contain",position:"absolute",bottom:-15,right:16,opacity:.12,pointerEvents:"none"}} />
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:".14em", color:C.orange, textTransform:"uppercase", marginBottom:10, position:"relative", display:"flex", alignItems:"center", gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 20 20"><polygon points="10,1 19,6 19,14 10,19 1,14 1,6" stroke="#F97316" strokeWidth="2" fill="rgba(249,115,22,.2)"/></svg>
          Practice Success Blueprint
        </div>
        <h3 style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:28, margin:"0 0 6px", color:C.white, position:"relative" }}>{d.practiceName||'Your Practice'}</h3>
        <p style={{ margin:"0 0 18px", color:"#94A3B8", fontSize:15, position:"relative" }}>
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

      {/* Existing IT Provider summary */}
      {d.practiceType==='existing' && d.existingIT && d.existingITCompany && (
        <SumSection title="Existing IT Provider">
          <SumRow label="Company" value={d.existingITCompany||null} />
          <SumRow label="Contract Type" value={d.existingITType||null} />
          <SumRow label="Contact" value={[d.existingITContact,d.existingITPhone].filter(Boolean).join(' · ')||null} />
          <SumRow label="Contract Expiry" value={d.existingITExpiry||null} />
          <SumRow label="Manages" value={[d.existingITManagesDevices!==false&&'Devices',d.existingITManagesEmail!==false&&'Email',d.existingITManagesPhones!==false&&'Phones',d.existingITManagesInternet!==false&&'Internet',d.existingITManagesSecurity!==false&&'Security'].filter(Boolean).join(', ')||null} />
          {[{k:'takeoverDevices',l:'Devices'},{k:'takeoverEmail',l:'Email'},{k:'takeoverPhones',l:'Phones'},{k:'takeoverInternet',l:'Internet'},{k:'takeoverSecurity',l:'Security'}].filter(t=>d[t.k]).length>0&&(
            <SumRow label="32 Byte taking over" value={[{k:'takeoverDevices',l:'Devices'},{k:'takeoverEmail',l:'Email'},{k:'takeoverPhones',l:'Phones'},{k:'takeoverInternet',l:'Internet'},{k:'takeoverSecurity',l:'Security'}].filter(t=>d[t.k]).map(t=>t.l).join(', ')} />
          )}
        </SumSection>
      )}

      {/* Summary sections */}
      {d.q1req !== false && (
        <SumSection title="IT Infrastructure">
          {(rooms||[]).length>0&&(
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden',marginBottom:8}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',background:C.navyMid,padding:'6px 10px',gap:8}}>
                {['Location','Type / Model','Specs','Status'].map(h=><div key={h} style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</div>)}
              </div>
              {(rooms||[]).map((r,ri)=>{
                const dev=DEVICE_OPTIONS.find(o=>o.v===r.deviceType)||DEVICE_OPTIONS[5];
                const isExist=r.existingPC&&!r.replacePC, isReplace=r.existingPC&&r.replacePC;
                const inferA = r.pcCpu?cpuAgeYears(r.pcCpu):null;
                const age = parseInt(r.pcAge)||inferA||0;
                const statusColor = isReplace?C.orange:isExist&&age>=5?C.red:isExist&&age>=3?C.amber:C.green;
                const statusLabel = isReplace?'Replace':isExist&&age>=5?'EOL':isExist&&age>=3?'O/W':'OK';
                const oldSpecs = [r.pcCpu&&r.pcCpu.replace(/Intel\(R\)|Core\(TM\)|@/g,'').replace(/\s+/g,' ').trim(),r.pcRam,r.pcStorage].filter(Boolean).join(' · ');
                const newSpecs = [r.monitor&&r.monitor!=='No Monitor'&&r.monitor,r.kbMouse&&'KB+Mouse',r.database&&'RAID'].filter(Boolean).join(' · ')||'Standard config';
                return (
                  <div key={r.id} style={{borderTop:ri>0?`1px solid ${C.border}`:'none',background:ri%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                    {/* Standard row */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',padding:'8px 10px',gap:8}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{r.name||'Room'}{r.deviceName&&r.deviceName!==r.name?<span style={{fontWeight:400,color:C.textMuted,fontSize:11}}> · {r.deviceName}</span>:''}</div>
                      <div style={{fontSize:12}}>
                        {isExist&&!isReplace&&<span style={{color:'#94A3B8'}}>{r.pcBrand||'Existing PC'}</span>}
                        {isReplace&&<span style={{color:C.red,textDecoration:'line-through',fontSize:11}}>{r.pcBrand||'Existing PC'}</span>}
                        {!isExist&&!isReplace&&<span style={{color:C.green,fontWeight:600}}>{dev.label}{n(r.qty)>1?` ×${r.qty}`:''}</span>}
                      </div>
                      <div style={{fontSize:11,color:'#94A3B8',lineHeight:1.5}}>
                        {isExist||isReplace ? oldSpecs||'—' : newSpecs}
                      </div>
                      <div style={{display:'flex',alignItems:'center'}}>
                        {isExist&&!isReplace&&<span style={{fontSize:11,fontWeight:700,color:statusColor,background:`${statusColor}22`,padding:'2px 8px',borderRadius:20}}>{statusLabel}</span>}
                        {isReplace&&<span style={{fontSize:11,fontWeight:700,color:C.orange,background:`${C.orange}22`,padding:'2px 8px',borderRadius:20}}>Replace</span>}
                        {!isExist&&!isReplace&&<span style={{fontSize:11,fontWeight:700,color:C.green,background:'rgba(16,185,129,.15)',padding:'2px 8px',borderRadius:20}}>NEW</span>}
                      </div>
                    </div>
                    {/* Replacement new device row */}
                    {isReplace&&(
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',padding:'4px 10px 8px',gap:8,background:'rgba(16,185,129,.04)'}}>
                        <div style={{fontSize:11,color:C.textMuted}}></div>
                        <div style={{fontSize:12,color:C.green,fontWeight:600}}>→ {dev.label}</div>
                        <div style={{fontSize:11,color:C.green,lineHeight:1.5}}>{newSpecs}</div>
                        <div style={{display:'flex',alignItems:'center'}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.green,background:'rgba(16,185,129,.15)',padding:'2px 8px',borderRadius:20}}>NEW</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <SumRow label="Switch" value={d.switchType||null} />
          <SumRow label="Wi-Fi" value={d.wifiAPs?`${d.wifiAPs}× UniFi U7 Pro${d.apMount?` (${d.apMount}${d.apMount==='Not mounted'?` — ${d.apMountNotes||'location TBC'}`:' mount'})`:''}`
:null} />
          <SumRow label="Firewall" value={d.firewall?'UDM Pro':null} />
          <SumRow label="4G Failover" value={d.failover?'Teltonika TRB140':null} />
          <SumRow label="Security Cameras" value={d.cameras?`${d.cameraCount||'?'}× · ${d.nvrStorage||'NVR TBC'}`:null} />
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
          <SumRow label="Advanced Cyber Security" value={d.advancedCyber?'Selected':null} />
          <SumRow label="BCDR Appliance" value={d.datto?'Datto Siris — included on 36-month term':null} />
          <SumRow label="Cloud Backup" value={d.cloudBackup?'Included':null} />
        </SumSection>
      )}

      {(d.vendors||[]).length>0&&(
        <SumSection title="Project Vendors">
          {(d.vendors||[]).map(v=>(
            <div key={v.id} style={{padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <span style={{fontSize:13,fontWeight:600,color:C.textSecondary}}>{v.type||(v.customType||'Vendor')}</span>
                {v.installResp&&<span style={{fontSize:11,fontWeight:700,color:v.installResp==='32 Byte'?C.green:v.installResp==='Vendor'?C.amber:C.textMuted,background:`${v.installResp==='32 Byte'?C.green:v.installResp==='Vendor'?C.amber:'#64748B'}22`,padding:'1px 7px',borderRadius:10}}>Install: {v.installResp}</span>}
              </div>
              <div style={{fontSize:13,color:C.textPrimary,fontWeight:600,marginTop:2}}>{v.company||'—'}</div>
              {(v.contact||v.phone||v.email)&&<div style={{fontSize:12,color:C.textMuted,marginTop:1}}>{[v.contact,v.phone,v.email].filter(Boolean).join(' · ')}</div>}
            </div>
          ))}
        </SumSection>
      )}

      {/* Meeting notes */}
      <Divider label="Meeting Notes" />
      <Field label="Notes for the client">
        <Textarea value={d.notes||''} onChange={v=>u('notes',v)} rows={3} disabled={!!locked}
          placeholder="Anything discussed that should appear in the client summary or follow-up email…" />
      </Field>
      {!locked && (
        <>
          <div onClick={()=>setShowActionPts(v=>!v)} style={{display:'flex',alignItems:'center',gap:10,margin:'28px 0 0',cursor:'pointer',userSelect:'none'}}>
            <div style={{height:1,flex:1,background:'rgba(255,255,255,.12)'}}/>
            <span style={{fontSize:11,fontWeight:800,color:'#94A3B8',letterSpacing:'.1em',textTransform:'uppercase',whiteSpace:'nowrap',background:C.bg,padding:'0 4px',display:'flex',alignItems:'center',gap:6}}>
              {showActionPts?'▼':'▶'} Action Points, Follow-ups & Risks
              <span style={{fontSize:10,fontWeight:600,color:'#64748B',background:C.surface,padding:'2px 7px',borderRadius:10}}>Internal only</span>
            </span>
            <div style={{height:1,flex:1,background:'rgba(255,255,255,.12)'}}/>
          </div>
          {showActionPts && (
            <div style={{marginTop:14}}>
              <InfoBox>Not shown to the client. Included in the internal team summary.</InfoBox>
              <Field label="Action Points" hint="What needs to happen immediately after this meeting?">
                <Textarea value={d.actionPoints||''} onChange={v=>u('actionPoints',v)} rows={3} placeholder="e.g. Build quotes in KQM, contact builder re cabling, confirm M365 tenant details…" />
              </Field>
              <Field label="Follow-ups Required" hint="Items waiting on the client or third parties">
                <Textarea value={d.followUps||''} onChange={v=>u('followUps',v)} rows={3} placeholder="e.g. Practice to confirm M365 licence list, builder to confirm data point locations…" />
              </Field>
              <Field label="Risks & Notes" hint="Anything that could affect the project timeline or scope">
                <Textarea value={d.risks||''} onChange={v=>u('risks',v)} rows={3} placeholder="e.g. Medfin quote format required, imaging vendor expects to install software…" />
              </Field>
            </div>
          )}
        </>
      )}
      {!locked && (
        <Field label="Internal Team Email" hint="Used for the internal summary — add before locking">
          <Input type="email" value={d.internalTeamEmail||''} onChange={v=>u('internalTeamEmail',v)} placeholder="team@32byte.com.au" />
        </Field>
      )}

      {/* KQM Links */}
      <Divider label="KQM Quote Links (Internal)" />
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[
          { label:'Solution 1 — Hardware & Infrastructure', url:d.q1url, req:d.q1req, uk:'q1url' },
          { label:'Solution 2 — Telecommunications',        url:d.q2url, req:d.q2req, uk:'q2url' },
          { label:'Solution 3 — Managed Services',          url:d.q3url, req:d.q3req, uk:'q3url' },
        ].filter(q=>q.req!==false).map(({ label, url, uk })=>(
          <div key={label} style={{ padding:'10px 14px', background:C.surfaceHi, border:`1px solid ${url?C.orangeBorder:C.border}`, borderRadius:9 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>{label}</span>
              {url && <a href={url} target="_blank" rel="noreferrer" style={{ fontSize:12, fontWeight:700, color:C.orange }}>Open Quote ↗</a>}
            </div>
            <input type="url" value={url||''} onChange={e=>u(uk,e.target.value)}
              placeholder="Paste KQM quote URL here…"
              style={{width:'100%',padding:'6px 10px',borderRadius:7,background:'rgba(0,0,0,.25)',border:`1px solid ${C.border}`,color:C.textPrimary,fontSize:12,outline:'none',boxSizing:'border-box',marginTop:8,display:(locked&&url)?'none':'block'}} />
          </div>
        ))}
      </div>

            {/* Incomplete items checker */}
      {(() => {
        const warnings = [];
        // Imaging DB device names
        (d.intraoralScanners||[]).forEach((s,i)=>{ if(s.database && !s.dbDeviceName) warnings.push({text:`Intraoral Scanner ${i+1}: database device name not entered`, step:3}); });
        (d.xrayMachines||[]).forEach((x,i)=>{ if(x.database && !x.dbDeviceName) warnings.push({text:`X-ray Machine ${i+1}: database device name not entered`, step:3}); });
        // Existing IT provider details
        if(d.practiceType==='existing' && d.existingIT) {
          if(!d.existingITCompany) warnings.push({text:'Existing IT provider: company name missing', step:1});
          ['existingITManagesDevices','existingITManagesEmail','existingITManagesPhones','existingITManagesInternet','existingITManagesSecurity'].forEach(k=>{
            if(d[k]===false){
              const labels={existingITManagesDevices:'Devices',existingITManagesEmail:'Email',existingITManagesPhones:'Phones',existingITManagesInternet:'Internet',existingITManagesSecurity:'Security'};
              const subK={existingITManagesDevices:'existingITDevices',existingITManagesEmail:'existingITEmail_',existingITManagesPhones:'existingITPhones',existingITManagesInternet:'existingITInternet',existingITManagesSecurity:'existingITSecurity'};
              const sub = d[subK[k]];
              if(!sub||!sub.company) warnings.push({text:`${labels[k]}: responsible party not captured`, step:1});
            }
          });
        }
        // Handset details
        (d.handsets||[]).forEach(h=>{
          if(n(h.qty)>0 && h.model!=='Other'){
            const missing = Array.from({length:n(h.qty)}).filter((_,i)=>!(h.devices||[])[i]?.extension).length;
            if(missing>0) warnings.push({text:`${h.model} handsets: ${missing} device${missing!==1?'s':''} missing extension details`, step:4});
          }
        });
        (d.cordless||[]).forEach(h=>{
          if(n(h.qty)>0 && h.model!=='Other'){
            const missing = Array.from({length:n(h.qty)}).filter((_,i)=>!(h.devices||[])[i]?.extension).length;
            if(missing>0) warnings.push({text:`${h.model} cordless: ${missing} device${missing!==1?'s':''} missing extension details`, step:4});
          }
        });
        // BCDR sizing
        if(d.datto && !d.dattoDataVolume) warnings.push({text:'BCDR Appliance: data volume not selected — cannot recommend Datto model', step:5});
        // M365 existing
        if(d.existingM365 && (d.m365Users||[]).length===0) warnings.push({text:'M365: existing licences flagged but no users captured', step:3});
        // Camera layout
        if(d.cameras && n(d.cameraCount)>0 && !d.cameraLayoutImage) warnings.push({text:'Security cameras: no layout/location diagram uploaded', step:3});
        // Missing contact email
        if(!d.contactEmail) warnings.push({text:'No client email address — cannot send follow-up email', step:1});

        if(!warnings.length) return null;
        const warnText = w => typeof w === 'string' ? w : w.text;
        return (
          <div style={{marginBottom:20}}>
            <div style={{background:'rgba(245,158,11,.12)',border:`1.5px solid ${C.amber}`,borderRadius:12,padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <span style={{fontSize:18}}>⚠️</span>
                <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:14,color:C.amber}}>Additional information may be required</div>
              </div>
              <div style={{fontSize:13,color:'#FDE68A',marginBottom:10,lineHeight:1.5}}>The following items were not fully completed. Click any item to go to that section.</div>
              {warnings.map((w,i)=>(
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,padding:'5px 0',borderTop:i>0?`1px solid rgba(245,158,11,.2)`:'none'}}>
                  <span style={{color:C.amber,fontSize:13,flexShrink:0,marginTop:1}}>•</span>
                  <button onClick={()=>goStep&&goStep(w.step||0)} style={{fontSize:13,color:'#FDE68A',background:'none',border:'none',cursor:goStep?'pointer':'default',textAlign:'left',textDecoration:goStep?'underline':'none',textDecorationColor:'rgba(253,230,138,.4)',padding:0,fontFamily:'inherit'}}>
                    {w.text||w}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
const newScanner  = () => ({ id:uid(), model:'', software:'', dedicated:false, database:false, dbDeviceName:'', installed:false, notes:'' });
const newXray     = () => ({ id:uid(), model:'', type:'', software:'', timing:'', dedicated:false, database:false, dbDeviceName:'', installed:false, notes:'' });
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
  newNetworking:false, existing4G:false, existing4GModel:'', existing4GProvider:'', existing4GManagedBy:'',
  backupType:'none', dattoDataVolume:'', dattoDeviceCount:'', dattoNotes:'', cloudBackupNotes:'', backupDevices:[],
  actionPoints:'', followUps:'', risks:'',
  callFlowImage:null, callFlowFileName:'', callFlowAudio:[],
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
  const valRef = useRef('');

  const submit = () => {
    if(locked) return;
    const entered = valRef.current.trim().replace(/[\u2018\u2019\u201C\u201D]/g, '');
    const expected = APP_PASSWORD.trim().replace(/[\u2018\u2019\u201C\u201D]/g, '');
    if(entered === expected) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuth();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setVal('');
      valRef.current = '';
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
      <div style={{ width:'100%', maxWidth:420, padding:'0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32, display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:320, height:61, margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="data:image/png;base64,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" width="320" height="61" alt="32 Byte" style={{objectFit:"contain"}} />
          </div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:C.textPrimary, marginBottom:4 }}>32 Byte</div>
          <div style={{ fontSize:13, color:C.textMuted, letterSpacing:'.08em', textTransform:'uppercase', fontWeight:600 }}>Practice Success Blueprint</div>
        </div>

        {/* Card */}
        <div style={{ background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:16, padding:'32px 28px' }}>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:18, color:C.textPrimary, marginBottom:6 }}>Staff Access Only</div>
          <div style={{ fontSize:14, color:C.textSecondary, marginBottom:24, lineHeight:1.6 }}>This tool is for internal use. Enter the team password to continue.</div>

          <label style={{ display:'block', fontWeight:600, fontSize:11, color:C.textSecondary, marginBottom:6, letterSpacing:'.06em', textTransform:'uppercase' }}>Password</label>
          <div
            tabIndex={0}
            onKeyDown={e=>{
              if(locked) return;
              if(e.key==='Backspace'){ e.preventDefault(); setVal(v=>{ const n=v.slice(0,-1); valRef.current=n; return n; }); return; }
              if(e.key.length===1 && !e.ctrlKey && !e.metaKey){ e.preventDefault(); setVal(v=>{ const n=v+e.key; valRef.current=n; return n; }); }
            }}
            style={{ width:'100%', padding:'12px 14px', fontSize:15, border:`1.5px solid ${error?C.red:C.border}`, borderRadius:9, background:C.surfaceHi, color:C.textPrimary, fontFamily:'inherit', marginBottom:14, outline:'none', cursor:'text', minHeight:46, letterSpacing:'0.2em', userSelect:'none' }}
            autoFocus
          >{val.length>0?val.replace(/./g,'●'):<span style={{color:'rgba(255,255,255,.25)',letterSpacing:'normal',fontSize:14}}>Click here and type password…</span>}</div>

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
    <Phase6 d={d} u={u} locked={locked} onLock={()=>setLocked(new Date().toISOString())} rooms={d.rooms} goStep={goStep} />,
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
              <div style={{ width:251, height:48, flexShrink:0 }}>
                <img src="data:image/png;base64,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" width="251" height="48" alt="32 Byte" style={{objectFit:"contain"}} />
              </div>
              <div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, color:C.white, lineHeight:1.2 }}>32 Byte</div>
                <div style={{ fontSize:12, color:'#64748B' }}>Dental IT Specialists</div>
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
                  <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:isDone&&!isA?C.orange:isA?'rgba(249,115,22,.2)':'rgba(255,255,255,.05)' }}>
                    {outOfScope
                      ? <span style={{ fontSize:11, color:'#64748B', fontWeight:700 }}>—</span>
                      : isDone&&!isA
                        ? <span style={{ fontSize:11, color:C.white, fontWeight:700 }}>✓</span>
                        : <span style={{ fontSize:11, fontWeight:700, color:isA?C.orange:'#3D506B' }}>{i+1}</span>}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:isA?C.white:outOfScope?'#3D506B':isDone?'#94A3B8':'#CBD5E1', fontFamily:'Sora,sans-serif', lineHeight:1.3, textDecoration:outOfScope?'line-through':'none' }}>{s.label}</div>
                    <div style={{ fontSize:11, color:isA?'#FED7AA':isDone?'#64748B':'#94A3B8', marginTop:1 }}>{outOfScope?'Not in scope':s.sub}</div>
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
