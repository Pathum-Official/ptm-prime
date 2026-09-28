with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add isAuthenticated state
target1 = """export default function Dashboard() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);"""
replace1 = """export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);"""
if target1 in content:
    content = content.replace(target1, replace1)

# Fix 2: Auth logic redirect
target2 = """    const loadSettings = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/users/me", {credentials: "include"});
        if (res.ok) {
          const data = await res.json();
          if (data.full_name) setUserName(data.full_name);"""
replace2 = """    const loadSettings = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/users/me", {credentials: "include"});
        if (!res.ok) {
          router.push("/");
          return;
        }
        setIsAuthenticated(true);
        const data = await res.json();
        if (data.full_name) setUserName(data.full_name);"""
if target2 in content:
    content = content.replace(target2, replace2)

# Fix 3: Show loading spinner
target3 = """  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#D4AF37] font-sans pb-28 selection:bg-[#D4AF37]/30">"""
replace3 = """  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#FFD700] rounded-full animate-spin shadow-[0_0_20px_rgba(212,175,55,0.3)]"></div>
        <p className="text-[#FFD700] mt-6 font-bold tracking-[0.2em] uppercase text-xs animate-pulse">Authenticating Identity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#D4AF37] font-sans pb-28 selection:bg-[#D4AF37]/30">"""
if target3 in content:
    content = content.replace(target3, replace3)

with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Auth protection added')
