import os

files = [
    'c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx',
    'c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx',
    'c:/Project/Deriv_Bot_System/frontend/src/components/LiveChat.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('{credentials: "include"}', '{credentials: "include", headers: {"ngrok-skip-browser-warning": "true"}}')
    content = content.replace('{ method: "POST", credentials: "include" }', '{ method: "POST", credentials: "include", headers: {"ngrok-skip-browser-warning": "true"} }')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated files!')
