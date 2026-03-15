#!/usr/bin/env python3
import argparse
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

import fitz
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
INPUT_PATH = ROOT / "src" / "data" / "election-results-2018.generated.json"
OUTPUT_PATH = ROOT / "src" / "data" / "election-results-2018.generated.json"
PDF_DIR = Path("/tmp/election2018pdfs")
TESSDATA_PREFIX = Path("/tmp/tessdata")
TESSDATA_DIR = Path("/tmp/tessdata-full")
TEMPLATE_COLUMN_COUNT = 4
RENDER_SCALE = 4
THRESHOLD = 185

ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
NOISE_LINES = (
  "نظام ادارة انتخابات",
  "مجلس النواب",
  "مجموع الأصوات",
  "الدائرة",
  "18-",
)

SECT_PATTERNS = (
  ("Armenian Orthodox", ("أرمن ارثوذكس", "ارمن ارثوذكس", "أرمن أرثوذكس", "ارمن أرثوذكس")),
  ("Armenian Catholic", ("أرمن كاثوليك", "ارمن كاثوليك")),
  ("Greek Orthodox", ("روم ارثوذكس", "روم ارتوذكس", "روم ارثونكس", "روم اروذكس")),
  ("Greek Catholic", ("روم كاثوليك",)),
  ("Greek Catholic", ("كاثوليك",)),
  ("Greek Orthodox", ("ارثوذكس", "ارتوذكس")),
  ("Maronite", ("ماروني", "موارنة")),
  ("Sunni", ("سني", "ستي")),
  ("Shia", ("شيعي",)),
  ("Druze", ("درزي", "دزي", "حرزي", "درزى")),
  ("Evangelical", ("إنجيلي", "انجيلي", "إتجيلي", "إنصلي")),
  ("Minorities", ("أقليات", "اقليات")),
  ("Alawite", ("علوي",)),
)


def normalize_text(value):
  text = str(value or "")
  text = text.translate(ARABIC_DIGITS)
  text = text.replace("\u200f", " ").replace("\u200e", " ")
  text = text.replace("|", " ").replace("'", " ")
  text = re.sub(r"[\[\]{}()<>`~_=+*^]", " ", text)
  text = re.sub(r"[،,:;!.\"\\/]+", " ", text)
  text = re.sub(r"\s+", " ", text)
  return text.strip(" -")


def is_noise_line(line):
  return not line or any(marker in line for marker in NOISE_LINES)


def detect_sect(line):
  cleaned = normalize_text(line)
  for sect, patterns in SECT_PATTERNS:
    if any(pattern in cleaned for pattern in patterns):
      return sect

  return None


def extract_votes(line):
  cleaned = normalize_text(line)
  matches = re.findall(r"\d{1,6}", cleaned)
  if not matches:
    return None

  digits = matches[-1].lstrip("0") or "0"
  return int(digits)


def clean_candidate_name(line):
  cleaned = normalize_text(line)
  cleaned = re.sub(r"\d{1,6}", " ", cleaned)
  cleaned = re.sub(r"\b[اأإآ]?\s*$", "", cleaned)
  cleaned = re.sub(r"\s+", " ", cleaned)
  return cleaned.strip(" -")


def looks_like_list_header(line, next_line):
  cleaned = normalize_text(line)
  if is_noise_line(cleaned) or detect_sect(cleaned):
    return False
  if re.search(r"\d", cleaned):
    return False
  if len(cleaned) < 5:
    return False
  if next_line and detect_sect(next_line):
    return False
  return True


def looks_like_candidate(line, next_line):
  cleaned = normalize_text(line)
  if is_noise_line(cleaned) or detect_sect(cleaned):
    return False
  if len(cleaned) < 4:
    return False
  if re.search(r"\d", cleaned):
    return True
  return bool(next_line and detect_sect(next_line))


def parse_column_lines(lines):
  lines = [line for line in lines if line and not is_noise_line(line)]
  current_list = ""
  current_candidate = None
  candidates = []

  for index, line in enumerate(lines):
    next_line = lines[index + 1] if index + 1 < len(lines) else ""
    next_next_line = lines[index + 2] if index + 2 < len(lines) else ""
    sect = detect_sect(line)

    if sect:
      if current_candidate:
        current_candidate["sect"] = sect
        current_candidate["list"] = current_list
        candidates.append(current_candidate)
        current_candidate = None
      continue

    if re.fullmatch(r"\d{1,6}", line):
      if current_candidate and current_candidate["votes"] == 0:
        current_candidate["votes"] = int(line)
      continue

    if (
      not current_candidate
      and not detect_sect(line)
      and len(normalize_text(line)) >= 4
      and re.fullmatch(r"\d{1,6}", next_line)
      and detect_sect(next_next_line)
    ):
      current_candidate = {
        "name": clean_candidate_name(line),
        "votes": 0,
      }
      continue

    if looks_like_list_header(line, next_line):
      current_list = line
      continue

    if looks_like_candidate(line, next_line):
      current_candidate = {
        "name": clean_candidate_name(line),
        "votes": extract_votes(line) or 0,
      }

  return [candidate for candidate in candidates if candidate["name"] and candidate["sect"]]


def threshold_image(source_path, output_path):
  image = Image.open(source_path).convert("L")
  image = image.point(lambda pixel: 255 if pixel > THRESHOLD else 0)
  image.save(output_path)


def ensure_tessdata_dir():
  configs_dir = TESSDATA_DIR / "configs"
  if (TESSDATA_DIR / "ara.traineddata").exists() and (configs_dir / "tsv").exists():
    return

  TESSDATA_DIR.mkdir(parents=True, exist_ok=True)
  configs_dir.mkdir(parents=True, exist_ok=True)
  (TESSDATA_DIR / "ara.traineddata").write_bytes((TESSDATA_PREFIX / "ara.traineddata").read_bytes())

  source_configs_dir = Path("/opt/homebrew/Cellar/tesseract/5.5.2/share/tessdata/configs")
  for config_path in source_configs_dir.iterdir():
    target_path = configs_dir / config_path.name
    if not target_path.exists():
      target_path.write_bytes(config_path.read_bytes())


def ocr_words(image_path):
  ensure_tessdata_dir()
  command = [
    "tesseract",
    str(image_path.resolve()),
    "stdout",
    "--tessdata-dir",
    str(TESSDATA_DIR),
    "-l",
    "ara",
    "--psm",
    "4",
    "tsv",
  ]
  result = subprocess.run(command, check=True, capture_output=True, text=True)
  words = []
  for row in result.stdout.splitlines()[1:]:
    parts = row.split("\t")
    if len(parts) != 12:
      continue
    level = parts[0]
    if level != "5":
      continue
    text = normalize_text(parts[11])
    if not text:
      continue
    words.append(
      {
        "text": text,
        "left": int(parts[6]),
        "top": int(parts[7]),
        "width": int(parts[8]),
        "height": int(parts[9]),
      }
    )

  return words

def render_page_images(pdf_path, workdir):
  document = fitz.open(pdf_path)
  page = document[0]
  pixmap = page.get_pixmap(matrix=fitz.Matrix(RENDER_SCALE, RENDER_SCALE), alpha=False)
  source_path = workdir / f"{pdf_path.stem}-page.png"
  threshold_path = workdir / f"{pdf_path.stem}-page-thr.png"
  pixmap.save(source_path)
  threshold_image(source_path, threshold_path)
  return source_path, threshold_path, pixmap.width


def split_lines_by_column(words, image_width):
  columns = [[] for _ in range(TEMPLATE_COLUMN_COUNT)]
  column_width = image_width / TEMPLATE_COLUMN_COUNT

  for word in words:
    center = word["left"] + (word["width"] / 2)
    column_index = int(center / column_width)
    column_index = max(0, min(TEMPLATE_COLUMN_COUNT - 1, column_index))
    columns[column_index].append(word)

  column_lines = []
  for column_words in columns:
    grouped_lines = []
    for word in sorted(column_words, key=lambda item: (item["top"], -item["left"])):
      if not grouped_lines or abs(word["top"] - grouped_lines[-1]["top"]) > 22:
        grouped_lines.append({"top": word["top"], "words": [word]})
        continue
      grouped_lines[-1]["words"].append(word)

    column_lines.append(
      [
        " ".join(item["text"] for item in sorted(group["words"], key=lambda entry: -entry["left"])).strip()
        for group in grouped_lines
      ]
    )

  return column_lines


def parse_pdf_record(template_id, record, workdir):
  pdf_name = record.get("source_pdf")
  if not pdf_name:
    return {
      "source_pdf": "",
      "caption": record.get("caption", ""),
      "candidate_count": 0,
      "candidates": [],
    }

  pdf_path = PDF_DIR / pdf_name
  if not pdf_path.exists():
    raise FileNotFoundError(f"Missing 2018 PDF for {template_id}: {pdf_path}")

  candidates = []
  seen_keys = set()
  source_path, threshold_path, image_width = render_page_images(pdf_path, workdir)
  for image_path in (source_path, threshold_path):
    column_lines = split_lines_by_column(ocr_words(image_path), image_width)
    for lines in column_lines:
      for candidate in parse_column_lines(lines):
        key = (
          candidate["name"],
          candidate["sect"],
          candidate["list"],
          candidate["votes"],
        )
        if key in seen_keys:
          continue
        seen_keys.add(key)
        candidates.append(candidate)

  return {
    "source_pdf": pdf_name,
    "caption": record.get("caption", ""),
    "candidate_count": len(candidates),
    "candidates": candidates,
  }


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("--district", help="Only extract one template id.")
  parser.add_argument("--output", help="Override output path.")
  args = parser.parse_args()

  existing = json.loads(INPUT_PATH.read_text())
  output = {}

  with tempfile.TemporaryDirectory(prefix="ocr-2018-") as tmp_dir:
    workdir = Path(tmp_dir)
    for template_id, record in existing.items():
      if args.district and template_id != args.district:
        output[template_id] = record
        continue
      output[template_id] = parse_pdf_record(template_id, record, workdir)
      print(template_id, output[template_id]["candidate_count"])

  target_path = Path(args.output).resolve() if args.output else OUTPUT_PATH
  target_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
  main()
