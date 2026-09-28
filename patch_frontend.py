import os
import re

files = [
    'c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx',
    'c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx',
    'c:/Project/Deriv_Bot_System/frontend/src/components/LiveChat.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('"ngrok-skip-browser-warning": "true"', '"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Patch page.tsx separately
page_path = 'c:/Project/Deriv_Bot_System/frontend/src/app/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()
    
page_content = page_content.replace('localStorage.setItem("user", JSON.stringify(data.user));', 'localStorage.setItem("user", JSON.stringify(data.user));\\n        if (data.token) localStorage.setItem("token", data.token);')
page_content = page_content.replace('"ngrok-skip-browser-warning": "true"', '"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Frontend patched for tokens!")
