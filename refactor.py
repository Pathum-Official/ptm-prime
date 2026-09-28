import os, re

files = {
    'c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx': "import { API_URL, WS_URL } from '../config';",
    'c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx': "import { API_URL, WS_URL } from '../config';",
    'c:/Project/Deriv_Bot_System/frontend/src/app/page.tsx': "import { API_URL } from './config';"
}

for file_path, import_stmt in files.items():
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add import at the top (after use client)
        if 'API_URL' not in content:
            content = content.replace('"use client";', f'"use client";\n{import_stmt}\n')
            content = content.replace("'use client';", f"'use client';\n{import_stmt}\n")
        
        # Replace APIs
        content = re.sub(r'"http://localhost:8000(.*?)"', r'`${API_URL}\1`', content)
        content = re.sub(r'\'http://localhost:8000(.*?)\'', r'`${API_URL}\1`', content)
        content = re.sub(r'\`http://localhost:8000(.*?)\`', r'`${API_URL}\1`', content)
        
        # Replace WebSockets
        content = re.sub(r'"ws://localhost:8000(.*?)"', r'`${WS_URL}\1`', content)
        content = re.sub(r'\'ws://localhost:8000(.*?)\'', r'`${WS_URL}\1`', content)
        content = re.sub(r'\`ws://localhost:8000(.*?)\`', r'`${WS_URL}\1`', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'Refactored URLs in {file_path}')
