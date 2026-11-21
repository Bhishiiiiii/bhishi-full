import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Users, ShieldCheck, FileText, ArrowRight, X } from 'lucide-react';
import { formatINR } from '../../utils/cryptoSim';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, bishis, members, documents, contributions } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!commandPaletteOpen) return null;

  const filteredBishis = bishis.filter(b => 
    b.name.toLowerCase().includes(query.toLowerCase()) || 
    b.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) || 
    m.phone.includes(query)
  );

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(query.toLowerCase()) || 
    d.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-bottle-950/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-bone-600 bg-bone-400/40">
          <Search className="w-5 h-5 text-bottle-700 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search Bishi groups, members, verified documents, hashes..."
            className="w-full bg-transparent border-none outline-none text-bottle-950 placeholder-bottle-800/50 text-sm font-medium"
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-bottle-800/50 hover:text-bottle-950 hover:bg-bone-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-5 divide-y divide-bone-600">
          {/* Bishi Groups */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-bottle-700/70 mb-2 px-2 flex items-center gap-1.5">
              <span>Bishi Groups</span>
              <span className="text-[10px] bg-bone-500 px-1.5 py-0.2 rounded font-mono">{filteredBishis.length}</span>
            </div>
            {filteredBishis.length === 0 ? (
              <p className="text-xs text-bottle-800/50 px-2 py-1">No matching Bishi communities found.</p>
            ) : (
              <div className="space-y-1">
                {filteredBishis.map(b => (
                  <div
                    key={b.id}
                    onClick={() => handleSelect(`/bishi/${b.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bone-400/60 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-bottle-800 text-bone-200 flex items-center justify-center font-serif font-bold text-sm">
                        {b.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-bottle-950 group-hover:text-bottle-800">{b.name}</div>
                        <div className="text-xs text-bottle-700/70">{b.category} • {formatINR(b.monthlyContribution)}/mo</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-bottle-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <div className="pt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-bottle-700/70 mb-2 px-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Members</span>
              <span className="text-[10px] bg-bone-500 px-1.5 py-0.2 rounded font-mono">{filteredMembers.length}</span>
            </div>
            {filteredMembers.length === 0 ? (
              <p className="text-xs text-bottle-800/50 px-2 py-1">No matching members found.</p>
            ) : (
              <div className="space-y-1">
                {filteredMembers.slice(0, 4).map(m => (
                  <div
                    key={m.id}
                    onClick={() => handleSelect('/members')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bone-400/60 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-medium text-bottle-950">{m.name}</div>
                        <div className="text-xs text-bottle-700/70">{m.role} • {m.phone}</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {m.complianceScore}% Score
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="pt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-bottle-700/70 mb-2 px-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Document Vault</span>
            </div>
            <div className="space-y-1">
              {filteredDocs.slice(0, 3).map(d => (
                <div
                  key={d.id}
                  onClick={() => handleSelect('/documents')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bone-400/60 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bone-600 flex items-center justify-center text-bottle-900">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-bottle-950">{d.title}</div>
                      <div className="text-xs text-bottle-700/70 font-mono">SHA-256: {d.sha256Hash.slice(0, 14)}...</div>
                    </div>
                  </div>
                  <span className="text-xs text-bone-900 bg-bone-500 px-2 py-0.5 rounded font-medium">
                    {d.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-bone-400/70 border-t border-bone-600 flex items-center justify-between text-[11px] text-bottle-800/70">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-bone-700 shadow-sm">ESC</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
