with open('c:/Project/Deriv_Bot_System/frontend/src/app/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { LiveChat } from "@/components/LiveChat";', 
'import { LiveChat } from "@/components/LiveChat";\nimport { ServerStatus } from "@/components/ServerStatus";')

content = content.replace('{children}', 
'<ServerStatus />\n        {children}')

with open('c:/Project/Deriv_Bot_System/frontend/src/app/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
