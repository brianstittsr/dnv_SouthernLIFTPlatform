"""Builds the Southern LIFT implementation pitch deck (PowerPoint).

The deck summarizes LIFT_Gap_Analysis.md and LIFT_System_Design.md.

Usage (from the repository root):
    python -m pip install --target "%TEMP%\\lift-pdf-tools\\py" python-pptx==1.0.2
    set PYTHONPATH=%TEMP%\\lift-pdf-tools\\py
    python "docs/SOUTHERN Requirenments/analysis/pptx/build_deck.py"
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.dml import MSO_LINE
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

OUTPUT = Path(__file__).resolve().parent.parent / "LIFT_Implementation_Pitch_Deck.pptx"

NAVY = RGBColor(0x0B, 0x25, 0x45)
BLUE = RGBColor(0x13, 0x40, 0x74)
GOLD = RGBColor(0xC9, 0xA2, 0x27)
INK = RGBColor(0x1F, 0x29, 0x33)
MUTED = RGBColor(0x5F, 0x6B, 0x7A)
LINE = RGBColor(0xD6, 0xDD, 0xE6)
ZEBRA = RGBColor(0xF4, 0xF7, 0xFB)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT = "Segoe UI"

RATING_COLORS = {
    "READY": (RGBColor(0xD1, 0xFA, 0xE5), RGBColor(0x06, 0x5F, 0x46)),
    "CONFIGURE": (RGBColor(0xDB, 0xEA, 0xFE), RGBColor(0x1E, 0x40, 0xAF)),
    "EXTEND": (RGBColor(0xFE, 0xF3, 0xC7), RGBColor(0x92, 0x40, 0x0E)),
    "BUILD": (RGBColor(0xFE, 0xE2, 0xE2), RGBColor(0x99, 0x1B, 0x1B)),
}

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
SLIDE_W = 13.333
slide_number = 0


def style_run(run, size: float, color: RGBColor = INK, bold: bool = False) -> None:
    """Applies font styling to a text run."""
    run.font.name = FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color


def text(slide, left: float, top: float, width: float, height: float, content: str | Sequence[str],
         size: float = 14, color: RGBColor = INK, bold: bool = False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, bullets: bool = False, spacing: float = 4):
    """Adds a text box; a sequence of strings becomes separate paragraphs."""
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    frame = box.text_frame
    frame.word_wrap = True
    frame.vertical_anchor = anchor
    frame.margin_left = frame.margin_right = Inches(0.05)
    frame.margin_top = frame.margin_bottom = Inches(0.03)
    lines = [content] if isinstance(content, str) else list(content)
    for index, line in enumerate(lines):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.alignment = align
        paragraph.space_after = Pt(spacing)
        run = paragraph.add_run()
        run.text = f"\u2022  {line}" if bullets else line
        style_run(run, size, color, bold)
    return box


def rect(slide, left: float, top: float, width: float, height: float, fill: RGBColor,
         line: RGBColor | None = None, shape=MSO_SHAPE.RECTANGLE):
    """Adds a filled shape without text."""
    item = slide.shapes.add_shape(shape, Inches(left), Inches(top), Inches(width), Inches(height))
    item.fill.solid()
    item.fill.fore_color.rgb = fill
    if line is None:
        item.line.fill.background()
    else:
        item.line.color.rgb = line
        item.line.width = Pt(1)
    item.shadow.inherit = False
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        item.adjustments[0] = 0.08
    return item


def badge(slide, left: float, top: float, rating: str, width: float = 1.15) -> None:
    """Adds a colored rating pill."""
    fill, color = RATING_COLORS[rating]
    pill = rect(slide, left, top, width, 0.3, fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    pill.adjustments[0] = 0.5
    frame = pill.text_frame
    frame.margin_top = frame.margin_bottom = 0
    paragraph = frame.paragraphs[0]
    paragraph.alignment = PP_ALIGN.CENTER
    run = paragraph.add_run()
    run.text = rating
    style_run(run, 9.5, color, True)


def new_slide(title: str, kicker: str | None = None):
    """Creates a content slide with a title, gold rule, and footer."""
    global slide_number
    slide_number += 1
    slide = prs.slides.add_slide(BLANK)
    rect(slide, 0, 0, SLIDE_W, 0.12, NAVY)
    if kicker:
        text(slide, 0.6, 0.32, 10, 0.3, kicker.upper(), 11, GOLD, True)
    text(slide, 0.6, 0.58, 12.1, 0.7, title, 28, NAVY, True)
    rect(slide, 0.62, 1.28, 1.1, 0.06, GOLD)
    rect(slide, 0, 7.1, SLIDE_W, 0.4, ZEBRA)
    text(slide, 0.6, 7.14, 9, 0.3, "Southern University LIFT Center  \u00b7  MBDA Rural Business Center  \u00b7  Implementation Plan",
         9, MUTED)
    text(slide, 11.9, 7.14, 0.85, 0.3, str(slide_number + 1), 9, MUTED, align=PP_ALIGN.RIGHT)
    return slide


def card(slide, left: float, top: float, width: float, height: float, heading: str,
         body: str | Sequence[str], accent: RGBColor = BLUE, size: float = 14, bullets: bool = False) -> None:
    """Adds a bordered card with an accent bar, heading, and body text."""
    rect(slide, left, top, width, height, WHITE, LINE, MSO_SHAPE.ROUNDED_RECTANGLE)
    rect(slide, left, top + 0.12, 0.07, height - 0.24, accent)
    text(slide, left + 0.22, top + 0.12, width - 0.35, 0.4, heading, 16, NAVY, True)
    text(slide, left + 0.22, top + 0.6, width - 0.35, height - 0.7, body, size, INK, bullets=bullets, spacing=6)


def stat(slide, left: float, top: float, width: float, value: str, label: str, dark: bool = False) -> None:
    """Adds a large statistic with a caption."""
    fill = NAVY if dark else ZEBRA
    rect(slide, left, top, width, 1.45, fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    text(slide, left, top + 0.15, width, 0.7, value, 30, GOLD if dark else NAVY, True, PP_ALIGN.CENTER)
    text(slide, left + 0.1, top + 0.88, width - 0.2, 0.5, label, 11, WHITE if dark else MUTED, align=PP_ALIGN.CENTER)


def table(slide, left: float, top: float, width: float, rows: Sequence[Sequence[str]],
          col_widths: Sequence[float], size: float = 11, row_height: float = 0.42,
          rating_col: int | None = None) -> None:
    """Adds a styled table; the first row is the header."""
    shape = slide.shapes.add_table(len(rows), len(rows[0]), Inches(left), Inches(top),
                                   Inches(width), Inches(row_height * len(rows)))
    grid = shape.table
    for index, col_width in enumerate(col_widths):
        grid.columns[index].width = Inches(col_width)
    for r, row in enumerate(rows):
        grid.rows[r].height = Inches(row_height)
        for c, value in enumerate(row):
            cell = grid.cell(r, c)
            cell.margin_left = cell.margin_right = Inches(0.08)
            cell.margin_top = cell.margin_bottom = Inches(0.04)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            header = r == 0
            rating = None if header or c != rating_col else value
            if header:
                cell.fill.fore_color.rgb = NAVY
            elif rating in RATING_COLORS:
                cell.fill.fore_color.rgb = RATING_COLORS[rating][0]
            else:
                cell.fill.fore_color.rgb = ZEBRA if r % 2 == 0 else WHITE
            frame = cell.text_frame
            frame.word_wrap = True
            paragraph = frame.paragraphs[0]
            if rating:
                paragraph.alignment = PP_ALIGN.CENTER
            run = paragraph.add_run()
            run.text = value
            color = WHITE if header else RATING_COLORS[rating][1] if rating in RATING_COLORS else INK
            style_run(run, size, color, header or bool(rating))


def chevrons(slide, top: float, steps: Iterable[tuple[str, str]], height: float = 1.0,
             left: float = 0.6, total_width: float = 12.1) -> None:
    """Adds a horizontal process flow of chevrons with captions."""
    steps = list(steps)
    width = total_width / len(steps)
    for index, (label, caption) in enumerate(steps):
        x = left + index * width
        fill = NAVY if index % 2 == 0 else BLUE
        overlap = 0.12 if index < len(steps) - 1 else 0
        shape = rect(slide, x, top, width + overlap, height,
                     fill, shape=MSO_SHAPE.PENTAGON if index == 0 else MSO_SHAPE.CHEVRON)
        frame = shape.text_frame
        frame.margin_left = Inches(0.25 if index else 0.1)
        paragraph = frame.paragraphs[0]
        paragraph.alignment = PP_ALIGN.CENTER
        run = paragraph.add_run()
        run.text = label
        style_run(run, 12, WHITE, True)
        text(slide, x + 0.05, top + height + 0.12, width - 0.1, 1.3, caption, 12, INK, align=PP_ALIGN.CENTER)


def notes(slide, content: str) -> None:
    """Adds speaker notes."""
    slide.notes_slide.notes_text_frame.text = content


# 1. Title -----------------------------------------------------------------------------
slide = prs.slides.add_slide(BLANK)
rect(slide, 0, 0, SLIDE_W, 7.5, NAVY)
rect(slide, 8.9, 0, 4.43, 7.5, BLUE)
ring = slide.shapes.add_shape(MSO_SHAPE.DONUT, Inches(9.6), Inches(-1.6), Inches(5.6), Inches(5.6))
ring.fill.solid()
ring.fill.fore_color.rgb = GOLD
ring.line.fill.background()
ring.adjustments[0] = 0.06
for index, label in enumerate(["SOUTHERN UNIVERSITY\nLIFT CENTER LOGO", "MBDA LOGO\n(per current branding guide)"]):
    slot = rect(slide, 0.8 + index * 2.7, 0.7, 2.45, 0.8, NAVY, RGBColor(0x9F, 0xB3, 0xC8), MSO_SHAPE.ROUNDED_RECTANGLE)
    slot.line.dash_style = MSO_LINE.DASH
    frame = slot.text_frame
    paragraph = frame.paragraphs[0]
    paragraph.alignment = PP_ALIGN.CENTER
    run = paragraph.add_run()
    run.text = label
    style_run(run, 9, RGBColor(0xC8, 0xD3, 0xE0), True)
text(slide, 0.8, 2.05, 7.9, 0.4, "IMPLEMENTATION PLAN  \u00b7  PLATFORM PITCH", 13, GOLD, True)
text(slide, 0.8, 2.5, 7.9, 1.9, "Powering the Southern University LIFT Rural Business Center", 34, WHITE, True)
text(slide, 0.8, 4.45, 7.6, 1.0,
     "How the SVP Platform meets MBDA Rural Business Center requirements \u2014 and the plan to close the remaining gaps.",
     16, RGBColor(0xDB, 0xE4, 0xEE))
rect(slide, 0.82, 5.7, 1.2, 0.06, GOLD)
text(slide, 0.8, 5.9, 8, 0.9, ["MBDA-OBC-2026-00003  \u00b7  Southern University and A&M College, College of Business",
                                 "Prepared by KDM & Associates, LLC  \u00b7  October 2026  \u00b7  Draft for discussion"], 12,
     RGBColor(0xDB, 0xE4, 0xEE))
notes(slide, "Purpose: align Southern, KDM, and partners on how the existing SVP Platform will be deployed as the LIFT "
             "Center's intake, CRM, training, and reporting system, and what must be built to meet MBDA measures.")

# 2. Program at a glance --------------------------------------------------------------
slide = new_slide("One of only three HBCU-led MBDA Rural Business Centers", "The opportunity")
stat(slide, 0.6, 1.65, 2.85, "$1.275M", "3-year MBDA cooperative agreement (Sept 2026 \u2013 Aug 2029)", True)
stat(slide, 3.65, 1.65, 2.85, "500", "Clients served over three years")
stat(slide, 6.7, 1.65, 2.85, "50", "New businesses entering the federal supply chain")
stat(slide, 9.75, 1.65, 2.95, "600", "Jobs supported \u00b7 $2.125M capital accessed")
card(slide, 0.6, 3.4, 6.0, 3.45, "What the Center delivers",
     ["Business formation, growth, and capital readiness",
      "Procurement readiness: federal contracting, CMMC, HUBZone, OZ, mentor-prot\u00e9g\u00e9",
      "Advanced Metal Additive Manufacturing business program",
      "Digital literacy, AI adoption, and cybersecurity readiness",
      "One coordinated point of entry across Southern units and partners"], bullets=True)
card(slide, 6.85, 3.4, 5.85, 3.45, "What the platform must do (MOU \u00a73)",
     ["Intake, CRM, data tracking, and reporting",
      "Assess needs and route clients to services",
      "Monitor progress at every touchpoint",
      "Report against MBDA performance measures",
      "Protect PII and confidential business data"], accent=GOLD, bullets=True)
notes(slide, "Three-year goals reflect the press release and Project Narrative. Year 1 targets differ between source "
             "documents and will be confirmed; the platform stores them as configurable values.")

# 3. What MBDA measures ---------------------------------------------------------------
slide = new_slide("MBDA scores the Center on evidence-backed outcomes", "What success looks like")
table(slide, 0.6, 1.6, 12.1, [
    ["Measure", "Type", "Definition", "Verification evidence"],
    ["Clients Served", "Core", "Unique clients counseled or trained (\u22651 session)", "Intake / CRM records"],
    ["New Business Starts", "Core", "Registration after enrollment + qualifying activity", "Business registration"],
    ["Capital Infusion", "Core", "Debt and investment from all sources", "Financial documents"],
    ["Jobs Supported", "Core", "Jobs created or retained with Center help", "Payroll / self-report"],
    ["Revenue Growth", "Core", "% of businesses with 12-month revenue increase", "Pre/post financials"],
    ["Training, capital packages, contracts, digital adoption, AM participants, CMMC/HUBZone/OZ completions",
     "Project", "Six program-specific activity and readiness measures", "Logs, certificates, contract docs"],
], [3.6, 1.1, 4.3, 3.1], size=11.5, row_height=0.6)
text(slide, 0.6, 6.1, 12.1, 0.8,
     "MBDA assesses semi-annually against a straight-line interpolation of annual targets. Every number must trace to a verified record.",
     13, BLUE, True)

# 4. The challenge --------------------------------------------------------------------
slide = new_slide("Year 1 demands an operational platform in 90 days", "The Year 1 Performance Matrix")
quarters = [
    ("Q1 \u00b7 Months 1\u20133", "Staff onboarding, KDM PMO, platform deployment, MOUs",
     "100% personnel onboarded \u00b7 platform operational \u00b7 80% partner agreements"),
    ("Q2 \u00b7 Months 4\u20136", "Outreach, intake assessments, entrepreneurship training",
     "50 clients enrolled \u00b7 10 workshops \u00b7 baseline data captured"),
    ("Q3 \u00b7 Months 7\u20139", "Capital readiness, AM cohorts, CMMC/HUBZone training",
     "100 cumulative clients \u00b7 15 capital packages \u00b7 10 completions"),
    ("Q4 \u00b7 Months 10\u201312", "Consulting, contract matchmaking, performance review",
     "150 clients \u00b7 20 new businesses \u00b7 10 contracts"),
]
for index, (quarter, activity, milestone) in enumerate(quarters):
    x = 0.6 + index * 3.07
    rect(slide, x, 1.65, 2.9, 0.55, NAVY if index % 2 == 0 else BLUE, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    text(slide, x, 1.7, 2.9, 0.45, quarter, 14, WHITE, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
    rect(slide, x, 2.3, 2.9, 2.75, WHITE, LINE, MSO_SHAPE.ROUNDED_RECTANGLE)
    text(slide, x + 0.15, 2.4, 2.6, 0.3, "ACTIVITIES", 9.5, GOLD, True)
    text(slide, x + 0.15, 2.7, 2.6, 0.95, activity, 12)
    text(slide, x + 0.15, 3.6, 2.6, 0.3, "MILESTONES", 9.5, GOLD, True)
    text(slide, x + 0.15, 3.9, 2.6, 1.1, milestone, 12, NAVY, True)
rect(slide, 0.6, 5.3, 12.1, 1.5, ZEBRA, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
text(slide, 0.85, 5.42, 11.6, 1.3, [
    "\u201cWe need a platform first before we start bringing people\u2026 we don\u2019t have anywhere to send them.\u201d  \u2014 Oct 21 planning call",
    "Risk: centers that report zero Q1 results fall behind. Plan: launch a pilot cohort on the existing platform before November 10.",
], 13, INK, spacing=6)
notes(slide, "Milestones shown as written in the Year 1 matrix image. The 08/31 worksheet uses lower Y1 targets "
             "(100 clients, 10 starts, 5 contracts); confirmation is an open decision.")

# 5. Platform today -------------------------------------------------------------------
slide = new_slide("The SVP Platform already provides most building blocks", "What exists today")
tiles = [
    ("Intake & onboarding", "Client registration mirrors the MBDA intake & engagement form; guided onboarding"),
    ("CRM & pipeline", "Leads, customers, readiness and pipeline Kanbans, command center, tasks"),
    ("Learning", "Cohorts, curriculum, instructor tools, assessments, certificates"),
    ("Events & webinars", "Event manager, registration with check-in, webinar creator and archive"),
    ("Procurement", "SAM.gov search with AI scoring, teaming, pursuits, proposal wizard"),
    ("Documents & e-sign", "Document storage, proof packs, NDA e-signature flow"),
    ("Engagement", "Communications, MailChimp, GoHighLevel workflows, notifications"),
    ("Insight & control", "Analytics, audit logs, routing rules, AI chat assistant, white-label"),
]
for index, (heading, body) in enumerate(tiles):
    col, row = index % 4, index // 4
    card(slide, 0.6 + col * 3.07, 1.65 + row * 2.6, 2.9, 2.4, heading, body,
         accent=GOLD if (col + row) % 2 else BLUE)
notes(slide, "Inventory is based on routes, APIs, and schemas in the svp-platform codebase. Depth of each module "
             "should be confirmed in a hands-on walkthrough.")

# 6. Requirements match ---------------------------------------------------------------
slide = new_slide("How the platform matches LIFT requirements", "Gap analysis summary")
table(slide, 0.6, 1.55, 12.1, [
    ["Program area", "Rating", "What it takes"],
    ["Deployment, branding, module scope", "CONFIGURE", "Separate LIFT instance, MBDA branding, disable KDM-only modules"],
    ["Outreach, PMO workspace, fee-based services", "CONFIGURE", "LIFT templates and copy; fee services kept separate"],
    ["Intake, consent, case management, routing", "EXTEND", "Add rural eligibility, consent versions, LIFT stages, partner routing"],
    ["Training, events, certificates", "EXTEND", "Generic LIFT tracks; webinar-to-course; attendance feeds metrics"],
    ["Procurement and proposals", "EXTEND", "Replace mock AI analysis; compliance matrix; capability library"],
    ["AI interview and form builder", "BUILD", "Port partner modules (specs available)"],
    ["Outcome evidence and MBDA reporting", "BUILD", "Evidence vault, verification workflow, metrics engine, MBDA export"],
    ["Capital readiness, grant & invoice compliance, partner agreements", "BUILD", "New modules for packages, invoices, and MOU tracking"],
], [4.6, 1.6, 5.9], size=11.5, row_height=0.52, rating_col=1)
legend = [("READY", "Use as-is"), ("CONFIGURE", "Settings only"), ("EXTEND", "Code changes"), ("BUILD", "New module")]
for index, (rating, label) in enumerate(legend):
    badge(slide, 0.6 + index * 3.05, 6.72, rating)
    text(slide, 1.85 + index * 3.05, 6.72, 1.7, 0.3, label, 10.5, MUTED)

# 7. Year 1 traceability --------------------------------------------------------------
slide = new_slide("Every Year 1 milestone maps to a platform capability", "Requirements traceability")
table(slide, 0.6, 1.55, 12.1, [
    ["Year 1 milestone", "Existing SVP capability", "Rating", "New / extended module"],
    ["Platform operational; personnel onboarded", "White-label, user management, system health", "CONFIGURE", "M1 Tenant & Branding"],
    ["80% partner agreements executed", "Strategic partners, NDA e-signature", "BUILD", "M13 Partner Agreements"],
    ["50 clients enrolled; baseline captured", "Client registration, surveys", "EXTEND", "M2 Forms, M3 Interview, M4 Intake"],
    ["10 workshops delivered", "Events, webinars, cohorts", "EXTEND", "M7 Learning Hub"],
    ["15 capital packages", "Proof packs, documents", "BUILD", "M8 Capital Readiness"],
    ["10 AM / procurement completions", "Cohorts, certificates, readiness", "EXTEND", "M7 Learning Hub"],
    ["Contracts secured; new businesses", "SAM.gov AI, teaming, pursuits", "EXTEND", "M9 Proposals, M10 Evidence"],
    ["Annual performance report", "Analytics (website only today)", "BUILD", "M11 Metrics & Reporting"],
], [3.6, 3.7, 1.5, 3.3], size=11, row_height=0.54, rating_col=2)

# 8. Gaps to close --------------------------------------------------------------------
slide = new_slide("Ten gaps stand between today and an MBDA-ready center", "Priority gaps")
gaps = [
    "MBDA metrics engine linked to evidence",
    "Outcome verification and evidence vault",
    "LIFT intake with rural eligibility and signed consent",
    "Form Builder port (replaces JotForm)",
    "AI Intake Interview port",
    "Program roles and protected data access",
    "Grant compliance and quarterly invoice packets",
    "Proposal Accelerator (replace mock AI)",
    "LIFT Learning Hub (rebranded webinar courses)",
    "Partner agreement tracker (80% milestone)",
]
for index, gap in enumerate(gaps):
    col, row = index // 5, index % 5
    x, y = 0.6 + col * 6.15, 1.65 + row * 1.03
    circle = rect(slide, x, y + 0.08, 0.62, 0.62, NAVY if index < 3 else BLUE, shape=MSO_SHAPE.OVAL)
    frame = circle.text_frame
    frame.word_wrap = False
    frame.margin_left = frame.margin_right = 0
    paragraph = frame.paragraphs[0]
    paragraph.alignment = PP_ALIGN.CENTER
    run = paragraph.add_run()
    run.text = str(index + 1)
    style_run(run, 15, GOLD if index < 3 else WHITE, True)
    text(slide, x + 0.8, y + 0.08, 5.1, 0.62, gap, 15, INK, index < 3, anchor=MSO_ANCHOR.MIDDLE)
text(slide, 0.6, 6.75, 12, 0.3, "Gaps 1\u20133 are critical path: without them, activity cannot be counted toward MBDA measures.",
     11, MUTED)

# 9. Architecture ---------------------------------------------------------------------
slide = new_slide("Target solution: a dedicated LIFT platform with 15 modules", "Solution architecture")
layers = [
    ("Public site", "Program info \u00b7 events \u00b7 public forms \u00b7 AI intake"),
    ("Client portal", "Intake \u00b7 signatures \u00b7 learning \u00b7 proposals \u00b7 check-ins"),
    ("Staff & partner portal", "Pipeline \u00b7 referrals \u00b7 verification \u00b7 MBDA reports \u00b7 invoices"),
]
for index, (heading, body) in enumerate(layers):
    x = 0.6 + index * 4.07
    rect(slide, x, 1.6, 3.9, 1.05, BLUE, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    text(slide, x + 0.15, 1.65, 3.6, 0.4, heading, 14, WHITE, True)
    text(slide, x + 0.15, 2.05, 3.6, 0.55, body, 11, RGBColor(0xDB, 0xE4, 0xEE))
modules = ["M1 Tenant & Branding", "M2 Form Builder", "M3 AI Intake Interview", "M4 Intake & Eligibility",
           "M5 Lifecycle & Cases", "M6 Referral Routing", "M7 Learning Hub", "M8 Capital Readiness",
           "M9 Proposal Accelerator", "M10 Evidence Vault", "M11 Metrics & Reporting", "M12 Grant & Invoices",
           "M13 Partner Agreements", "M14 Feedback & Impact", "M15 AI Assistant & Alerts"]
rect(slide, 0.6, 2.85, 12.1, 2.25, ZEBRA, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
for index, module in enumerate(modules):
    col, row = index % 5, index // 5
    tile = rect(slide, 0.8 + col * 2.37, 3.0 + row * 0.68, 2.25, 0.55, WHITE, LINE, MSO_SHAPE.ROUNDED_RECTANGLE)
    frame = tile.text_frame
    paragraph = frame.paragraphs[0]
    paragraph.alignment = PP_ALIGN.CENTER
    run = paragraph.add_run()
    run.text = module
    style_run(run, 10.5, NAVY, True)
rect(slide, 0.6, 5.3, 12.1, 0.75, NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
text(slide, 0.8, 5.35, 11.7, 0.65,
     "Shared services: role-based access \u00b7 audit \u00b7 program event bus \u00b7 AI provider \u00b7 files \u00b7 e-signature \u00b7 PDF/Word export \u00b7 scheduler",
     12.5, WHITE, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
text(slide, 0.6, 6.25, 12.1, 0.7,
     "Separate deployment: own Firebase project, domain, and email; LIFT client data never mixes with KDM consortium data. "
     "Integrations: SAM.gov \u00b7 AI provider \u00b7 email & campaigns \u00b7 calendar \u00b7 MBDA performance system export.",
     11.5, MUTED)

# 10. Client journey ------------------------------------------------------------------
slide = new_slide("One client journey, captured end to end", "How the platform works")
chevrons(slide, 1.75, [
    ("Discover", "Outreach, events, partner referrals, KDM pilot invitations"),
    ("Intake", "AI interview or form; MBDA consent signed; rural eligibility checked"),
    ("Assess", "Baseline survey and needs assessment; service plan approved"),
    ("Serve", "Sessions, workshops, cohorts, referrals to SBDC, AM Lab, lenders"),
    ("Outcome", "Capital, jobs, contracts, new starts claimed with evidence"),
    ("Report", "Verified facts roll up to MBDA measures and report packs"),
], height=1.0)
card(slide, 0.6, 4.35, 3.9, 2.5, "Unified client ID",
     "One record follows each business across Southern units, partners, and KDM services, preventing duplicate counts.")
card(slide, 4.7, 4.35, 3.9, 2.5, "Evidence at every step",
     "Signed consent, attendance, certificates, and award documents are attached to the outcome they prove.",
     accent=GOLD)
card(slide, 8.8, 4.35, 3.9, 2.5, "Humans decide, AI assists",
     "AI drafts and flags; staff confirm eligibility, verify outcomes, and approve submissions.")

# 11. AI Intake Interview -------------------------------------------------------------
slide = new_slide("AI Intake Interview: faster onboarding, better baseline data", "Featured capability")
card(slide, 0.6, 1.6, 5.9, 3.3, "How it works",
     ["Conversational, one question at a time \u2014 mobile and low-bandwidth friendly",
      "Public (no sign-in) or client-portal mode",
      "Tracks coverage of required topics; accepts financial and capability documents",
      "Produces a draft intake record, needs assessment, and recommended service plan",
      "Deterministic fallback if the AI service is unavailable; every version hashed and audited"],
     bullets=True, size=13)
table(slide, 6.75, 1.6, 5.95, [
    ["LIFT interview template", "Produces"],
    ["Client intake", "Draft client record + service plan"],
    ["Baseline assessment", "Revenue, jobs, capital snapshot"],
    ["6- and 12-month check-ins", "Outcome claims with evidence requests"],
    ["Advisor session debrief", "Session log and next steps"],
    ["Partner intake", "Partner profile and agreement task"],
], [3.0, 2.95], size=11.5, row_height=0.53)
rect(slide, 0.6, 5.15, 12.1, 1.7, ZEBRA, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
text(slide, 0.85, 5.25, 11.6, 1.5, [
    "Safeguards: no client counts as enrolled until staff confirm and the MBDA consent form is signed. AI never decides eligibility.",
    "Supports: Clients Served, baseline data (Q2), Jobs Supported, Revenue Growth, Capital Infusion, Contracts Secured.",
], 14, INK, anchor=MSO_ANCHOR.MIDDLE, spacing=10)
notes(slide, "Ported from the reusable Requirements Interview Tool specification (Adams Harness). The PRD build/deploy "
             "adapter is not ported to the LIFT site.")

# 12. Form Builder --------------------------------------------------------------------
slide = new_slide("Form Builder: replaces JotForm with signed, connected forms", "Featured capability")
card(slide, 0.6, 1.6, 5.0, 3.6, "Why it beats a standalone form tool",
     ["Writes one submission to multiple program records",
      "Import the official MBDA intake PDF and sign it as-is",
      "Standard, conversational, and document-overlay modes",
      "Signatures, file uploads, ratings, repeating tables",
      "AI builds forms and optimizes questions for reporting",
      "Drop-off analytics and branded PDF of each submission"], bullets=True, size=13)
forms = ["MBDA intake & engagement (signed)", "Rural eligibility attestation", "Baseline survey",
         "Workshop registration & feedback", "Outcome evidence submission", "Capital readiness checklist",
         "Advisor session log", "Partner agreement intake", "Staff onboarding acknowledgment"]
text(slide, 5.85, 1.6, 6.8, 0.35, "LIFT FORM CATALOG", 11, GOLD, True)
for index, form in enumerate(forms):
    col, row = index % 2, index // 2
    tile = rect(slide, 5.85 + col * 3.45, 2.0 + row * 0.62, 3.3, 0.5, ZEBRA, LINE, MSO_SHAPE.ROUNDED_RECTANGLE)
    frame = tile.text_frame
    frame.margin_left = Inches(0.12)
    run = frame.paragraphs[0].add_run()
    run.text = form
    style_run(run, 11, NAVY, True)
rect(slide, 0.6, 5.45, 12.1, 1.4, NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
text(slide, 0.85, 5.55, 11.6, 1.2, [
    "Hardening before go-live: API keys hashed and server-side, files and signatures stored outside the database,",
    "public submissions rate-limited and validated, and a signature audit trail (consent text, form version, content hash).",
], 14, WHITE, anchor=MSO_ANCHOR.MIDDLE, spacing=4)

# 13. Proposal Accelerator ------------------------------------------------------------
slide = new_slide("Proposal Accelerator: faster SAM.gov responses", "Featured capability")
chevrons(slide, 1.7, [
    ("Match", "AI-scored SAM.gov notices for the client's profile and set-asides"),
    ("Analyze", "Notice and attachments parsed: dates, NAICS, factors, certifications"),
    ("Go / No-Go", "Fit score, gaps, and suggested teaming partners"),
    ("Draft", "Compliance matrix + RFI, sources-sought, capability statement, RFP outline"),
    ("Review", "LIFT advisor reviews; client approves and submits"),
    ("Award", "Award documented \u2192 verified Contract Secured"),
], height=0.95)
card(slide, 0.6, 4.3, 5.95, 2.55, "Built on what exists",
     ["SAM.gov search, sync, and AI opportunity scoring (live today)",
      "Teaming recommendations and proposal wizard",
      "Replaces today's mock solicitation and bid analysis with real AI"], bullets=True)
card(slide, 6.75, 4.3, 5.95, 2.55, "Guardrails and measures",
     ["Drafts cite only the client's verified capabilities",
      "No controlled (CUI) documents sent to AI; advisor review required",
      "Tracks responses, time-to-draft, win rate, contracts secured"], accent=GOLD, bullets=True)

# 14. Evidence & reporting ------------------------------------------------------------
slide = new_slide("Evidence-backed metrics, ready for MBDA review", "Accountability")
chevrons(slide, 1.7, [
    ("Activity", "Session, workshop, award, or form submission"),
    ("Outcome claim", "Value, date, and attribution recorded"),
    ("Evidence", "Registration, closing letter, payroll, contract"),
    ("Verification", "Second-person staff approval"),
    ("Metric", "Counted for the measure and period"),
], height=0.95)
card(slide, 0.6, 4.25, 3.9, 2.6, "Configurable targets",
     "Targets by year and quarter are admin-editable and versioned, with approval, because source documents differ.")
card(slide, 4.7, 4.25, 3.9, 2.6, "Reports on schedule",
     "Real-time dashboard, monthly internal report, quarterly invoice support, semi-annual MBDA pack, annual report.",
     accent=GOLD)
card(slide, 8.8, 4.25, 3.9, 2.6, "Audit-ready",
     "Reproducible snapshots with hashes; records retained per 2 CFR 200; export adapter for MBDA's system.")

# 15. Roadmap -------------------------------------------------------------------------
slide = new_slide("Phased roadmap tied to pilot, launch, and invoices", "Implementation plan")
phases = [
    ("PHASE 0", "Pilot readiness", "Now \u2192 Nov 10",
     ["Separate LIFT site with MBDA branding", "Signed intake & consent form", "Basic client record + rural rule",
      "Rebranded webinar archive", "Pilot invitations (10\u201320 companies)"]),
    ("PHASE 1", "Public launch", "\u2192 ~Nov 19 ribbon cutting",
     ["AI Intake Interview", "Lifecycle stages and sessions", "Partner referral routing",
      "Partner agreement tracker", "AI assistant (status queries)"]),
    ("PHASE 2", "Q2 operations", "Months 4\u20136",
     ["Capital readiness", "Proposal Accelerator", "Evidence vault and verification",
      "Metrics & MBDA reporting", "Grant & invoice tracker"]),
    ("PHASE 3", "Optimization", "Months 7+",
     ["Feedback and impact stories", "Off-track alerts and briefings", "Enhancements from pilot learning"]),
]
rect(slide, 0.6, 2.35, 12.1, 0.08, LINE)
for index, (tag, name, window, items) in enumerate(phases):
    x = 0.6 + index * 3.07
    dot = rect(slide, x + 1.3, 2.17, 0.42, 0.42, GOLD if index == 0 else NAVY, shape=MSO_SHAPE.OVAL)
    dot.line.color.rgb = WHITE
    text(slide, x, 1.55, 2.9, 0.3, tag, 11, GOLD, True, PP_ALIGN.CENTER)
    text(slide, x, 1.8, 2.9, 0.3, window, 10.5, MUTED, align=PP_ALIGN.CENTER)
    rect(slide, x, 2.8, 2.9, 4.05, NAVY if index == 0 else WHITE, LINE, MSO_SHAPE.ROUNDED_RECTANGLE)
    text(slide, x + 0.18, 2.92, 2.6, 0.45, name, 15, WHITE if index == 0 else NAVY, True)
    text(slide, x + 0.18, 3.45, 2.6, 3.3, items, 13, WHITE if index == 0 else INK, bullets=True, spacing=8)
notes(slide, "Phase 0 produces first-quarter results for the invoice narrative. The ~Nov 19 date aligns with the mobile "
             "CAVE launch and AM Lab ribbon cutting; confirm with MBDA availability.")

# 16. Governance & compliance ---------------------------------------------------------
slide = new_slide("Built for federal accountability and client trust", "Governance & compliance")
table(slide, 0.6, 1.6, 6.3, [
    ["Role", "Access"],
    ["PI / Project Director / KDM PMO", "Full program data and approvals"],
    ["Program managers", "Assigned clients; verify outcomes"],
    ["Partner advisors", "Referred clients and shared fields only"],
    ["Instructors", "Enrolled participants"],
    ["Evaluators", "De-identified and aggregated data"],
    ["Clients", "Own records, uploads, progress"],
    ["MBDA viewer", "Read-only MBDA reports"],
], [3.0, 3.3], size=11, row_height=0.52)
card(slide, 7.15, 1.6, 5.55, 5.25, "Compliance safeguards",
     ["Separate deployment; role- and field-level protection of PII and financials",
      "Versioned consent and MBDA privacy disclosure; consent before partner sharing",
      "Write-once audit log; records retention per 2 CFR 200",
      "MOU guardrail: no federal funds for loans, grants, equity, construction, or lobbying",
      "AI data handling: redact sensitive fields; no CUI to AI providers",
      "MBDA branding guide followed on every public page and certificate"],
     accent=GOLD, bullets=True)

# 17. Risks ---------------------------------------------------------------------------
slide = new_slide("Key risks and how we mitigate them", "Risk management")
table(slide, 0.6, 1.6, 12.1, [
    ["Risk", "Mitigation"],
    ["Zero Q1 results because the platform is not ready", "Phase 0 pilot on existing modules by Nov 10"],
    ["Unconfirmed targets and MBDA reporting format", "Configurable targets; reporting adapter; confirm at orientation"],
    ["Exposure of PII or confidential business data", "Separate deployment, role-scoped access, secure file storage, audit"],
    ["AI errors in intake or proposals", "Human review gates; drafts limited to verified facts; labeled AI output"],
    ["Invoice delays (subaward / PO pending)", "Grant tracker with PO status; evidence packets prepared in advance"],
    ["50% budget reduction limits build capacity", "Reuse existing modules first; phase builds by invoice milestones"],
    ["MBDA branding non-compliance", "Request current guide; configurable logo lockup and review"],
], [5.6, 6.5], size=12, row_height=0.6)

# 18. Decisions & next steps ----------------------------------------------------------
slide = new_slide("Decisions needed to start building", "Next steps")
card(slide, 0.6, 1.6, 6.0, 5.25, "Decisions for Southern, KDM, and MBDA",
     ["Confirm authoritative Year 1\u20133 targets",
      "MBDA performance system and report format",
      "Rural eligibility definition and data source",
      "Electronic consent for the OMB-approved intake form",
      "Approved AI provider and data-handling terms",
      "LIFT domain, email, and current MBDA branding guide",
      "Partner portal access vs. email referrals"], bullets=True, size=13)
steps = [
    ("This week", "Approve plan and Phase 0 scope; request MBDA branding guide"),
    ("By Nov 10", "Launch pilot site, signed intake, and webinar archive"),
    ("By ~Nov 19", "Public launch with AI intake and partner routing"),
    ("Q2", "Evidence vault, metrics engine, and first MBDA report pack"),
]
for index, (when, what) in enumerate(steps):
    y = 1.6 + index * 1.33
    rect(slide, 6.85, y, 5.85, 1.18, NAVY if index == 0 else ZEBRA, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    text(slide, 7.05, y + 0.1, 5.5, 0.35, when.upper(), 11, GOLD, True)
    text(slide, 7.05, y + 0.45, 5.5, 0.7, what, 13, WHITE if index == 0 else INK, True)

# 19. Close ---------------------------------------------------------------------------
slide = prs.slides.add_slide(BLANK)
rect(slide, 0, 0, SLIDE_W, 7.5, NAVY)
rect(slide, 0, 6.2, SLIDE_W, 1.3, BLUE)
text(slide, 0.8, 1.9, 11.7, 0.5, "RISE AS WE LIFT", 14, GOLD, True)
text(slide, 0.8, 2.4, 11.7, 1.6, "One connected platform for every rural Louisiana business the Center serves", 36, WHITE, True)
rect(slide, 0.82, 4.25, 1.2, 0.06, GOLD)
text(slide, 0.8, 4.5, 11.5, 1.2,
     "Reuse what works today, build what MBDA measures, and launch the pilot in weeks \u2014 not months.", 18,
     RGBColor(0xDB, 0xE4, 0xEE))
text(slide, 0.8, 6.45, 11.7, 0.8, ["Keith Moore, KDM & Associates  \u00b7  kmoore@kdm-assoc.com",
                                   "Supporting documents: LIFT Gap Analysis and LIFT System Design (October 2026)"], 12,
     WHITE)

prs.core_properties.title = "Southern University LIFT Center - Implementation Plan"
prs.core_properties.author = "KDM & Associates, LLC"
prs.core_properties.subject = "SVP Platform gap analysis and implementation plan for the MBDA Rural Business Center"
prs.save(OUTPUT)
print(f"Created {OUTPUT.name} ({len(prs.slides)} slides)")
