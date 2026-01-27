export default function GameSimulationMockup() {
  return (
    <div className="bg-brand-primary rounded-lg p-4 border border-brand-surface">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-brand-accent font-semibold text-sm">Live Session</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs">In Progress</span>
        </div>
      </div>

      {/* Poker Table Visualization */}
      <div className="relative bg-green-900/30 rounded-full w-full aspect-[2/1] mb-3 border-4 border-green-800/50 flex items-center justify-center">
        {/* Pot */}
        <div className="text-center">
          <div className="text-xs text-brand-text-secondary">Pot</div>
          <div className="text-brand-accent font-bold">$247</div>
        </div>
        
        {/* Players around table */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="bg-brand-surface px-2 py-1 rounded text-xs">
            <span className="text-red-400">TAG</span>
          </div>
        </div>
        <div className="absolute top-1/2 -left-1 -translate-y-1/2">
          <div className="bg-brand-surface px-2 py-1 rounded text-xs">
            <span className="text-yellow-400">LAG</span>
          </div>
        </div>
        <div className="absolute top-1/2 -right-1 -translate-y-1/2">
          <div className="bg-brand-surface px-2 py-1 rounded text-xs">
            <span className="text-blue-400">Fish</span>
          </div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="bg-brand-accent px-2 py-1 rounded text-xs text-brand-primary font-semibold">
            YOU
          </div>
        </div>
      </div>

      {/* Your Cards */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-10 h-14 bg-white rounded shadow-lg flex items-center justify-center text-black font-bold">K♣</div>
        <div className="w-10 h-14 bg-white rounded shadow-lg flex items-center justify-center text-red-600 font-bold">Q♥</div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 bg-red-600/80 text-white text-xs py-2 rounded font-medium">Fold</button>
        <button className="flex-1 bg-blue-600/80 text-white text-xs py-2 rounded font-medium">Call $45</button>
        <button className="flex-1 bg-green-600/80 text-white text-xs py-2 rounded font-medium">Raise</button>
      </div>

      {/* Session Stats */}
      <div className="mt-3 pt-3 border-t border-brand-surface flex justify-between text-xs">
        <span className="text-brand-text-secondary">Hands: <span className="text-brand-text-primary">47</span></span>
        <span className="text-brand-text-secondary">Win Rate: <span className="text-green-400">+12 BB/100</span></span>
      </div>
    </div>
  )
}
