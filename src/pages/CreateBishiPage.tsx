import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GroupCategory, PayoutRuleType } from '../types';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  Users, 
  Calculator, 
  FileText, 
  QrCode,
  Share2,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { formatINR } from '../utils/cryptoSim';

export const CreateBishiPage: React.FC = () => {
  const { createBishi, currentUser } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('Society');
  const [visibility, setVisibility] = useState<'Private' | 'Invite-only'>('Invite-only');

  // Step 2: Financial Structure
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [frequency, setFrequency] = useState<'Monthly' | 'Weekly' | 'Custom'>('Monthly');
  const [totalMembers, setTotalMembers] = useState<number>(10);
  const [durationMonths, setDurationMonths] = useState<number>(10);
  const [startDate, setStartDate] = useState('01 Jan 2027');

  // Computed Pool
  const totalPoolPerMonth = monthlyContribution * totalMembers;
  const totalCyclePool = totalPoolPerMonth * durationMonths;

  // Step 3: Payout Rules (Strictly Non-Auction)
  const [payoutRule, setPayoutRule] = useState<PayoutRuleType>('Fixed Schedule');
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);

  // Step 4: Member Invites
  const [invitedMembers, setInvitedMembers] = useState<Array<{ name: string; phone: string }>>([
    { name: 'Meera Joshi', phone: '+91 97654 11234' },
    { name: 'Riya Kulkarni', phone: '+91 98112 33490' }
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // Step 6 Created Bishi
  const [createdBishiId, setCreatedBishiId] = useState<string | null>(null);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) return;
    setInvitedMembers(prev => [...prev, { name: newMemberName, phone: newMemberPhone }]);
    setNewMemberName('');
    setNewMemberPhone('');
  };

  const handleFinalSubmit = async () => {
    setIsSubmittingGroup(true);
    try {
      const newBishi = await createBishi({
        name,
        description: description || `Community savings circle for ${category} members.`,
        category,
        monthlyContribution,
        frequency,
        totalMembers,
        durationMonths,
        currentMonth: 1,
        startDate,
        organizer: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          phone: currentUser.phone
        },
        totalPoolPerMonth,
        totalCyclePool,
        status: 'Active',
        payoutRule,
        visibility,
        nextPayoutDate: '30 Jan 2027',
        nextPayoutRecipient: invitedMembers[0]?.name || 'Meera Joshi'
      });

      setCreatedBishiId(newBishi.id);
      setCurrentStep(6);
    } catch (err) {
      console.error('Failed to create bishi on backend:', err);
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 animate-in fade-in">
      {/* Wizard Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-bottle-700 bg-bone-400 px-3 py-1 rounded-full">
          Step {currentStep} of {totalSteps}
        </span>
        <h1 className="text-3xl font-serif font-bold text-bottle-950">
          Create Community Bishi Group
        </h1>
        <p className="text-xs sm:text-sm text-bottle-800/70">
          Establish transparent rules, non-auction payout schedules, and verifiable records.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="hidden sm:flex items-center justify-between relative px-6">
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-bottle-800/15 -translate-y-1/2 z-0" />
        {[
          'Basics',
          'Financials',
          'Payout Rules',
          'Invite Members',
          'Charter Review',
          'Ready'
        ].map((title, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone 
                    ? 'bg-bottle-800 text-bone-200 shadow-sm' 
                    : isCurrent 
                    ? 'bg-crimson-700 text-bone-100 ring-4 ring-crimson-100' 
                    : 'bg-bone-400 text-bottle-800/60 border border-bottle-800/20'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-[11px] mt-1.5 font-medium ${isCurrent ? 'text-bottle-950 font-bold' : 'text-bottle-800/60'}`}>
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Wizard Form Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-bottle-800/10 shadow-premium min-h-[460px] flex flex-col justify-between">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="pb-3 border-b border-bone-600">
              <h2 className="text-lg font-serif font-bold text-bottle-950">Basic Information</h2>
              <p className="text-xs text-bottle-800/70">Define the core identity and category of this community group</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-bottle-950 block mb-1">
                  Bishi Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Navrang Society Women's Circle or Zaveri Gold Traders"
                  className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-3 text-bottle-950 outline-none focus:border-bottle-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-bottle-950 block mb-1">
                  Community Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    'Society',
                    "Women's Group",
                    'Business',
                    'Family',
                    'Professional',
                    'Personal',
                    'Community',
                    'Other'
                  ].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat as GroupCategory)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                        category === cat 
                          ? 'bg-bottle-800 text-bone-200 border-bottle-800 shadow-sm' 
                          : 'bg-bone-300/60 text-bottle-950 border-bottle-800/15 hover:bg-bone-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-bottle-950 block mb-1">
                  Group Description & Mutual Purpose
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain the purpose of this fund (e.g. emergency home repairs, annual shop stock purchase, children's school reserves)..."
                  className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-3 text-bottle-950 outline-none focus:border-bottle-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-bottle-950 block mb-1">
                    Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={e => setVisibility(e.target.value as any)}
                    className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-3 text-bottle-950 outline-none"
                  >
                    <option value="Invite-only">Invite-only (Passcode or Direct SMS)</option>
                    <option value="Private">Strict Private (Approval Required)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-bottle-950 block mb-1">
                    Designated Central Organizer
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.name} (Organizer)`}
                    className="w-full text-xs font-medium bg-bone-400/80 border border-bottle-800/10 rounded-xl p-3 text-bottle-800 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Financial Structure */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="pb-3 border-b border-bone-600">
              <h2 className="text-lg font-serif font-bold text-bottle-950">Financial Structure & Contribution Amount</h2>
              <p className="text-xs text-bottle-800/70">Define the monthly contribution, membership count, and lifecycle</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-bottle-950 block mb-1">
                    Monthly Contribution per Member (INR) *
                  </label>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={monthlyContribution}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setMonthlyContribution(val);
                    }}
                    className="w-full text-xs font-bold bg-bone-300 border border-bottle-800/20 rounded-xl p-3 text-bottle-950 outline-none focus:border-bottle-800 text-lg"
                  />
                  <div className="flex gap-2 mt-2">
                    {[2000, 5000, 10000, 25000, 50000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMonthlyContribution(amt)}
                        className="px-2 py-1 bg-bone-400 hover:bg-bone-500 rounded text-[11px] font-mono text-bottle-900"
                      >
                        ₹{(amt/1000)}k
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-bottle-950 block mb-1">
                      Total Members *
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={50}
                      value={totalMembers}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setTotalMembers(val);
                        setDurationMonths(val);
                      }}
                      className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-3 text-bottle-950 outline-none focus:border-bottle-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-bottle-950 block mb-1">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      value={durationMonths}
                      disabled
                      className="w-full text-xs font-medium bg-bone-400/80 border border-bottle-800/10 rounded-xl p-3 text-bottle-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-bottle-950 block mb-1">
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={e => setFrequency(e.target.value as any)}
                      className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-3 text-bottle-950 outline-none"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Custom">Custom Agreed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-bottle-950 block mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-3 text-bottle-950 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Automatically Computed Pool Summary Card */}
              <div className="p-6 rounded-2xl bg-bottle-900 text-bone-200 border border-bone-500/20 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-bone-400 block mb-1">
                    Auto-Computed Pool Dynamics
                  </span>
                  <div className="text-xs text-bone-300 mb-4">
                    Formula: {formatINR(monthlyContribution)} × {totalMembers} Members
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-bottle-950/80 border border-bone-500/10">
                      <div className="text-xs text-bone-400 mb-0.5">Monthly Payout Pool</div>
                      <div className="text-3xl font-serif font-bold text-bone-100">{formatINR(totalPoolPerMonth)}</div>
                      <div className="text-[10px] text-bone-400 mt-1">Disbursed to one member each month</div>
                    </div>

                    <div className="p-4 rounded-xl bg-bottle-950/80 border border-bone-500/10">
                      <div className="text-xs text-bone-400 mb-0.5">Total Cycle Turnover</div>
                      <div className="text-2xl font-serif font-bold text-gold-400">{formatINR(totalCyclePool)}</div>
                      <div className="text-[10px] text-bone-400 mt-1">Over {durationMonths} consecutive months</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-bone-400 mt-4 pt-3 border-t border-bone-500/15">
                  100% of collected funds are disbursed. Zero commission deductions or hidden platform fees.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payout Rules (Strictly Non-Auction) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="pb-3 border-b border-bone-600">
              <h2 className="text-lg font-serif font-bold text-bottle-950">Agreed Payout Mechanism</h2>
              <p className="text-xs text-bottle-800/70">Select the method to determine who receives funds in each cycle</p>
            </div>

            {/* Non-Auction Notice Alert */}
            <div className="p-4 rounded-2xl bg-crimson-50 border border-crimson-200 text-crimson-900 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-crimson-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Non-Auction Guarantee:</strong> BISHI is strictly a community savings platform. It does <strong>not</strong> support live auctions, predatory bidding discounts, or profit-taking. Payout schedules must be pre-agreed by all members before the first cycle commences.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  rule: 'Fixed Schedule',
                  desc: 'Members agree in advance on fixed months based on need (e.g. wedding, medical, tuition). Recorded in initial charter.',
                  badge: 'Most Popular'
                },
                {
                  rule: 'Organizer Proposed (Member Approved)',
                  desc: 'The central organizer drafts a recommended sequence which requires a majority sign-off from all enrolled members.',
                  badge: 'Flexible'
                },
                {
                  rule: 'Random Draw (Verifiable Seed)',
                  desc: 'Initial payout order is generated through an open, transparent lottery using a verifiable blockchain block hash seed.',
                  badge: 'Cryptographic'
                },
                {
                  rule: 'Custom Mutual Agreement',
                  desc: 'Every member signs an explicit bespoke schedule with mutually agreed rotation terms.',
                  badge: 'Tailored'
                }
              ].map(opt => (
                <div
                  key={opt.rule}
                  onClick={() => setPayoutRule(opt.rule as PayoutRuleType)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    payoutRule === opt.rule 
                      ? 'bg-bottle-900 text-bone-200 border-bottle-800 shadow-md' 
                      : 'bg-white hover:bg-bone-300/40 border-bottle-800/15 text-bottle-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold font-serif">{opt.rule}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      payoutRule === opt.rule ? 'bg-bone-400 text-bottle-950' : 'bg-bone-400 text-bottle-800'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${payoutRule === opt.rule ? 'text-bone-300' : 'text-bottle-800/70'}`}>
                    {opt.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-bone-300 border border-bottle-800/10 flex items-center gap-3">
              <input
                type="checkbox"
                id="ack"
                checked={rulesAcknowledged}
                onChange={e => setRulesAcknowledged(e.target.checked)}
                className="w-4 h-4 accent-bottle-800 cursor-pointer"
              />
              <label htmlFor="ack" className="text-xs font-semibold text-bottle-950 cursor-pointer">
                I acknowledge that payout rules are immutable once approved and cannot be altered secretly by the organizer.
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Invite Members */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="pb-3 border-b border-bone-600">
              <h2 className="text-lg font-serif font-bold text-bottle-950">Invite Trusted Members</h2>
              <p className="text-xs text-bottle-800/70">
                You have {totalMembers} membership slots. Organizer occupies Slot 1.
              </p>
            </div>

            {/* Quick Member Add Form */}
            <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-bone-300/60 border border-bottle-800/10 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Member Full Name"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="text-xs font-medium bg-white border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none flex-1"
              />
              <input
                type="tel"
                placeholder="Mobile (e.g. +91 98220 55678)"
                value={newMemberPhone}
                onChange={e => setNewMemberPhone(e.target.value)}
                className="text-xs font-mono font-medium bg-white border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex-shrink-0"
              >
                Add Member
              </button>
            </form>

            {/* Invited Members List */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-bottle-800/70 px-1">
                Enrolled Roster ({invitedMembers.length + 1} / {totalMembers} Slots Filled)
              </div>

              {/* Slot 1: Organizer */}
              <div className="p-3 rounded-xl bg-white border border-bottle-800/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-bottle-800 text-bone-200 text-[11px] font-bold flex items-center justify-center">1</span>
                  <div>
                    <span className="font-semibold text-bottle-950">{currentUser.name}</span>
                    <span className="text-[10px] text-bone-400 bg-bottle-900 px-1.5 py-0.2 rounded ml-2">Organizer</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-medium">Ready</span>
              </div>

              {invitedMembers.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-bottle-800/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-bone-400 text-bottle-900 text-[11px] font-bold flex items-center justify-center">{idx + 2}</span>
                    <div>
                      <span className="font-semibold text-bottle-950">{m.name}</span>
                      <span className="text-bottle-800/60 font-mono ml-2 text-[11px]">{m.phone}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInvitedMembers(prev => prev.filter((_, i) => i !== idx))}
                    className="text-crimson-700 hover:text-crimson-900 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review & Cryptographic Charter Generation */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="pb-3 border-b border-bone-600">
              <h2 className="text-lg font-serif font-bold text-bottle-950">Review Charter & Launch Circle</h2>
              <p className="text-xs text-bottle-800/70">Verify terms before initializing the consortium smart contract</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-bone-300/80 border border-bottle-800/10 space-y-3 text-xs">
                <h4 className="font-serif font-bold text-sm text-bottle-950">Group Identity</h4>
                <div className="flex justify-between border-b border-bone-600 pb-1.5">
                  <span className="text-bottle-800/70">Name:</span>
                  <span className="font-semibold text-bottle-950">{name || 'Community Bishi'}</span>
                </div>
                <div className="flex justify-between border-b border-bone-600 pb-1.5">
                  <span className="text-bottle-800/70">Category:</span>
                  <span className="text-bottle-950">{category}</span>
                </div>
                <div className="flex justify-between border-b border-bone-600 pb-1.5">
                  <span className="text-bottle-800/70">Organizer:</span>
                  <span className="text-bottle-950">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Payout Rule:</span>
                  <span className="text-crimson-700 font-semibold">{payoutRule}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bottle-900 text-bone-200 border border-bone-500/20 space-y-3 text-xs">
                <h4 className="font-serif font-bold text-sm text-bone-100">Financial Terms</h4>
                <div className="flex justify-between border-b border-bone-500/15 pb-1.5">
                  <span className="text-bone-400">Monthly Contribution:</span>
                  <span className="font-bold text-bone-100">{formatINR(monthlyContribution)}/mo</span>
                </div>
                <div className="flex justify-between border-b border-bone-500/15 pb-1.5">
                  <span className="text-bone-400">Monthly Payout Pool:</span>
                  <span className="font-bold text-gold-400">{formatINR(totalPoolPerMonth)}</span>
                </div>
                <div className="flex justify-between border-b border-bone-500/15 pb-1.5">
                  <span className="text-bone-400">Total Members:</span>
                  <span className="text-bone-100">{totalMembers} Members ({durationMonths} Months)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-400">Lifecycle Value:</span>
                  <span className="font-mono text-bone-100">{formatINR(totalCyclePool)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                Upon clicking "Create Bishi", a SHA-256 agreement digest will be anchored to the consortium test ledger, and invite notifications will be dispatched.
              </span>
            </div>
          </div>
        )}

        {/* Step 6: Success Screen */}
        {currentStep === 6 && (
          <div className="py-8 text-center max-w-lg mx-auto space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-subtle ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-bottle-950">
                Your Bishi Community is Ready.
              </h2>
              <p className="text-xs text-bottle-800/70 mt-1 leading-relaxed">
                The group charter has been generated and fingerprinted on the shared consortium ledger.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-bone-300/80 border border-bottle-800/10 text-left text-xs space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-bottle-800/70">Group ID:</span>
                <span className="font-semibold text-bottle-950">{createdBishiId}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-bottle-800/70">State Anchor:</span>
                <span className="text-emerald-700 font-semibold">Block #1894202 (Ethereum Sepolia)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/bishi/${createdBishiId}`)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle transition-all"
              >
                Go to Group Management Hub
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-bone-400 text-bottle-950 text-xs font-semibold border border-bottle-800/15 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        {currentStep < 6 && (
          <div className="pt-6 border-t border-bone-600 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-bottle-800 hover:bg-bone-400 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !name.trim()) return alert('Please enter a group name');
                  if (currentStep === 3 && !rulesAcknowledged) return alert('Please acknowledge non-auction rules');
                  setCurrentStep(prev => prev + 1);
                }}
                className="px-6 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle transition-all flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmittingGroup}
                onClick={handleFinalSubmit}
                className="px-7 py-3 rounded-xl bg-crimson-700 hover:bg-crimson-800 disabled:opacity-60 text-bone-100 text-xs font-bold shadow-premium transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmittingGroup ? 'Anchoring Rules on Sepolia...' : 'Initialize Bishi Circle'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
