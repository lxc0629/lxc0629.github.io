"""Recreate standalone cards from the pinned, unmodified SVG-cards source."""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re
import xml.etree.ElementTree as ET

FOLDER = Path(__file__).resolve().parent
REVISION = '6d88bf9c594997b82bc5668ab0877a4e9b717665'
SOURCE_URL = f'https://raw.githubusercontent.com/htdebeer/SVG-cards/{REVISION}/svg-cards.svg'
SVG = 'http://www.w3.org/2000/svg'
XLINK = 'http://www.w3.org/1999/xlink'
ET.register_namespace('', SVG)
ET.register_namespace('xlink', XLINK)
source = ET.parse(FOLDER / 'source/svg-cards.svg').getroot()
for definition in source.find(f'{{{SVG}}}defs'):
    rank = definition.get('id', '').removeprefix('n_')
    if definition.get('id', '').startswith('n_') and rank.isdigit():
        for text in definition.iter(f'{{{SVG}}}text'):
            text.set('transform', f'scale({0.50 if rank == "10" else 0.85} 1.05741)')

definitions = list(source.find(f'{{{SVG}}}defs'))
owner = {node.get('id'): definition for definition in definitions
         for node in definition.iter() if node.get('id')}


def references(element):
    for node in element.iter():
        assert node.tag.split('}')[-1] not in ('script', 'foreignObject')
        for attribute, value in node.attrib.items():
            assert not attribute.lower().startswith('on')
            if attribute.split('}')[-1] == 'href':
                assert value.startswith('#')
                yield value[1:]
            for target in re.findall(r'url\(([^)]+)\)', value):
                target = target.strip('"\'')
                assert target.startswith('#')
                yield target[1:]


def extract(filename, target, color=None):
    required, pending = set(), [owner[target]]
    while pending:
        definition = pending.pop()
        if definition in required:
            continue
        required.add(definition)
        pending.extend(owner[reference] for reference in references(definition))
    root = ET.Element(f'{{{SVG}}}svg', {
        'version': '1.1', 'width': source.get('width'),
        'height': source.get('height'), 'viewBox': source.get('viewBox'),
    })
    ET.SubElement(root, f'{{{SVG}}}title').text = filename.removesuffix('.svg').replace('_', ' ')
    defs = ET.SubElement(root, f'{{{SVG}}}defs')
    defs.extend(deepcopy(definition) for definition in definitions if definition in required)
    attributes = {f'{{{XLINK}}}href': f'#{target}'}
    if color:
        attributes['fill'] = color
    ET.SubElement(root, f'{{{SVG}}}use', attributes)
    ET.ElementTree(root).write(FOLDER / filename, encoding='utf-8', xml_declaration=True)
    return {'file': filename, 'source_id': target, 'fill': color,
            'sha256': hashlib.sha256((FOLDER / filename).read_bytes()).hexdigest()}


records = []
for suit in ('spade', 'heart', 'club', 'diamond'):
    for rank in ('1', *map(str, range(2, 11)), 'jack', 'queen', 'king'):
        filename = f'{"ace" if rank == "1" else rank}_of_{suit}s.svg'
        records.append(extract(filename, f'{suit}_{rank}'))
for color in ('black', 'red'):
    records.append(extract(f'{color}_joker.svg', f'joker_{color}'))
for name, color in [('red', '#c52228'), ('blue', '#173c78')]:
    records.append(extract(f'back_{name}.svg', 'back', color))
manifest = {
    'name': 'SVG-cards', 'version': '4.0.0', 'revision': REVISION,
    'license': 'LGPL-2.1', 'source': SOURCE_URL,
    'numeric_index_scale': {'single_digit': [0.85, 1.05741], 'ten': [0.50, 1.05741]},
    'source_sha256': hashlib.sha256((FOLDER / 'source/svg-cards.svg').read_bytes()).hexdigest(),
    'files': records,
}
(FOLDER / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Extracted {len(records)} assets: 52 faces, 2 jokers, and 2 backs.')
