import re

with open('lib/blog/us-manufacturing.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace curly quotes and em-dash
content = content.replace('\u2019', "'")  # Right single quotation mark (')
content = content.replace('\u2018', "'")  # Left single quotation mark (')
content = content.replace('\u2014', "--")  # Em dash (—)

with open('lib/blog/us-manufacturing.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed special characters in us-manufacturing.ts")
