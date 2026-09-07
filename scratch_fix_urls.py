import os
src = r'c:\Hackathons\SIH\Proto\frontend\src'
for root, dirs, files in os.walk(src):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            # Replace "'`${API_BASE}" with "`${API_BASE}"
            new_content = content.replace("'`${API_BASE}", "`${API_BASE}")
            
            # Also catch '`${API_BASE}/api/projects?limit=10000'` which has a trailing single quote?
            # It was likely '`${API_BASE}/...`' which is invalid.
            # Wait, the grep search showed:
            # axios.get('`${API_BASE}/api/projects?limit=10000')
            # It means it ends with ')
            # Let's replace any trailing ') with `) if the string starts with `
            # A safer way: just replace "'`${API_BASE}" with "`${API_BASE}"
            # AND replace "')"" with "`)"" on the same line if it contained the first replace.
            
            # Let's use regex to fix it properly:
            import re
            # Match: '`${API_BASE}... ' or '`${API_BASE}... ' ending with single quote
            new_content = re.sub(r"'(`\$\{API_BASE\}[^']*)'", r"\1`", new_content)

            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print('Fixed', f)
