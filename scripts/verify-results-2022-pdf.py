#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

import fitz


DISTRICT_START_PAGES = {
  "beirut-i": 36,
  "beirut-ii": 40,
  "south-i": 46,
  "south-ii": 49,
  "south-iii": 52,
  "bekaa-i": 55,
  "bekaa-ii": 59,
  "bekaa-iii": 62,
  "mount-lebanon-i": 66,
  "mount-lebanon-ii": 70,
  "mount-lebanon-iii": 74,
  "mount-lebanon-iv": 78,
  "north-i": 83,
  "north-ii": 88,
  "north-iii": 95,
}

ABBREVIATION_TO_SECT = {
  "AC": "Armenian Catholic",
  "AL": "Alawite",
  "AO": "Armenian Orthodox",
  "DR": "Druze",
  "EV": "Evangelical",
  "GC": "Greek Catholic",
  "GO": "Greek Orthodox",
  "MA": "Maronite",
  "MI": "Minorities",
  "SH": "Shia",
  "SU": "Sunni",
}


def parse_pdf_quotas(pdf_path):
  document = fitz.open(pdf_path)
  parsed = {}

  for district_id, page_number in DISTRICT_START_PAGES.items():
    page = document[page_number - 1]
    words = page.get_text("words")
    quota_words = [
      (x0, y0, text)
      for x0, y0, _x1, _y1, text, *_rest in words
      if 50 <= y0 <= 125 and 350 <= x0 <= 440
    ]
    quota_words.sort(key=lambda item: (item[1], item[0]))

    quotas = {}
    total_seats = None
    current_count = None

    for _x0, _y0, text in quota_words:
      if text == "SEATS":
        continue

      if re.fullmatch(r"\d+", text):
        current_count = int(text)
        if total_seats is None:
          total_seats = current_count
        continue

      if text in ABBREVIATION_TO_SECT and current_count is not None:
        quotas[ABBREVIATION_TO_SECT[text]] = current_count
        current_count = None

    parsed[district_id] = {
      "page": page_number,
      "total_seats": total_seats,
      "quotas": quotas,
    }

  return parsed


def compare_with_templates(parsed, templates_path):
  templates = {entry["id"]: entry for entry in json.loads(Path(templates_path).read_text())}
  mismatches = []

  for district_id, pdf_data in parsed.items():
    template = templates[district_id]
    template_quotas = {entry["sect"]: entry["seats"] for entry in template["quotas"]}
    if pdf_data["quotas"] != template_quotas:
      mismatches.append(
        {
          "district": district_id,
          "page": pdf_data["page"],
          "pdf_quotas": pdf_data["quotas"],
          "template_quotas": template_quotas,
          "pdf_total": pdf_data["total_seats"],
          "template_total": sum(template_quotas.values()),
        }
      )

  return mismatches


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--pdf", required=True, help="Path to the 2022 results PDF.")
  parser.add_argument(
    "--templates",
    default="src/data/templates.json",
    help="Path to templates.json for comparison.",
  )
  args = parser.parse_args()

  parsed = parse_pdf_quotas(args.pdf)
  mismatches = compare_with_templates(parsed, args.templates)

  print(json.dumps({"parsed": parsed, "mismatches": mismatches}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
  main()
