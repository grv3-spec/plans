// ══════════════════════════════════════
// DATA
// ══════════════════════════════════════
const USERS = {
  'dr.rivera': { password: 'vet123', role: 'vet', name: 'Dr. Rivera' },
  'jordan':    { password: 'owner123', role: 'owner', name: 'Jordan Lee' }
};

let currentUser = null;
let currentPlanId = null;
let vetTabFilter = 'all';

// Sample treatment plans
let plans = [
  {
    id: 1,
    pet: 'Mochi',
    petEmoji: '🐕',
    owner: 'Jordan Lee',
    diagnosis: 'Anterior cruciate ligament (ACL) tear in the right hind leg, confirmed by physical examination and radiographic imaging.',
    treatment: 'Tibial Plateau Leveling Osteotomy (TPLO) surgery is recommended. This involves surgical correction of the tibial plateau angle to restore joint stability. Post-op physical therapy and restricted activity for 8–12 weeks.',
    cost: '$3,200',
    costRaw: 3200,
    outcome: 'Full recovery expected in 3–4 months with proper rehabilitation.',
    risks: 'Risks include surgical complications (rare, <2%), infection, and implant failure. Benefits include permanent joint stabilization and return to full activity.',
    notes: 'Pre-op bloodwork required. Fasting 12 hours before procedure.',
    status: 'pending',
    date: 'April 24, 2026',
    revisionNotes: null
  },
  {
    id: 2,
    pet: 'Biscuit',
    petEmoji: '🐈',
    owner: 'Jordan Lee',
    diagnosis: 'Chronic kidney disease (CKD) Stage 2. Elevated BUN and creatinine levels detected in routine bloodwork.',
    treatment: 'Prescription renal diet (Hill\'s k/d), increased water intake via wet food, subcutaneous fluid therapy twice weekly, and bi-monthly bloodwork monitoring.',
    cost: '$180/month',
    costRaw: 180,
    outcome: 'Disease progression slowed significantly. Quality of life maintained.',
    risks: 'Without treatment, CKD will progress rapidly. Treatment benefits include extended life expectancy and improved comfort. Minor risk of fluid overload with subcutaneous therapy.',
    notes: 'Schedule follow-up in 6 weeks for bloodwork recheck.',
    status: 'revision',
    date: 'April 20, 2026',
    revisionNotes: 'I am concerned about the monthly cost. Can we explore a less frequent fluid therapy schedule or a more affordable diet option?'
  },
  {
    id: 3,
    pet: 'Mochi',
    petEmoji: '🐕',
    owner: 'Jordan Lee',
    diagnosis: 'Mild dental disease (Grade 2). Tartar buildup and early gingivitis affecting molars.',
    treatment: 'Professional dental cleaning under general anesthesia, dental radiographs, and possible extraction of compromised teeth. Home dental care regimen post-procedure.',
    cost: '$650',
    costRaw: 650,
    outcome: 'Improved oral health, reduced infection risk, fresher breath.',
    risks: 'Low anesthetic risk given patient\'s age and health. Extractions may be needed if root damage is found on X-ray.',
    notes: '',
    status: 'approved',
    date: 'April 15, 2026',
    revisionNotes: null
  }
];

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════
let selectedRole = 'vet';

function selectRole(role) {
  selectedRole = role;
  document.getElementById('role-vet').classList.toggle('selected', role === 'vet');
  document.getElementById('role-owner').classList.toggle('selected', role === 'owner');
}

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');

  const user = USERS[username];
  if (!user || user.password !== password || user.role !== selectedRole) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  currentUser = user;

  if (user.role === 'vet') {
    renderVetDashboard();
    showPage('vet-dashboard-page');
  } else {
    renderOwnerDashboard();
    showPage('owner-dashboard-page');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-page').classList.contains('active')) login();
});

function logout() {
  currentUser = null;
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('login-error').style.display = 'none';
  showPage('login-page');
}

// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ══════════════════════════════════════
// VET DASHBOARD
// ══════════════════════════════════════
function renderVetDashboard() {
  const pending = plans.filter(p => p.status === 'pending').length;
  const revision = plans.filter(p => p.status === 'revision').length;
  document.getElementById('stat-total').textContent = plans.length;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-revision').textContent = revision;
  renderVetPlanList(vetTabFilter);
}

function vetTab(filter, el) {
  vetTabFilter = filter;
  document.querySelectorAll('#vet-dashboard-page .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderVetPlanList(filter);
}

function renderVetPlanList(filter) {
  const container = document.getElementById('vet-plan-list');
  let filtered = plans;
  if (filter !== 'all') filtered = plans.filter(p => p.status === filter);

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><div class="icon">📋</div><h3>No plans in this category</h3><p>Plans will appear here once created.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="vet-plan-row">
      <div style="font-size:1.8rem;">${p.petEmoji}</div>
      <div class="pet-info">
        <b>${p.pet}</b>
        <span>${p.diagnosis.substring(0,70)}…</span>
        <span style="margin-top:0.15rem;">${p.date}</span>
      </div>
      <div class="row-actions">
        <span class="status ${statusClass(p.status)}">${statusLabel(p.status)}</span>
        <button class="btn btn-outline btn-sm" onclick="openVetView(${p.id})">View →</button>
      </div>
    </div>
  `).join('');
}

function openVetView(id) {
  const plan = plans.find(p => p.id === id);
  currentPlanId = id;

  document.getElementById('vv-title').textContent = `${plan.pet}'s Treatment Plan`;
  document.getElementById('vv-meta').textContent = `Submitted: ${plan.date} · Owner: ${plan.owner}`;
  document.getElementById('vv-status-badge').innerHTML = `<span class="status ${statusClass(plan.status)}">${statusLabel(plan.status)}</span>`;
  document.getElementById('vv-pet').textContent = `${plan.petEmoji} ${plan.pet}`;
  document.getElementById('vv-owner').textContent = plan.owner;
  document.getElementById('vv-diagnosis').textContent = plan.diagnosis;
  document.getElementById('vv-treatment').textContent = plan.treatment;
  document.getElementById('vv-cost').textContent = plan.cost;
  document.getElementById('vv-outcome').textContent = plan.outcome || '—';
  document.getElementById('vv-risks').textContent = plan.risks || '—';

  // Revision notes
  const revEl = document.getElementById('vv-revision-note');
  if (plan.status === 'revision' && plan.revisionNotes) {
    revEl.innerHTML = `<div class="notes-box"><div class="notes-label">📝 Owner Revision Request</div><p>${plan.revisionNotes}</p></div>`;
  } else {
    revEl.innerHTML = '';
  }

  // Actions
  const actEl = document.getElementById('vv-actions');
  const editEl = document.getElementById('vv-edit-area');
  if (plan.status === 'revision') {
    editEl.innerHTML = `
      <div class="divider"></div>
      <h3 style="font-weight:600;margin-bottom:0.75rem;">✏️ Revise & Resubmit</h3>
      <div class="vet-form">
        <div class="form-full"><label>Updated Treatment</label><textarea id="edit-treatment" rows="3">${plan.treatment}</textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;" class="form-full">
          <div><label>Updated Cost</label><input type="text" id="edit-cost" value="${plan.costRaw}"></div>
          <div><label>Updated Outcome</label><input type="text" id="edit-outcome" value="${plan.outcome}"></div>
        </div>
        <div class="form-full"><label>Updated Risks &amp; Benefits</label><textarea id="edit-risks" rows="2">${plan.risks}</textarea></div>
      </div>
    `;
    actEl.innerHTML = `<button class="btn btn-primary" onclick="resubmitPlan()">📤 Resubmit to Owner</button><button class="btn btn-outline" onclick="showPage('vet-dashboard-page')">Back</button>`;
  } else {
    editEl.innerHTML = '';
    actEl.innerHTML = `<button class="btn btn-outline" onclick="showPage('vet-dashboard-page')">← Back to Dashboard</button>`;
  }

  showPage('vet-view-page');
}

function resubmitPlan() {
  const plan = plans.find(p => p.id === currentPlanId);
  plan.treatment = document.getElementById('edit-treatment').value;
  plan.costRaw = parseFloat(document.getElementById('edit-cost').value) || plan.costRaw;
  plan.cost = '$' + plan.costRaw.toLocaleString();
  plan.outcome = document.getElementById('edit-outcome').value;
  plan.risks = document.getElementById('edit-risks').value;
  plan.status = 'pending';
  plan.revisionNotes = null;
  plan.date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  renderVetDashboard();
  openVetView(currentPlanId);
  alert('✅ Revised plan submitted to the owner!');
}

// ══════════════════════════════════════
// VET CREATE PLAN
// ══════════════════════════════════════
function submitPlan() {
  const pet = document.getElementById('create-pet').value;
  const diagnosis = document.getElementById('create-diagnosis').value.trim();
  const treatment = document.getElementById('create-treatment').value.trim();
  const cost = document.getElementById('create-cost').value;
  const errEl = document.getElementById('create-error');

  if (!pet || !diagnosis || !treatment || !cost) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const emoji = pet === 'Mochi' ? '🐕' : pet === 'Biscuit' ? '🐈' : '🐠';
  const costNum = parseFloat(cost);

  plans.push({
    id: Date.now(),
    pet,
    petEmoji: emoji,
    owner: 'Jordan Lee',
    diagnosis,
    treatment,
    cost: '$' + costNum.toLocaleString(),
    costRaw: costNum,
    outcome: document.getElementById('create-outcome').value,
    risks: document.getElementById('create-risks').value,
    notes: document.getElementById('create-notes').value,
    status: 'pending',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    revisionNotes: null
  });

  // Reset form
  ['create-pet','create-diagnosis','create-treatment','create-cost','create-outcome','create-risks','create-notes'].forEach(id => {
    const el = document.getElementById(id);
    el.tagName === 'SELECT' ? (el.selectedIndex = 0) : (el.value = '');
  });

  renderVetDashboard();
  showPage('vet-dashboard-page');
  setTimeout(() => alert('✅ Treatment plan submitted to Jordan Lee!'), 100);
}

// ══════════════════════════════════════
// OWNER DASHBOARD
// ══════════════════════════════════════
function renderOwnerDashboard() {
  const pending = plans.filter(p => p.status === 'pending');
  const bannerEl = document.getElementById('owner-banner');

  if (pending.length > 0) {
    bannerEl.innerHTML = `<div class="banner banner-warn"><span class="banner-icon">🔔</span>You have <strong>${pending.length} treatment plan${pending.length > 1 ? 's' : ''}</strong> awaiting your review and approval.</div>`;
  } else {
    bannerEl.innerHTML = '';
  }

  const listEl = document.getElementById('owner-plan-list');
  if (!plans.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="icon">🐾</div><h3>No treatment plans yet</h3><p>Your vet will create a plan once your pet has been assessed.</p></div>`;
    return;
  }

  listEl.innerHTML = plans.map(p => `
    <div class="plan-card" onclick="openOwnerView(${p.id})">
      <div class="pet-icon">${p.petEmoji}</div>
      <div class="info">
        <div class="pet-name">${p.pet}</div>
        <div class="diagnosis">${p.diagnosis.substring(0, 80)}…</div>
        <div class="meta">Submitted: ${p.date} · Estimated cost: ${p.cost}</div>
      </div>
      <div class="right">
        <span class="status ${statusClass(p.status)}">${statusLabel(p.status)}</span>
        <div style="font-size:0.78rem;color:var(--mid);margin-top:0.4rem;">Tap to view →</div>
      </div>
    </div>
  `).join('');
}

function openOwnerView(id) {
  const plan = plans.find(p => p.id === id);
  currentPlanId = id;

  document.getElementById('ov-title').textContent = `${plan.pet}'s Treatment Plan`;
  document.getElementById('ov-meta').textContent = `Submitted: ${plan.date} · Dr. Rivera`;
  document.getElementById('ov-status-badge').innerHTML = `<span class="status ${statusClass(plan.status)}">${statusLabel(plan.status)}</span>`;
  document.getElementById('ov-pet').textContent = `${plan.petEmoji} ${plan.pet}`;
  document.getElementById('ov-diagnosis').textContent = plan.diagnosis;
  document.getElementById('ov-treatment').textContent = plan.treatment;
  document.getElementById('ov-cost').textContent = plan.cost;
  document.getElementById('ov-outcome').textContent = plan.outcome || '—';
  document.getElementById('ov-risks').textContent = plan.risks || '—';

  const actionArea = document.getElementById('ov-action-area');

  if (plan.status === 'pending') {
    actionArea.innerHTML = `
      <div class="divider"></div>
      <h3 style="font-weight:600;font-size:1rem;margin-bottom:0.5rem;">Ready to decide?</h3>
      <p style="color:var(--mid);font-size:0.88rem;margin-bottom:1rem;">Review all details above before making your decision. You can approve the plan or request changes.</p>
      <div class="actions-row">
        <button class="btn btn-success" onclick="openApproveModal()">✅ Approve Treatment Plan</button>
        <button class="btn btn-warning" onclick="openRevisionModal()">📝 Request Revision</button>
      </div>
    `;
  } else if (plan.status === 'approved') {
    actionArea.innerHTML = `
      <div class="banner banner-success" style="margin-top:1.5rem;"><span class="banner-icon">✅</span>You have approved this treatment plan. The veterinary team has been notified.</div>
      <div class="actions-row"><button class="btn btn-outline" onclick="showPage('owner-dashboard-page')">← Back to Dashboard</button></div>
    `;
  } else if (plan.status === 'revision') {
    actionArea.innerHTML = `
      <div class="notes-box" style="margin-top:1.5rem;"><div class="notes-label">📝 Your Revision Request</div><p>${plan.revisionNotes}</p></div>
      <div class="banner banner-warn" style="margin-top:1rem;"><span class="banner-icon">⏳</span>Your revision request has been sent. Dr. Rivera will review and resubmit a revised plan.</div>
      <div class="actions-row"><button class="btn btn-outline" onclick="showPage('owner-dashboard-page')">← Back to Dashboard</button></div>
    `;
  }

  showPage('owner-view-page');
}

// ══════════════════════════════════════
// MODALS
// ══════════════════════════════════════
function openApproveModal() {
  document.getElementById('sign-date').textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('approve-modal').classList.add('open');
}

function openRevisionModal() {
  document.getElementById('revision-text').value = '';
  document.getElementById('revision-error').style.display = 'none';
  document.getElementById('revision-modal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function confirmApprove() {
  const plan = plans.find(p => p.id === currentPlanId);
  plan.status = 'approved';
  closeModal('approve-modal');

  document.getElementById('confirm-content').innerHTML = `
    <div class="confirm-icon">✅</div>
    <h2>Treatment Approved!</h2>
    <p>You have approved the treatment plan for <strong>${plan.pet}</strong>. Dr. Rivera and the veterinary team have been notified and treatment may now begin.</p>
    <div style="background:var(--green-pale);border-radius:10px;padding:1rem;margin:1rem 0;font-size:0.85rem;color:var(--green);">
      <strong>What happens next?</strong><br>The clinic will contact you to schedule your pet's procedure. Please keep your phone available.
    </div>
    <button class="btn btn-primary" onclick="renderOwnerDashboard();showPage('owner-dashboard-page')">← Back to Dashboard</button>
  `;
  renderVetDashboard();
  showPage('confirm-page');
}

function confirmRevision() {
  const notes = document.getElementById('revision-text').value.trim();
  if (!notes) {
    document.getElementById('revision-error').style.display = 'block';
    return;
  }
  const plan = plans.find(p => p.id === currentPlanId);
  plan.status = 'revision';
  plan.revisionNotes = notes;
  closeModal('revision-modal');

  document.getElementById('confirm-content').innerHTML = `
    <div class="confirm-icon">📝</div>
    <h2>Revision Requested!</h2>
    <p>Your revision request for <strong>${plan.pet}'s</strong> treatment plan has been sent to Dr. Rivera.</p>
    <div style="background:var(--amber-pale);border-radius:10px;padding:1rem;margin:1rem 0;font-size:0.85rem;color:var(--amber);">
      <strong>Your notes:</strong><br>${notes}
    </div>
    <p style="font-size:0.85rem;">Dr. Rivera will review your notes and submit a revised plan. You'll be able to review and approve the updated plan on your dashboard.</p>
    <button class="btn btn-primary" onclick="renderOwnerDashboard();showPage('owner-dashboard-page')">← Back to Dashboard</button>
  `;
  renderVetDashboard();
  showPage('confirm-page');
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
function statusClass(s) {
  return { pending: 'status-pending', approved: 'status-approved', revision: 'status-revision', draft: 'status-draft' }[s] || '';
}
function statusLabel(s) {
  return { pending: '⏳ Pending Review', approved: '✅ Approved', revision: '📝 Revision Requested', draft: 'Draft' }[s] || s;
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
</script>
