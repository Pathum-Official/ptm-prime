with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Filter logic timezone
target1 = """  const filteredHistory = tradeHistory.filter(t => {
    if (historyFilter === 'all') return true;
    const d = new Date(t.timestamp);
    const now = new Date();"""
replace1 = """  const filteredHistory = tradeHistory.filter(t => {
    if (historyFilter === 'all') return true;
    const d = new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z'));
    const now = new Date();"""
if target1 in content:
    content = content.replace(target1, replace1)

# Fix 2: UI time display
target2 = """<td className="py-3">{new Date(t.timestamp).toLocaleTimeString()}</td>"""
replace2 = """<td className="py-3">{new Date(t.timestamp + (t.timestamp.endsWith('Z') ? '' : 'Z')).toLocaleTimeString()}</td>"""
if target2 in content:
    content = content.replace(target2, replace2)

# Fix 3: Remove TTS from tabs
target3 = """<button key={tab.id} onClick={() => { setActiveTab(tab.id as any); playTTS(`${tab.label} section accessed.`); }} className={`flex flex-col items-center gap-1.5 w-20 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'text-[#FFD700] bg-[#D4AF37]/10' : 'text-[#C5A059]/50 hover:text-[#C5A059] hover:bg-white/5'}`}>"""
replace3 = """<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1.5 w-20 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'text-[#FFD700] bg-[#D4AF37]/10' : 'text-[#C5A059]/50 hover:text-[#C5A059] hover:bg-white/5'}`}>"""
if target3 in content:
    content = content.replace(target3, replace3)

with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated successfully')
