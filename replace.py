with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

replacement = """                  <div className="col-span-1 mt-2">
                    <label className="block text-green-400 text-[10px] uppercase tracking-widest font-bold mb-2">Win Sleep (Sec)</label>
                    <input type="number" value={winCooldown} onChange={e => setWinCooldown(Number(e.target.value))} placeholder="e.g. 2" className="w-full bg-[#0B0B0E] border border-green-500/30 rounded-xl px-4 py-3 text-green-400 outline-none focus:border-green-400" />
                  </div>
                  <div className="col-span-1 mt-2">
                    <label className="block text-red-400 text-[10px] uppercase tracking-widest font-bold mb-2">Loss Sleep (Sec)</label>
                    <input type="number" value={lossCooldown} onChange={e => setLossCooldown(Number(e.target.value))} placeholder="e.g. 30" className="w-full bg-[#0B0B0E] border border-red-500/30 rounded-xl px-4 py-3 text-red-400 outline-none focus:border-red-400" />
                  </div>
                </div>\n"""

# lines are 0-indexed.
# 578:                   <div className="col-span-2 mt-2">
# 579:                     <label className="block text-[#3b82f6] text-[10px] uppercase tracking-widest font-bold mb-2">Trade Cooldown / Sleep Time (Seconds)</label>
# 580:                     <input type="number" value={cooldownPeriod} onChange={e => setCooldownPeriod(Number(e.target.value))} placeholder="e.g. 10 (Wait 10 seconds before next signal)" className="w-full bg-[#0B0B0E] border border-blue-500/30 rounded-xl px-4 py-3 text-blue-400 outline-none focus:border-blue-400" />
# 581:                   </div>
# 582:                 </div>
lines = lines[:577] + [replacement] + lines[582:]

with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
