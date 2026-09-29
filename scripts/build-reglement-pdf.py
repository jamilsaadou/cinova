#!/usr/bin/env python3
"""Génère public/reglement/reglement-cinova.pdf à partir de src/content/reglement.json.
Dépendance : fpdf2  (pip install fpdf2)."""
import json
import os
from fpdf import FPDF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "content", "reglement.json")
LOGO = os.path.join(ROOT, "public", "brand", "cinova-logo.png")
OUT_DIR = os.path.join(ROOT, "public", "reglement")
OUT = os.path.join(OUT_DIR, "reglement-cinova.pdf")

# Couleurs CINOVA
FOREST = (18, 58, 36)
GREEN = (46, 125, 70)
ACCENT = (233, 138, 43)
INK = (34, 48, 29)
MUTED = (91, 102, 80)
CREAM = (246, 242, 232)


def clean(s: str) -> str:
    """Rend le texte compatible latin-1 (police cœur de fpdf)."""
    repl = {
        "—": "-", "–": "-", "’": "'", "‘": "'",
        "“": '"', "”": '"', "…": "...", " ": " ",
        "œ": "oe", "‹": "<", "›": ">",
    }
    for k, v in repl.items():
        s = s.replace(k, v)
    return s.encode("latin-1", "replace").decode("latin-1")


class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_y(8)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*GREEN)
        self.cell(0, 6, "CINOVA - Reglement du challenge", align="L")
        self.ln(10)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 6, clean(f"Version de travail - page {self.page_no()}"), align="C")


def main():
    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)

    os.makedirs(OUT_DIR, exist_ok=True)
    pdf = PDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(20, 18, 20)
    pdf.add_page()

    # --- Bandeau de couverture ---
    pdf.set_fill_color(*FOREST)
    pdf.rect(0, 0, 210, 62, style="F")
    try:
        pdf.image(LOGO, x=20, y=14, w=64)
    except Exception:
        pass
    pdf.set_xy(20, 40)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(*CREAM)
    pdf.cell(0, 10, "Reglement du challenge", align="L")

    pdf.set_xy(20, 72)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(*INK)
    pdf.multi_cell(
        0, 6,
        clean(
            "CINOVA - Challenge national de l'innovation agropastorale et numerique. "
            "Porte par le Reseau National des Chambres d'Agriculture du Niger (RECA)."
        ),
    )
    pdf.ln(2)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(*MUTED)
    pdf.cell(0, 6, clean(f"{data['version']} - Derniere mise a jour : {data['updated']}"))
    pdf.ln(10)

    # --- Encadré "version de travail" ---
    pdf.set_draw_color(*ACCENT)
    pdf.set_fill_color(252, 243, 230)
    y0 = pdf.get_y()
    pdf.set_font("Helvetica", "", 9.5)
    pdf.set_text_color(*INK)
    notice = clean(
        "Ce reglement est une version de travail. Les montants, dates et ponderations "
        "definitifs seront arretes par le comite technique et publies avec l'appel a candidatures."
    )
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(0, 5.5, notice, border=1, fill=True, padding=4,
                   new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # --- Articles ---
    for art in data["articles"]:
        # éviter un titre orphelin en bas de page
        if pdf.get_y() > 250:
            pdf.add_page()
        pdf.set_font("Helvetica", "B", 12.5)
        pdf.set_text_color(*FOREST)
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 7, clean(art["title"]), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(1)
        pdf.set_font("Helvetica", "", 10.5)
        pdf.set_text_color(*INK)
        for p in art["paragraphs"]:
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(0, 5.6, clean(p), new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1.5)
        for li in art.get("list", []):
            pdf.set_x(pdf.l_margin + 4)
            pdf.multi_cell(0, 5.6, clean("- " + li), new_x="LMARGIN", new_y="NEXT")
            pdf.ln(0.5)
        pdf.ln(4)

    pdf.output(OUT)
    print(f"PDF genere : {OUT}")


if __name__ == "__main__":
    main()
