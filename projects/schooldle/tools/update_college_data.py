"""Refresh Schooldle's college stats from the NCES IPEDS bulk data files.

Updates, for every college in data/collegedata_abbr.csv:
  column 2  state            (IPEDS HD file, STABBR)
  column 3  Public/Private   (IPEDS HD file, CONTROL)
  column 5  admission rate   (IPEDS ADM file, ADMSSN / APPLCN)
  column 6  enrollment range (IPEDS DRVEF file, ENRTOT)

College names, cities, abbreviations, icon filenames and coordinates are left
alone. Coordinates that moved by more than 1 km are reported so you can decide.

Usage (from the schooldle folder):
  python tools/update_college_data.py --hd 2024 --adm 2023 --ef 2023 --dry-run
  python tools/update_college_data.py --hd 2024 --adm 2023 --ef 2023

Pick the newest years that exist at https://nces.ed.gov/ipeds/datacenter/data/
(e.g. HD2024.zip, ADM2023.zip, DRVEF2023.zip). Admissions and enrollment files
usually lag the HD (directory) file by a year.

Only the Python standard library is needed.
"""

import argparse
import csv
import difflib
import io
import math
import os
import re
import sys
import tempfile
import urllib.request
import zipfile

BASE_URL = "https://nces.ed.gov/ipeds/datacenter/data/"
HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CSV = os.path.join(HERE, "..", "data", "collegedata_abbr.csv")

# Colleges whose Schooldle name no longer matches IPEDS (renamed or merged).
# Maps the name used in collegedata_abbr.csv to its IPEDS UNITID.
# Look up UNITIDs at https://nces.ed.gov/collegenavigator/ (shown on each
# college's page as "IPEDS ID").
OVERRIDES = {
    # "Old Schooldle Name": "123456",
}


def admit_range(pct):
    if pct < 10:
        return "<10%"
    pct = round(pct)
    if pct <= 25:
        return "10-25%"
    if pct <= 50:
        return "26-50%"
    if pct <= 75:
        return "51-75%"
    return ">75%"


def enroll_range(n):
    if n < 5000:
        return "<5,000"
    if n < 10000:
        return "5,000-10,000"
    if n < 20000:
        return "10,000-20,000"
    if n < 30000:
        return "20,000-30,000"
    return ">30,000"


def load_ipeds(name, cache_dir):
    """Download (once) and read an IPEDS zip; returns {UNITID: row}."""
    path = os.path.join(cache_dir, name + ".zip")
    if not os.path.exists(path):
        url = BASE_URL + name + ".zip"
        print(f"Downloading {url}")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp, open(path, "wb") as f:
            f.write(resp.read())
    with zipfile.ZipFile(path) as z:
        # Some zips also contain a revised "_rv" file; prefer it when present.
        names = sorted(n for n in z.namelist() if n.lower().endswith(".csv"))
        member = next((n for n in names if "_rv" in n.lower()), names[0])
        text = z.read(member).decode("utf-8-sig", errors="replace")
    rows = csv.DictReader(io.StringIO(text))
    return {r["UNITID"].strip(): {k.strip(): (v or "").strip() for k, v in r.items()} for r in rows}


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower().replace("&", "and"))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--hd", required=True, help="year of the HD (directory) file, e.g. 2024")
    ap.add_argument("--adm", required=True, help="year of the ADM (admissions) file, e.g. 2023")
    ap.add_argument("--ef", required=True, help="year of the DRVEF (enrollment) file, e.g. 2023")
    ap.add_argument("--csv", default=DEFAULT_CSV, help="path to collegedata_abbr.csv")
    ap.add_argument("--cache", default=os.path.join(tempfile.gettempdir(), "schooldle_ipeds"),
                    help="folder to keep downloaded zips in")
    ap.add_argument("--dry-run", action="store_true", help="report changes without writing the CSV")
    args = ap.parse_args()

    os.makedirs(args.cache, exist_ok=True)
    hd = load_ipeds(f"HD{args.hd}", args.cache)
    adm = load_ipeds(f"ADM{args.adm}", args.cache)
    ef = load_ipeds(f"DRVEF{args.ef}", args.cache)

    by_name = {}
    for unitid, r in hd.items():
        for n in [r["INSTNM"]] + r.get("IALIAS", "").split("|"):
            if n.strip():
                by_name.setdefault((norm(n), r["STABBR"]), set()).add(unitid)

    with open(args.csv, "rb") as f:
        newline = "\r\n" if b"\r\n" in f.read() else "\n"
    with open(args.csv, newline="", encoding="utf-8") as f:
        rows = list(csv.reader(f))

    changes, problems = [], []
    for row in rows:
        name, state = row[0], row[1]
        unitid = OVERRIDES.get(name)
        if unitid is None:
            ids = by_name.get((norm(name), state), set())
            if len(ids) == 1:
                unitid = next(iter(ids))
            else:
                active = [u for u, r in hd.items() if r["STABBR"] == state and r.get("CYACTIVE") == "1"]
                guess = difflib.get_close_matches(norm(name), [norm(hd[u]["INSTNM"]) for u in active], n=1, cutoff=0.6)
                hint = f" Closest IPEDS name: {next(hd[u]['INSTNM'] for u in active if norm(hd[u]['INSTNM']) == guess[0])}." if guess else ""
                problems.append(f"{name}: {'several' if ids else 'no'} IPEDS matches in {state}; add it to OVERRIDES.{hint}")
                continue
        if unitid not in hd:
            problems.append(f"{name}: UNITID {unitid} not in HD{args.hd}")
            continue
        h = hd[unitid]

        updates = {1: h["STABBR"], 2: "Public" if h["CONTROL"] == "1" else "Private"}
        a = adm.get(unitid, {})
        try:
            pct = 100 * int(a["ADMSSN"]) / int(a["APPLCN"])
            updates[4] = admit_range(pct)
            pct_note = f"{pct:.1f}%"
        except (KeyError, ValueError, ZeroDivisionError):
            problems.append(f"{name}: no admissions data in ADM{args.adm}; kept {row[4]}")
            pct_note = ""
        try:
            total = int(ef[unitid]["ENRTOT"])
            updates[5] = enroll_range(total)
        except (KeyError, ValueError):
            problems.append(f"{name}: no enrollment data in DRVEF{args.ef}; kept {row[5]}")
            total = None

        labels = {1: "state", 2: "control", 4: "admission rate", 5: "enrollment"}
        for col, value in updates.items():
            if row[col] != value:
                note = pct_note if col == 4 else (f"{total:,}" if col == 5 else "")
                changes.append(f"{name}: {labels[col]} {row[col]} -> {value} {f'({note})' if note else ''}".rstrip())
                row[col] = value

        try:
            km = 111 * math.dist((float(row[8]), float(row[9])), (float(h["LONGITUD"]), float(h["LATITUDE"])))
            if km > 1:
                problems.append(f"{name}: IPEDS location is {km:.1f} km from yours "
                                f"(IPEDS lon/lat {h['LONGITUD']},{h['LATITUDE']}); not changed")
        except ValueError:
            pass

    print(f"\n{len(changes)} change(s):")
    for c in changes:
        print("  " + c)
    if problems:
        print(f"\n{len(problems)} item(s) to review:")
        for p in problems:
            print("  " + p)

    if args.dry_run:
        print("\nDry run: CSV not written.")
    elif changes:
        with open(args.csv, "w", newline="", encoding="utf-8") as f:
            csv.writer(f, lineterminator=newline).writerows(rows)
        print(f"\nWrote {args.csv}")


if __name__ == "__main__":
    sys.exit(main())
