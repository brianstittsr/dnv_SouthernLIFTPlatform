import codecs

# Read file in binary mode
with open('lib/blog/us-manufacturing.ts', 'rb') as f:
    content = f.read()

# Replace Unicode smart quotes with ASCII
# \xe2\x80\x99 is UTF-8 for right single quote (')
# \xe2\x80\x98 is UTF-8 for left single quote (')
# \xe2\x80\x94 is UTF-8 for em dash (—)
content = content.replace(b'\xe2\x80\x99', b"'")  # '
content = content.replace(b'\xe2\x80\x98', b"'")  # '
content = content.replace(b'\xe2\x80\x94', b'--')  # —

# Write back
with open('lib/blog/us-manufacturing.ts', 'wb') as f:
    f.write(content)

print('Fixed special characters in us-manufacturing.ts')
