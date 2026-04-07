#!/usr/bin/env python3
"""Update imports from moved ds modules to @page-architect/ds"""
import os
import re

# Patterns: any relative import ending in one of these module paths → @page-architect/ds
DS_MODULES = [
    r'lib/colors/jio-colors',
    r'lib/colors/ds-color-picker-options',
    r'lib/typography/block-typography',
    r'lib/typography/lab-typography-presets',
    r'lib/config/content-ds-density',
    r'lib/utils/ds-density',
    r'lib/utils/use-ds-token-context',
    r'lib/utils/use-grid-breakpoint',
    r'lib/utils/use-carousel-reveal',
    r'lib/utils/use-block-reveal',
    r'lib/utils/use-hero-staggered-reveal',
    r'lib/utils/edge-to-edge',
    r'lib/utils/resolve-card-background-color',
    r'lib/utils/semantic-headline',
    r'lib/utils/page-href',
    r'lib/utils/block-surface',
    r'app/components/shared/Providers',
    r'app/components/shared/ContentDsProvider',
]

# Build one combined pattern
escaped = [re.escape(m) for m in DS_MODULES]
pattern = re.compile(r"from '(\.\./)*(" + '|'.join(escaped) + r")'")


def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = pattern.sub("from '@page-architect/ds'", content)
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
