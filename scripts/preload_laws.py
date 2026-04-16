"""
Script: preload_laws.py
Downloads key Greek laws from official sources and ingests them into the index.

Usage:
    cd greek-legal-rag
    python3 scripts/preload_laws.py

Sources: Εθνικό Τυπογραφείο (et.gr) — all PDFs are free and public.
"""

import sys
import os
import io
import urllib.request
import tempfile
from pathlib import Path

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent.parent))
from tools.ingest_pdf import ingest_pdf

# Key Greek laws — add more URLs as needed
# Format: (filename_for_index, url)
LAWS = [
    # Labor law — Ν.4808/2021 (εργατικό δίκαιο)
    (
        "N4808_2021_Εργατικό_Δίκαιο.pdf",
        "https://www.et.gr/api/DownloadFeksApi/?fekpdf=20210200051"
    ),
    # Consumer protection — Ν.2251/1994
    (
        "N2251_1994_Προστασία_Καταναλωτή.pdf",
        "https://www.et.gr/api/DownloadFeksApi/?fekpdf=19940100191"
    ),
]


def download_and_ingest(filename: str, url: str):
    print(f"\n→ {filename}")
    print(f"  Λήψη από: {url}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp_path = tmp.name

    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(tmp_path, 'wb') as f:
                f.write(response.read())

        size_kb = os.path.getsize(tmp_path) // 1024
        print(f"  Λήψη: {size_kb}KB")

        chunks = ingest_pdf(tmp_path, filename)
        print(f"  ✓ Αποθηκεύτηκαν {chunks} τμήματα")

    except Exception as e:
        print(f"  ✗ Σφάλμα: {e}")
        print(f"    Κατεβάστε το χειροκίνητα από: {url}")
        print(f"    Και αποθηκεύστε το ως: pdfs/{filename}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def ingest_local_pdfs():
    """Also ingest any PDFs placed manually in the pdfs/ folder."""
    pdfs_dir = Path(__file__).parent.parent / "pdfs"
    if not pdfs_dir.exists():
        return
    for pdf in pdfs_dir.glob("*.pdf"):
        print(f"\n→ {pdf.name} (τοπικό)")
        try:
            chunks = ingest_pdf(str(pdf), pdf.name)
            print(f"  ✓ Αποθηκεύτηκαν {chunks} τμήματα")
        except Exception as e:
            print(f"  ✗ Σφάλμα: {e}")


if __name__ == "__main__":
    print("=" * 50)
    print("Νομικός Βοηθός — Φόρτωση Νομοθεσίας")
    print("=" * 50)

    for filename, url in LAWS:
        download_and_ingest(filename, url)

    ingest_local_pdfs()

    print("\n" + "=" * 50)
    print("Ολοκληρώθηκε.")
    print("Τοποθετήστε επιπλέον PDF στον φάκελο pdfs/ και")
    print("τρέξτε ξανά το script για να τα προσθέσετε.")
    print("=" * 50)
