with open('lib/blog/us-manufacturing.ts', 'rb') as f:
    content = f.read()

# Replace UTF-8 encoded smart quotes
content = content.replace(b'\xe2\x80\x99', b"'")   # right single quote
content = content.replace(b'\xe2\x80\x98', b"'")   # left single quote
content = content.replace(b'\xe2\x80\x94', b'--')  # em dash

with open('lib/blog/us-manufacturing.ts', 'wb') as f:
    f.write(content)

print('Fixed Unicode characters')
