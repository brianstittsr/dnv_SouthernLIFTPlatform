import os
import sys

file_path = 'lib/blog/us-manufacturing.ts'

# Read file as bytes
with open(file_path, 'rb') as f:
    data = f.read()

# Check for Unicode smart quotes
# UTF-8 encoding:
# U+2019 (') = \xe2\x80\x99
# U+2018 (') = \xe2\x80\x98
# U+2014 (—) = \xe2\x80\x94

orig_len = len(data)

# Replace smart quotes with ASCII
modified = data.replace(b'\xe2\x80\x99', b"'")  # '
modified = modified.replace(b'\xe2\x80\x98', b"'")  # '
modified = modified.replace(b'\xe2\x80\x94', b'--')  # —

new_len = len(modified)

if orig_len != new_len:
    print(f'Fixed {orig_len - new_len} bytes of Unicode characters')
    # Write back
    with open(file_path, 'wb') as f:
        f.write(modified)
    print(f'File updated: {file_path}')
else:
    print('No Unicode characters found to fix')

# Verify by checking a specific section
with open(file_path, 'rb') as f:
    check = f.read()
    idx = check.find(b'reshoring of American manufacturing')
    if idx > 0:
        print('Verification - found section:', repr(check[idx:idx+50]))
