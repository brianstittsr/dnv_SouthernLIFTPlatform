import sys

# Read file as bytes
with open('lib/blog/us-manufacturing.ts', 'rb') as f:
    data = f.read()

# UTF-8 bytes for Unicode chars
# U+2019 (right single quote) = \xe2\x80\x99
# U+2018 (left single quote) = \xe2\x80\x98  
# U+2014 (em dash) = \xe2\x80\x94

old_len = len(data)
data = data.replace(b'\xe2\x80\x99', b"'")  # '
new_len = len(data)

if new_len < old_len:
    print(f'Replaced {old_len - new_len} occurrence(s) of U+2019')

old_len = len(data)
data = data.replace(b'\xe2\x80\x98', b"'")  # '
new_len = len(data)

if new_len < old_len:
    print(f'Replaced {old_len - new_len} occurrence(s) of U+2018')

old_len = len(data)
data = data.replace(b'\xe2\x80\x94', b'--')  # —
new_len = len(data)

if new_len < old_len:
    print(f'Replaced {old_len - new_len} occurrence(s) of U+2014')

# Write back
with open('lib/blog/us-manufacturing.ts', 'wb') as f:
    f.write(data)

print('Done')
