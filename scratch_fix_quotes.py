import os, re
src = r'c:\Hackathons\SIH\Proto\frontend\src'
for root, dirs, files in os.walk(src):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Find `${API_BASE}... ' and replace the trailing ' with `
            # Match backtick followed by ${API_BASE} followed by anything that isn't a single quote, 
            # followed by a single quote.
            new_content = re.sub(r"(`\$\{API_BASE\}[^'`]*)'", r"\1`", content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print('Fixed', f)
