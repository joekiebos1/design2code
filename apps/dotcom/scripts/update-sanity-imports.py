#!/usr/bin/env python3
"""Update imports from lib/sanity to @page-architect/sanity"""
import os
import re

# Map old import paths to new ones
# lib/sanity/client → @page-architect/sanity
# lib/sanity/queries → @page-architect/sanity
# lib/sanity/presentation/resolve → @page-architect/sanity/presentation
pattern_main = re.compile(r"from '(\.\./)*lib/sanity/(client|queries)'")
pattern_presentation = re.compile(r"from '(\.\./)*lib/sanity/presentation/resolve'")


def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = pattern_main.sub("from '@page-architect/sanity'", content)
    new_content = pattern_presentation.sub("from '@page-architect/sanity/presentation'", new_content)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {path}")


root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d != 'node_modules']
    for filename in filenames:
        if filename.endswith('.ts') or filename.endswith('.tsx'):
            update_file(os.path.join(dirpath, filename))

print("Done")
