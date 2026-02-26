#!/usr/bin/env python3
import os

file_path = 'lib/blog/us-manufacturing.ts'

# Read file as bytes
with open(file_path, 'rb') as f:
    data = f.read()

# Count replacements
orig_len = len(data)

# Replace UTF-8 encoded smart quotes with ASCII
# U+2019 (') = \xe2\x80\x99
# U+2018 (') = \xe2\x80\x98
# U+2014 (—) = \xe2\x80\x94

count_2019 = data.count(b'\xe2\x80\x99')
count_2018 = data.count(b'\xe2\x80\x98')
count_2014 = data.count(b'\xe2\x80\x94')

print(f'Found {count_2019} U+2019 characters')
print(f'Found {count_2018} U+2018 characters')
print(f'Found {count_2014} U+2014 characters')

# Replace all
modified = data.replace(b'\xe2\x80\x99', b"'")  # '
modified = modified.replace(b'\xe2\x80\x98', b"'")  # '
modified = modified.replace(b'\xe2\x80\x94', b'--')  # —

new_len = len(modified)
total_replaced = orig_len - new_len + (count_2014 * 2)  # em-dash is 3 bytes -> 2 bytes

print(f'Total bytes changed: {orig_len - new_len}')

# Write back as binary
with open(file_path, 'wb') as f:
    f.write(modified)

print(f'Successfully wrote {new_len} bytes to {file_path}')
