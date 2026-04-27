// ══════════════════════════════════════════════════════════════
// VetPlan — Shared App Logic (app.js)
// Used by: index.html, vet-dashboard.html, owner-dashboard.html,
//          create-plan.html, review-plan.html
// ══════════════════════════════════════════════════════════════

const VetPlan = (() => {

  // ── SAMPLE DATA ─────────────────────────────────────────────
  const DEFAULT_PLANS = [
    {
      id: '1',
      petName: 'Mochi',
      petSpecies: 'Dog',
      petBreed: 'Shiba Inu',
      ownerName: 'Jordan Lee',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Anterior cruciate ligament (ACL) tear in the right hind leg, confirmed by physical examination and radiographic imaging.',
      treatment: 'Tibial Plateau Leveling Osteotomy (TPLO) surgery is recommended. This involves surgical correction of the tibial plateau angle to restore joint stability. Post-op physical therapy and restricted activity for 8–12 weeks.',
      cost: '3200.00',
      benefits: 'Full recovery expected in 3–4 months with proper rehabilitation. Permanent joint stabilization and return to full activity.',
      risks: 'Surgical complications (rare, <2%), infection, and implant failure.',
      notes: 'Pre-op bloodwork required. Fasting 12 hours before procedure.',
      status: 'pending',
      createdDate: '2026-04-24',
      revisionNote: null,
    },
    {
      id: '2',
      petName: 'Biscuit',
      petSpecies: 'Cat',
      petBreed: 'Domestic Shorthair',
      ownerName: 'Jordan Lee',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Chronic kidney disease (CKD) Stage 2. Elevated BUN and creatinine levels detected in routine bloodwork.',
      treatment: 'Prescription renal diet (Hill\'s k/d), increased water intake via wet food, subcutaneous fluid therapy twice weekly, and bi-monthly bloodwork monitoring.',
      cost: '180.00',
      benefits: 'Disease progression slowed significantly. Quality of life maintained and extended life expectancy.',
      risks: 'Without treatment, CKD will progress rapidly. Minor risk of fluid overload with subcutaneous therapy.',
      notes: 'Schedule follow-up in 6 weeks for bloodwork recheck.',
      status: 'revision',
      createdDate: '2026-04-20',
      revisionNote: 'I am concerned about the monthly cost. Can we explore a less frequent fluid therapy schedule or a more affordable diet option?',
    },
    {
      id: '3',
      petName: 'Mochi',
      petSpecies: 'Dog',
      petBreed: 'Shiba Inu',
      ownerName: 'Jordan Lee',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Mild dental disease (Grade 2). Tartar buildup and early gingivitis affecting molars.',
      treatment: 'Professional dental cleaning under general anesthesia, dental radiographs, and possible extraction of compromised teeth. Home dental care regimen post-procedure.',
      cost: '650.00',
      benefits: 'Improved oral health, reduced infection risk, fresher breath.',
      risks: 'Low anesthetic risk given patient\'s age and health. Extractions may be needed if root damage is found on X-ray.',
      notes: '',
      status: 'approved',
      createdDate: '2026-04-15',
      revisionNote: null,
    },
  ];

  // ── STORAGE KEYS ─────────────────────────────────────────────
  const KEY_USER  = 'vetplan_user';
  const KEY_PLANS = 'vetplan_plans';

  // ── INITIALISE PLANS (seed once) ─────────────────────────────
  function initPlans() {
    if (!localStorage.getItem(KEY_PLANS)) {
      localStorage.setItem(KEY_PLANS, JSON.stringify(DEFAULT_PLANS));
    }
  }

  // ── USER ─────────────────────────────────────────────────────
  function setUser(role, name) {
    localStorage.setItem(KEY_USER, JSON.stringify({ role, name }));
  }

  function getUser() {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  }

  function logout() {
    localStorage.removeItem(KEY_USER);
    window.location.href = 'index.html';
  }

  /**
   * Call at the top of each protected page.
   * Pass expectedRole ('vet' | 'owner') to enforce role.
   * Returns the user object, or null (and redirects) if not logged in.
   */
  function requireLogin(expectedRole) {
    initPlans();
    const user = getUser();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (expectedRole && user.role !== expectedRole) {
      window.location.href = 'index.html'; return null;
    }
    return user;
  }

  // ── PLANS ────────────────────────────────────────────────────
  function getPlans() {
    initPlans();
    return JSON.parse(localStorage.getItem(KEY_PLANS) || '[]');
  }

  function getPlanById(id) {
    return getPlans().find(p => String(p.id) === String(id)) || null;
  }

  function addPlan(planData) {
    const plans = getPlans();
    const newPlan = {
      ...planData,
      id: String(Date.now()),
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      revisionNote: null,
    };
    plans.unshift(newPlan);
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
    return newPlan;
  }

  function updatePlanStatus(id, status, revisionNote) {
    const plans = getPlans();
    const idx = plans.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    plans[idx].status = status;
    if (revisionNote !== undefined) plans[idx].revisionNote = revisionNote;
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }

  function updatePlan(id, fields) {
    const plans = getPlans();
    const idx = plans.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    plans[idx] = { ...plans[idx], ...fields };
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }

  // ── HELPERS ──────────────────────────────────────────────────
  function petEmoji(species) {
    const map = { Dog: '🐕', Cat: '🐈', Bird: '🦜', Rabbit: '🐇', Fish: '🐠', Other: '🐾' };
    return map[species] || '🐾';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function statusBadge(status) {
    const map = {
      pending:  ['status-badge status-pending',  'Awaiting Approval'],
      approved: ['status-badge status-approved', 'Approved'],
      revision: ['status-badge status-revision', 'Revision Requested'],
      draft:    ['status-badge status-draft',    'Draft'],
    };
    const [cls, label] = map[status] || ['status-badge status-draft', status];
    return `<span class="${cls}">${label}</span>`;
  }

  // Public API
  return {
    setUser, getUser, logout, requireLogin,
    getPlans, getPlanById, addPlan, updatePlanStatus, updatePlan,
    petEmoji, formatDate, statusBadge,
  };
})();
