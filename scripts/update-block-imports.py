#!/usr/bin/env python3
"""
Update imports from moved block-library modules.

Within packages/block-library: lib/blocks → ../shared, lib/lab → ../lab-utils
Within apps/dotcom: lib/blocks → @page-architect/block-library, lib/lab → @page-architect/block-library
Also update imports of app/blocks and app/lab/blocks to @page-architect/block-library
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
BLOCK_LIB = os.path.join(ROOT, 'packages', 'block-library', 'src')
DOTCOM = os.path.join(ROOT, 'apps', 'dotcom')


def update_block_lib_internal(path):
    """Fix imports inside packages/block-library: lib/blocks → ./shared, lib/lab → ./lab-utils"""
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # lib/blocks/media-text-asymmetric-shared.types → ../shared/...
    new = re.sub(
        r"from '(\.\./)*lib/blocks/([^']+)'",
        lambda m: f"from '../{''.join(['../' for _ in range(len(m.group(1).split('../'))-1)])}shared/{m.group(2)}'",
        content
    )
    # Simpler approach: just fix the depth based on file location
    # Use @page-architect/block-library for cross-package refs, relative for within
    # For files inside packages/block-library, lib/blocks → go up to src root, then shared/
    # lib/lab → go up to src root, then lab-utils/

    # Determine depth of file relative to src/
    rel = os.path.relpath(path, BLOCK_LIB)
    depth = len(rel.split(os.sep)) - 1  # number of dirs above file to reach src/
    prefix = '../' * depth

    new_content = re.sub(
        r"from '(\.\./)*lib/blocks/([^']+)'",
        lambda m: f"from '{prefix}shared/{m.group(2)}'",
        content
    )
    new_content = re.sub(
        r"from '(\.\./)*lib/lab/([^']+)'",
        lambda m: f"from '{prefix}lab-utils/{m.group(2)}'",
        new_content
    )

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[block-lib] Updated: {path}")


def update_dotcom(path):
    """Fix imports in apps/dotcom: lib/blocks, lib/lab, app/blocks, app/lab/blocks → @page-architect/block-library"""
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r"from '(\.\./)*lib/blocks/[^']*'", "from '@page-architect/block-library'", content)
    new_content = re.sub(r"from '(\.\./)*lib/lab/[^']*'", "from '@page-architect/block-library'", new_content)
    new_content = re.sub(r"from '(\.\./)*app/blocks(?:/index)?'", "from '@page-architect/block-library'", new_content)
    new_content = re.sub(r"from '(\.\./)*app/lab/blocks(?:/index)?'", "from '@page-architect/block-library'", new_content)
    # Also handle named imports from specific block files
    new_content = re.sub(r"from '(\.\./)*app/blocks/[^']*'", "from '@page-architect/block-library'", new_content)
    new_content = re.sub(r"from '(\.\./)*app/lab/blocks/[^']*'", "from '@page-architect/block-library'", new_content)

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[dotcom]    Updated: {path}")


def walk(directory, handler):
    for dirpath, dirnames, filenames in os.walk(directory):
        dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.next')]
        for filename in filenames:
            if filename.endswith('.ts') or filename.endswith('.tsx'):
                handler(os.path.join(dirpath, filename))


walk(BLOCK_LIB, update_block_lib_internal)
walk(DOTCOM, update_dotcom)

print("Done")
