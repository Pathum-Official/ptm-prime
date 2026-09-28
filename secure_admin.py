with open('c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add isAuthenticated state
target1 = """export default function AdminDashboard() {
  const router = useRouter();"""
replace1 = """export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);"""
if target1 in content:
    content = content.replace(target1, replace1)

# Add redirect logic to fetchLive
target2 = """    try {
      const statRes = await fetch("http://localhost:8000/api/v1/admin/stats", { credentials: "include" });
      if (statRes.ok) setStats(await statRes.json());"""
replace2 = """    try {
      const authRes = await fetch("http://localhost:8000/api/v1/users/me", { credentials: "include" });
      if (!authRes.ok) {
        router.push("/");
        return;
      }
      const userData = await authRes.json();
      if (!userData.is_admin) {
        router.push("/dashboard");
        return;
      }
      setIsAuthenticated(true);
      
      const statRes = await fetch("http://localhost:8000/api/v1/admin/stats", { credentials: "include" });
      if (statRes.ok) setStats(await statRes.json());"""
if target2 in content:
    content = content.replace(target2, replace2)

# Add loading spinner before main return
target3 = """  return (
    <div className="min-h-screen bg-[#0B0B0E] text-slate-300 font-sans">"""
replace3 = """  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin shadow-[0_0_20px_rgba(239,68,68,0.3)]"></div>
        <p className="text-red-500 mt-6 font-bold tracking-[0.2em] uppercase text-xs animate-pulse">Verifying Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-slate-300 font-sans">"""
if target3 in content:
    content = content.replace(target3, replace3)

with open('c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Admin secured')
