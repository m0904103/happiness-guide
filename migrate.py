
with open(r'C:\Users\manpo\.gemini\antigravity\brain\dd82e0b4-3317-4ee6-b806-01e58b44561e\.system_generated\steps\14303\content.md', 'r', encoding='utf-8') as f:
    content = f.read()

html_start = content.find('<!DOCTYPE html>')
if html_start != -1:
    html_content = content[html_start:]
    # Split by lines and remove the line containing btn-back
    lines = html_content.split('\n')
    new_lines = [line for line in lines if 'btn-back' not in line]
    
    with open(r'C:\Users\manpo\.gemini\antigravity\scratch\happiness_guide_web\concepts.html', 'w', encoding='utf-8') as out:
        out.write('\n'.join(new_lines))
    print('Done')

