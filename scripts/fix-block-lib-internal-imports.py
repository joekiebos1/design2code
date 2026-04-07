#!/usr/bin/env python3
"""
Fix remaining internal imports in packages/block-library.
Files moved from app/lab/blocks/X/file → src/lab/X/file
Files moved from app/blocks/X/file → src/production/X/file

Old path: ../../../../lib/blocks/ → ../../shared/
Old path: ../../../../lib/lab/    → ../../lab-utils/
Old path: ../../../lib/blocks/    → ../../shared/  (prod blocks one level shallower)
Old path: ../../../lib/lab/       → ../../lab-utils/
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
BLOCK_LIB_SRC = os.path.join(ROOT, 'packages', 'block-library', 'src')


def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Any number of ../ followed by lib/blocks/ → ../../shared/
    new_content = re.sub(
        r"from '(\.\./)+lib/blocks/([^']+)'",
        r"from '../../shared/\2'",
        content
    )
    # Any number of ../ followed by lib/lab/ → ../../lab-utils/
    new_content = re.sub(
        r"from '(\.\./)+lib/lab/([^']+)'",
        r"from '../../lab-utils/\2'",
        new_content
    )
    # Any number of ../ followed by app/blocks/ → ../production/
    new_content = re.sub(
        r"from '(\.\./)+app/blocks/([^']+)'",
        r"from '../../production/\2'",
        new_content
    )

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {path}")


for dirpath, dirnames, filenames in os.walk(BLOCK_LIB_SRC):
    dirnames[:] = [d for d in dirnames if d != 'node_modules']
    for filename in filenames:
        if filename.endswith('.ts') or filename.endswith('.tsx'):
            fix_file(os.path.join(dirpath, filename))

print("Done")
