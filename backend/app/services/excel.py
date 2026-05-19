from html import escape
from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile
import xml.etree.ElementTree as ET


NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_name(index: int) -> str:
    result = ""
    while index:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result


def cell_xml(row_idx: int, col_idx: int, value) -> str:
    ref = f"{col_name(col_idx)}{row_idx}"
    if value is None:
        value = ""
    if isinstance(value, (int, float)):
        return f'<c r="{ref}"><v>{value}</v></c>'
    return f'<c r="{ref}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'


def rows_to_xlsx(rows: list[list]) -> bytes:
    sheet_rows = []
    for row_idx, row in enumerate(rows, start=1):
        cells = "".join(cell_xml(row_idx, col_idx, value) for col_idx, value in enumerate(row, start=1))
        sheet_rows.append(f'<row r="{row_idx}">{cells}</row>')

    sheet_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>{''.join(sheet_rows)}</sheetData>
</worksheet>'''

    workbook_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Document" sheetId="1" r:id="rId1"/></sheets>
</workbook>'''

    rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>'''

    workbook_rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>'''

    content_types_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>'''

    output = BytesIO()
    with ZipFile(output, "w", ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types_xml)
        zf.writestr("_rels/.rels", rels_xml)
        zf.writestr("xl/workbook.xml", workbook_xml)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)
        zf.writestr("xl/worksheets/sheet1.xml", sheet_xml)
    return output.getvalue()


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        text = cell.find(".//main:t", NS)
        return text.text if text is not None and text.text is not None else ""
    value = cell.find("main:v", NS)
    if value is None or value.text is None:
        return ""
    if cell_type == "s":
        index = int(value.text)
        return shared_strings[index] if index < len(shared_strings) else ""
    return value.text


def xlsx_to_rows(content: bytes) -> list[list[str]]:
    with ZipFile(BytesIO(content)) as zf:
        shared_strings = []
        if "xl/sharedStrings.xml" in zf.namelist():
            root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si", NS):
                parts = [node.text or "" for node in item.findall(".//main:t", NS)]
                shared_strings.append("".join(parts))
        sheet = ET.fromstring(zf.read("xl/worksheets/sheet1.xml"))

    rows: list[list[str]] = []
    for row in sheet.findall(".//main:row", NS):
        values = [cell_value(cell, shared_strings) for cell in row.findall("main:c", NS)]
        rows.append(values)
    return rows
