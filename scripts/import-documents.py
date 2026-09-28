"""Convert the 31 source DOCX files to safe, ordered HTML using only Python stdlib.
Usage: python scripts/import-documents.py [source-directory]
"""
from pathlib import Path
from zipfile import ZipFile
from html import escape
import xml.etree.ElementTree as ET
import json
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'public/documents'
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

def text(el):
    return ''.join(n.text or '' for n in el.iter(W + 't'))

def enabled(el, name):
    prop = el.find(W + 'rPr/' + W + name)
    return prop is not None and prop.get(W + 'val', 'true') not in ('0', 'false', 'off', 'none')

def inline(el):
    pieces = []
    for run in el.iter(W + 'r'):
        value = ''.join(escape(n.text or '') if n.tag == W + 't' else '<br>' if n.tag == W + 'br' else ' ' if n.tag == W + 'tab' else '' for n in run)
        if enabled(run, 'b'):
            value = '<strong>' + value + '</strong>'
        if enabled(run, 'i'):
            value = '<em>' + value + '</em>'
        if enabled(run, 'u'):
            value = '<u>' + value + '</u>'
        pieces.append(value)
    return ''.join(pieces)

def convert(path):
    with ZipFile(path) as z:
        body = ET.fromstring(z.read('word/document.xml')).find(W + 'body')
        styles_root = ET.fromstring(z.read('word/styles.xml'))
        styles = {s.get(W+'styleId'): s.find(W+'name').get(W+'val') for s in styles_root.findall(W+'style') if s.find(W+'name') is not None}
        numbering = ET.fromstring(z.read('word/numbering.xml')) if 'word/numbering.xml' in z.namelist() else None
    paras = [p for p in body.findall(W+'p') if text(p).strip()]
    code, title, description = [text(p) for p in paras[:3]]
    toc = []
    def paragraph(p, in_table=False):
        if not text(p).strip():
            return ''
        pstyle = p.find(W+'pPr/'+W+'pStyle')
        style = styles.get(pstyle.get(W+'val'), '').lower() if pstyle is not None else ''
        if style.startswith('heading ') and not in_table:
            level = min(int(style.split()[-1])+1, 4)
            anchor = f'section-{len(toc)+1}'
            toc.append({'id': anchor, 'title': text(p), 'level': level})
            return f'<h{level} id="{anchor}">{inline(p)}</h{level}>'
        return f'<p>{inline(p)}</p>'
    def list_info(p):
        num = p.find(W+'pPr/'+W+'numPr')
        if num is None:
            return None
        nid = num.find(W+'numId').get(W+'val')
        level = num.find(W+'ilvl').get(W+'val', '0')
        if numbering is not None:
            ref = numbering.find(f"{W}num[@{W}numId='{nid}']/{W}abstractNumId")
            if ref is not None:
                fmt = numbering.find(f"{W}abstractNum[@{W}abstractNumId='{ref.get(W+'val')}']/{W}lvl[@{W}ilvl='{level}']/{W}numFmt")
                if fmt is not None and fmt.get(W+'val') != 'bullet':
                    return ('ol', nid)
        return ('ul', nid)
    parts, opened = [], None
    table_count = 0
    for el in body:
        if el in paras[:3]:
            continue
        li = list_info(el) if el.tag == W+'p' else None
        if opened and li != opened:
            parts.append(f'</{opened[0]}>')
            opened = None
        if el.tag == W+'p':
            if li:
                if not opened:
                    parts.append(f'<{li[0]}>')
                    opened = li
                parts.append('<li>'+inline(el)+'</li>')
            else:
                parts.append(paragraph(el))
        elif el.tag == W+'tbl':
            table_count += 1
            parts.append('<div class="table-scroll" role="region" aria-label="Bảng dữ liệu" tabindex="0"><table>')
            for row in el.findall(W+'tr'):
                is_head = row.find(W+'trPr/'+W+'tblHeader') is not None
                tag = 'th' if is_head else 'td'
                parts.append('<tr>')
                for cell in row.findall(W+'tc'):
                    span = cell.find(W+'tcPr/'+W+'gridSpan')
                    attrs = ' scope="col"' if is_head else ''
                    if span is not None:
                        attrs += f' colspan="{int(span.get(W+"val"))}"'
                    parts.append(f'<{tag}{attrs}>'+''.join(paragraph(p, True) for p in cell.findall(W+'p'))+f'</{tag}>')
                parts.append('</tr>')
            parts.append('</table></div>')
    if opened:
        parts.append(f'</{opened[0]}>')
    return {'id': code.lower(), 'code': code, 'title': title, 'description': description, 'filename': path.name, 'toc': toc, 'html': '\n'.join(parts), 'tables': table_count, 'sourceText': text(body)}

paths = sorted(SOURCE.glob('TL-*.docx'))
assert len(paths) == 31, f'Expected 31 documents; found {len(paths)}'
docs = [convert(p) for p in paths]
assert [d['code'] for d in docs] == [f'TL-{i:02}' for i in range(1,32)]
(ROOT/'src/data').mkdir(parents=True, exist_ok=True)
(ROOT/'public/documents').mkdir(parents=True, exist_ok=True)
for p in paths:
    dest = ROOT/'public/documents'/p.name
    if p.resolve() != dest.resolve():
        shutil.copy2(p, dest)
(ROOT/'src/data/documents.json').write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Imported {len(docs)} documents, {sum(d["tables"] for d in docs)} tables.')
