import React, { useState } from 'react';
import { 
  Building2, Zap, AlertCircle, ShieldAlert, 
  Search, Filter, CheckCircle2, MapPin
} from 'lucide-react';
import { InfrastructureAsset } from '../types';

interface InfrastructureListProps {
  assets: InfrastructureAsset[];
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset) => void;
}

export const InfrastructureList: React.FC<InfrastructureListProps> = ({
  assets,
  selectedAsset,
  onSelectAsset
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-space-900/80 backdrop-blur-md border border-space-700 rounded-xl p-4 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-space-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyber-cyan" />
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            CRITICAL INFRASTRUCTURE INVENTORY ({assets.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-400">
          SPATIAL INTERSECTION
        </span>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets (e.g. Hospital, Grid)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-space-950 border border-space-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-mono">
          {[
            { id: 'all', label: 'ALL SITES' },
            { id: 'hospital', label: '🏥 HOSPITALS' },
            { id: 'power_substation', label: '⚡ POWER' },
            { id: 'bridge', label: '🌉 BRIDGES' },
            { id: 'residential_cluster', label: '🏘️ RESIDENTIAL' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold'
                  : 'bg-space-950 text-slate-400 hover:text-slate-200 border border-space-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
        {filteredAssets.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-slate-400">
            No assets match current filters
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const isSelected = selectedAsset?.id === asset.id;
            const statusBg = 
              asset.status === 'inundated' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
              asset.status === 'vulnerable' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyber-blue/15 border-cyber-cyan glow-cyan'
                    : 'bg-space-950/70 border-space-800 hover:border-space-600 hover:bg-space-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                      {asset.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {asset.name}
                    </h4>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex-shrink-0 ${statusBg}`}>
                    {asset.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-space-800/80 text-[10px] font-mono text-slate-400">
                  <div>
                    <span>ELEVATION:</span>
                    <span className="block text-slate-200 font-bold">{asset.elevation_meters}m</span>
                  </div>
                  <div>
                    <span>CAPACITY:</span>
                    <span className="block text-slate-200 font-bold">{asset.capacity_or_population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>DAMAGE:</span>
                    <span className="block text-rose-400 font-bold">${(asset.damage_estimate_usd / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
