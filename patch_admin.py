import re

filepath = 'c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'\{\s*credentials:\s*"include"\s*\}',
    '{ credentials: "include", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`} }',
    content
)

content = re.sub(
    r'\{\s*credentials:\s*"omit"\s*\}',
    '{ credentials: "omit", headers: {"ngrok-skip-browser-warning": "true", "Authorization": `Bearer ${localStorage.getItem("token")}`} }',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Admin page patched!")
