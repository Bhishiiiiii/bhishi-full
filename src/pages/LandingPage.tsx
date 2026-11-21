import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroSavingsVault3D } from '../components/3d/HeroSavingsVault3D';
import { 
  ShieldCheck, 
  Users, 
  CircleDot, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  FileCheck, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  Gem, 
  Briefcase,
  ChevronRight,
  Calculator,
  Layers,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { formatINR } from '../utils/cryptoSim';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Interactive Calculator State
  const [calcMembers, setCalcMembers] = useState(12);
  const [calcContribution, setCalcContribution] = useState(10000);
  const calcPool = calcMembers * calcContribution;

  return (
    <div className="min-h-screen bg-bone-300 text-bottle-950 font-sans selection:bg-bottle-800 selection:text-bone-200">
      {/* 1. Luxury Navbar */}
      <nav className="sticky top-0 z-50 bg-bone-300/80 backdrop-blur-md border-b border-bottle-800/10 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bottle-800 flex items-center justify-center text-bone-200 font-serif font-black text-xl shadow-md">
              B
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-wider text-bottle-900 block leading-tight">
                BISHI
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-bottle-700/80">
                Community Trust
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-bottle-900/80">
            <a href="#how-it-works" className="hover:text-bottle-900 transition-colors">How It Works</a>
            <a href="#communities" className="hover:text-bottle-900 transition-colors">Communities</a>
            <a href="#transparency" className="hover:text-bottle-900 transition-colors">Transparency</a>
            <a href="#calculator" className="hover:text-bottle-900 transition-colors">Calculator</a>
            <a href="#trust-layer" className="hover:text-bottle-900 transition-colors">Web3 Proofs</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-bottle-900 hover:bg-bone-400/80 transition-all border border-bottle-800/10"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-bottle-800 hover:bg-bottle-900 text-bone-200 shadow-subtle transition-all flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 px-6 lg:px-12 border-b border-bottle-800/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bottle-800/10 border border-bottle-800/20 text-bottle-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-crimson-700" />
              <span>Modernizing the Traditional Rotating Savings Circle</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-bottle-950 leading-[1.12] tracking-tight">
              Traditional Bishi. <br />
              <span className="italic font-normal text-bottle-800">A New Standard of Trust.</span>
            </h1>

            <p className="text-base sm:text-lg text-bottle-900/80 leading-relaxed font-light max-w-xl">
              Bring your community savings together with transparent monthly contributions, organized non-auction payouts, and cryptographic blockchain-backed records — all in one centralized management ecosystem.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/create-bishi"
                className="px-7 py-3.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-100 font-semibold text-sm shadow-premium flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
              >
                <span>Create Your Bishi</span>
                <ArrowRight className="w-4 h-4 text-crimson-400" />
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-xl bg-bone-400/80 hover:bg-bone-400 text-bottle-950 font-semibold text-sm border border-bottle-800/15 flex items-center justify-center gap-2 transition-all"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-8 border-t border-bottle-800/10 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-serif font-bold text-bottle-950">₹2.4 Cr+</div>
                <div className="text-xs text-bottle-800/70 mt-0.5">Pooled Community Reserves</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-bottle-950">100%</div>
                <div className="text-xs text-bottle-800/70 mt-0.5">Agreed Payout Order</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-bottle-950">0 Auctions</div>
                <div className="text-xs text-bottle-800/70 mt-0.5">Non-Bidding Trust Model</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visualization & Floating Badges */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl bg-gradient-to-b from-bottle-900 to-bottle-950 p-2 shadow-2xl border border-bone-500/20 overflow-hidden">
              <HeroSavingsVault3D />

              {/* Floating Pill Badges */}
              <div className="absolute top-6 left-6 p-3 rounded-2xl bg-bottle-950/90 border border-bone-500/20 text-bone-200 backdrop-blur-md shadow-elevated hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-crimson-800/60 border border-crimson-600/40 flex items-center justify-center text-crimson-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-bone-100">Cycle Payout Confirmed</div>
                  <div className="text-[10px] text-bone-400">Sneha Patil • ₹20,000 via UPI</div>
                </div>
              </div>

              <div className="absolute bottom-12 right-6 p-3 rounded-2xl bg-bottle-950/90 border border-bone-500/20 text-bone-200 backdrop-blur-md shadow-elevated hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-bone-100">Block Anchored #1894201</div>
                  <div className="text-[10px] font-mono text-bone-400">SHA-256 Merkle Consensus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 1: How Bishi Works (6-step lifecycle) */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-bone-400/50 border-b border-bottle-800/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-bottle-700">
              The Digital Lifecycle
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-bottle-950">
              How Community Bishi Operates
            </h2>
            <p className="text-sm text-bottle-900/75 leading-relaxed">
              Preserving the familiar community nature of Indian ROSCA savings while eliminating spreadsheets, informal disputes, and non-transparent records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create a Bishi Group',
                desc: 'Organizer sets group purpose, monthly contribution amount, duration, and frequency with clear charter documentation.'
              },
              {
                step: '02',
                title: 'Invite Trusted Members',
                desc: 'Onboard friends, neighbors, or business partners with verified phone numbers, KYC details, and signed consent.'
              },
              {
                step: '03',
                title: 'Agree on Payout Schedule',
                desc: 'Pre-determine payout turns transparently through fixed order, approved rotation, or verifiable random draw. No predatory auctions.'
              },
              {
                step: '04',
                title: 'Track Monthly Contributions',
                desc: 'Members pay via UPI or Bank Transfer. Central organizer records vouchers and counter-signs in the shared ledger.'
              },
              {
                step: '05',
                title: 'Record & Disburse Payouts',
                desc: 'The scheduled recipient receives the pooled funds on the milestone date with formal settlement receipt.'
              },
              {
                step: '06',
                title: 'Verify on Consortium Ledger',
                desc: 'Periodic record digests are anchored on a verifiable blockchain layer, preventing retroactive alteration.'
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle hover:shadow-premium transition-all relative overflow-hidden group"
              >
                <div className="text-3xl font-serif font-bold text-bottle-800/20 group-hover:text-crimson-700/30 transition-colors mb-3">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-bottle-950 mb-2 font-serif">{item.title}</h3>
                <p className="text-xs text-bottle-800/75 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Section 2: Built for Every Community */}
      <section id="communities" className="py-20 px-6 lg:px-12 border-b border-bottle-800/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-bottle-700 mb-2">
                Diverse Savings Circles
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-bottle-950">
                Built for Small Circles & Big Businesses Alike
              </h2>
            </div>
            <p className="text-xs text-bottle-900/70 max-w-md leading-relaxed">
              From ₹1,000 monthly neighborhood kitty circles to ₹1,50,000 multi-lakh commercial merchant working-capital consortiums.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Women's Savings Circles",
                desc: 'Neighborhood micro-savings, emergency medical pools, and small business bootstrap funds.',
                tag: '₹2k - ₹10k/mo'
              },
              {
                icon: Building2,
                title: 'Housing Societies',
                desc: 'Apartment improvement funds, annual lift upgrades, and resident contingencies with zero leakage.',
                tag: '₹5k - ₹25k/mo'
              },
              {
                icon: Gem,
                title: 'Traders & Jewellers',
                desc: 'Zaveri Bazaar and commercial wholesale merchants pooling working capital with full audit trails.',
                tag: '₹50k - ₹5L/mo'
              },
              {
                icon: Briefcase,
                title: 'Builders & Developers',
                desc: 'Private high-value contractor consortiums financing heavy machinery and raw material procurements.',
                tag: '₹1L - ₹10L/mo'
              }
            ].map((c, idx) => {
              const Icon = c.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle hover:border-bottle-800/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-bottle-800/10 text-bottle-800 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono bg-bone-400 px-2 py-0.5 rounded text-bottle-900 font-semibold">
                      {c.tag}
                    </span>
                    <h3 className="text-base font-bold text-bottle-950 mt-3 mb-1.5 font-serif">{c.title}</h3>
                    <p className="text-xs text-bottle-800/75 leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-bone-600 flex items-center text-xs font-semibold text-bottle-900 hover:text-crimson-700 cursor-pointer">
                    <span>View template</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Section 3: Transparency by Design (Interactive Calculator) */}
      <section id="calculator" className="py-20 px-6 lg:px-12 bg-bottle-900 text-bone-200 border-b border-bone-500/15">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bottle-800 border border-bone-500/20 text-bone-300 text-xs">
              <Calculator className="w-3.5 h-3.5 text-gold-400" />
              <span>Interactive Pool Calculator</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-bone-100">
              Calculate Your Community Savings Pool
            </h2>

            <p className="text-sm text-bone-300/80 leading-relaxed font-light">
              See the exact mathematical dynamics of a rotating savings circle. Every rupee contributed by members accumulates into a guaranteed monthly milestone payout with no deduction.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Number of Members:</span>
                  <span className="font-mono text-gold-400">{calcMembers} Members ({calcMembers} Months)</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  value={calcMembers}
                  onChange={e => setCalcMembers(Number(e.target.value))}
                  className="w-full accent-gold-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Monthly Contribution Per Member:</span>
                  <span className="font-mono text-gold-400">{formatINR(calcContribution)}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={calcContribution}
                  onChange={e => setCalcContribution(Number(e.target.value))}
                  className="w-full accent-gold-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-bottle-950 border border-bone-500/20 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-bone-500/15">
                <span className="text-xs uppercase tracking-wider text-bone-400 font-mono">Calculated Pool Metrics</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">
                  Fixed Non-Auction
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-bottle-900/80 border border-bone-500/10">
                  <div className="text-xs text-bone-400 mb-1">Monthly Payout Pool</div>
                  <div className="text-2xl font-serif font-bold text-bone-100">{formatINR(calcPool)}</div>
                  <div className="text-[10px] text-bone-400 mt-0.5">Distributed to 1 member each month</div>
                </div>

                <div className="p-4 rounded-xl bg-bottle-900/80 border border-bone-500/10">
                  <div className="text-xs text-bone-400 mb-1">Total Cycle Value</div>
                  <div className="text-2xl font-serif font-bold text-gold-400">{formatINR(calcPool * calcMembers)}</div>
                  <div className="text-[10px] text-bone-400 mt-0.5">Over {calcMembers} months lifecycle</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bone-500/5 border border-bone-500/10 text-xs text-bone-300 space-y-2">
                <div className="flex justify-between">
                  <span>Each Member Pays:</span>
                  <span className="font-semibold text-bone-100">{formatINR(calcContribution * calcMembers)} in total</span>
                </div>
                <div className="flex justify-between">
                  <span>Each Member Receives:</span>
                  <span className="font-semibold text-bone-100">{formatINR(calcPool)} lump sum</span>
                </div>
                <div className="flex justify-between text-emerald-400 pt-1 border-t border-bone-500/10 font-medium">
                  <span>Auction Discount / Bidding Haircut:</span>
                  <span>0% (Zero loss of principal)</span>
                </div>
              </div>

              <Link
                to="/create-bishi"
                className="w-full py-3.5 rounded-xl bg-bone-200 hover:bg-white text-bottle-950 font-semibold text-xs text-center flex items-center justify-center gap-2 shadow-premium transition-all"
              >
                <span>Start Group with These Terms</span>
                <ArrowRight className="w-4 h-4 text-bottle-800" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 4: Web3 & Trust Layer */}
      <section id="trust-layer" className="py-20 px-6 lg:px-12 border-b border-bottle-800/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-bottle-700">
              Cryptographic Integrity
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-bottle-950">
              The Architecture of Accountability
            </h2>
            <p className="text-sm text-bottle-900/75 leading-relaxed">
              No cryptocurrency tokens, no speculative gas, and no complex wallets. Blockchain is utilized purely as an immutable cryptographic audit notary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                title: '1. Centralized Management',
                desc: 'Organizer coordinates groups, schedules, and sends reminders without crypto complexity.',
                hash: 'Role: Central Coordinator'
              },
              {
                title: '2. Shared Ledger',
                desc: 'Every contribution and payout receipt generates a deterministic SHA-256 state fingerprint.',
                hash: 'Digest: 0x7f8a9b1c2d3e...'
              },
              {
                title: '3. Merkle Anchoring',
                desc: 'Monthly state snapshots are anchored to consortium blockchain blocks with timestamp proofs.',
                hash: 'Block #1894201'
              },
              {
                title: '4. Member Verification',
                desc: 'Any member can independently verify receipt integrity. Retroactive tampering is immediately exposed.',
                hash: 'Consensus Proof: Valid'
              }
            ].map((card, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-bottle-800 text-bone-200 font-bold text-xs flex items-center justify-center mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="text-sm font-bold text-bottle-950 mb-2 font-serif">{card.title}</h3>
                  <p className="text-xs text-bottle-800/70 leading-relaxed mb-4">{card.desc}</p>
                </div>
                <div className="p-2 rounded-lg bg-bone-400 font-mono text-[10px] text-bottle-900 truncate">
                  {card.hash}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="py-20 px-6 lg:px-12 bg-bottle-950 text-bone-200 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-bone-100">
            Bring Your Community Together.
          </h2>
          <p className="text-sm sm:text-base text-bone-300/80 font-light leading-relaxed">
            Eliminate cash disputes, lost receipts, and informal misunderstandings. Upgrade your family, society, or merchant circle to the modern standard of trust.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create-bishi"
              className="px-8 py-4 rounded-xl bg-bone-200 hover:bg-white text-bottle-950 font-bold text-sm shadow-premium transition-all hover:scale-105"
            >
              Start a Bishi Group Today
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-bottle-900 hover:bg-bottle-800 text-bone-200 font-semibold text-sm border border-bone-500/20 transition-all"
            >
              Explore Live Demo App
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Luxury Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-bottle-900 text-bone-400 text-xs border-t border-bone-500/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bone-200 text-bottle-950 font-serif font-bold text-base flex items-center justify-center">
              B
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-bone-200 block">BISHI Management Platform</span>
              <span className="text-[10px] text-bone-400">© 2026 Traditional Trust Reimagined. English Interface.</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <Link to="/dashboard" className="hover:text-bone-200">Dashboard</Link>
            <Link to="/blockchain" className="hover:text-bone-200">Blockchain Explorer</Link>
            <Link to="/documents" className="hover:text-bone-200">Charter Vault</Link>
            <Link to="/disputes" className="hover:text-bone-200">Dispute Protocol</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
