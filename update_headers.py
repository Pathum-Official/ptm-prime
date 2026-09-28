import os

files = [
    'c:/Project/Deriv_Bot_System/frontend/src/app/page.tsx',
    'c:/Project/Deriv_Bot_System/frontend/src/app/dashboard/page.tsx',
    'c:/Project/Deriv_Bot_System/frontend/src/app/admin/page.tsx',
    'c:/Project/Deriv_Bot_System/frontend/src/components/ServerStatus.tsx'
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Inject ngrok-skip-browser-warning into headers
        content = content.replace('headers: {', 'headers: { "ngrok-skip-browser-warning": "true",')
        
        # For fetches that don't have headers explicitly written yet
        if 'ServerStatus.tsx' in filepath:
            content = content.replace("{ cache: 'no-store' }", "{ cache: 'no-store', headers: { \"ngrok-skip-browser-warning\": \"true\" } }")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Headers updated successfully.")
