#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

try:
  import fitz
except ModuleNotFoundError:
  import pymupdf as fitz


DISTRICT_START_PAGES = {
  "bekaa-i": 8,
  "bekaa-ii": 10,
  "bekaa-iii": 12,
  "south-i": 14,
  "south-ii": 16,
  "south-iii": 18,
  "north-i": 20,
  "north-ii": 22,
  "north-iii": 25,
  "beirut-i": 27,
  "beirut-ii": 29,
  "mount-lebanon-i": 32,
  "mount-lebanon-ii": 34,
  "mount-lebanon-iii": 36,
  "mount-lebanon-iv": 37,
}


def build_ranges():
  items = list(DISTRICT_START_PAGES.items())
  ranges = {}
  for index, (district_id, start_page) in enumerate(items):
    next_start = items[index + 1][1] if index + 1 < len(items) else None
    ranges[district_id] = (start_page, next_start)
  return ranges


def extract_raw_district_text(pdf_path):
  document = fitz.open(pdf_path)
  ranges = build_ranges()
  extracted = {}

  for district_id, (start_page, next_start) in ranges.items():
    pages = []
    page_number = start_page
    while page_number <= len(document):
      page = document[page_number - 1]
      text = page.get_text().strip()
      pages.append({"page": page_number, "text": text})

      if next_start and page_number + 1 >= next_start:
        break
      if not next_start and page_number == len(document):
        break
      page_number += 1

    extracted[district_id] = pages

  return extracted


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--pdf", required=True)
  parser.add_argument("--output", required=True)
  args = parser.parse_args()

  data = extract_raw_district_text(Path(args.pdf))
  Path(args.output).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
  main()
