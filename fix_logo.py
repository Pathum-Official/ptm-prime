import re

# Update page.tsx
with open('c:/Project/Deriv_Bot_System/frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

logo_pattern = r'export const Logo = \(\) => \([\s\S]*?\);\n'
content = re.sub(logo_pattern, '', content)

content = content.replace('import { ShieldAlert, KeyRound, Mail, ArrowRight, Zap, Target, Lock, ChevronRight, CheckCircle2 } from "lucide-react";',
'import { ShieldAlert, KeyRound, Mail, ArrowRight, Zap, Target, Lock, ChevronRight, CheckCircle2 } from "lucide-react";\nimport { Logo } from "@/components/Logo";')

with open('c:/Project/Deriv_Bot_System/frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Update dashboard/page.tsx
with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

dashboard = dashboard.replace('import { Logo } from "../page";', 'import { Logo } from "@/components/Logo";')

with open('c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

# Update admin/page.tsx
with open('c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    admin = f.read()

admin = admin.replace('import { Logo } from "../page";', 'import { Logo } from "@/components/Logo";')

with open('c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(admin)

print("Logo components extracted and imports updated.")
