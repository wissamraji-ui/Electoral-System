#!/usr/bin/env python3
import argparse
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


def inspect(pdf_path, district=None):
  document = fitz.open(pdf_path)
  district_ids = [district] if district else DISTRICT_START_PAGES.keys()

  for district_id in district_ids:
    page_number = DISTRICT_START_PAGES[district_id]
    page = document[page_number - 1]
    print(f"## {district_id} page {page_number}")
    print(page.get_text())
    print("----")


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--pdf", required=True)
  parser.add_argument("--district")
  args = parser.parse_args()

  inspect(Path(args.pdf), district=args.district)


if __name__ == "__main__":
  main()
