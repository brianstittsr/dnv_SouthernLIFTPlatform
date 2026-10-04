# Reports

KDM strategy reports for leadership review.

## KDM-Homepage-Redesign-Proposal.pdf

Homepage redesign + claims audit + KDM Gallery spec + recurring-revenue pricing
strategy + GovCon competitor analysis — prepared for Keith Moore.

### Regenerating after edits

Edit `homepage-redesign-report.html`, then run:

```
npx tsx scripts/generate-homepage-report.ts
```

The script renders the HTML with the installed Chrome browser (puppeteer) and
overwrites the PDF in this folder. `<!--DATE-->` in the HTML is replaced with
the generation date.
