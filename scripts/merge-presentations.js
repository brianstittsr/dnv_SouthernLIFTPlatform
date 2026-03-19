const pptxgen = require('pptxgenjs');
const path = require('path');

const colors = {
  primary: '1a365d', primaryLight: '2c5282', accent: 'c8a951', accentGold: 'f5a623',
  success: '38a169', warning: 'ed8936', danger: 'e53e3e', toyotaRed: 'eb0a1e',
  gray50: 'f7fafc', gray100: 'edf2f7', gray200: 'e2e8f0', gray500: '718096',
  gray600: '4a5568', gray700: '2d3748', gray800: '1a202c', white: 'FFFFFF'
};

function addLogoBar(slide) {
  slide.addText([{ text: 'V', options: { fontSize: 24, bold: true, color: colors.accentGold } },
    { text: '+', options: { fontSize: 14, bold: true, color: colors.accentGold, superscript: true } }], 
    { x: 0.5, y: 5.0, w: 0.5, h: 0.4 });
  slide.addText('Strategic\nValue+', { x: 0.9, y: 5.0, w: 1, h: 0.4, fontSize: 9, color: colors.primary });
  slide.addText('BELPAK', { x: 11.5, y: 5.0, w: 1, h: 0.35, fontSize: 10, bold: true, color: colors.white, fill: { color: colors.primary }, align: 'center', valign: 'middle' });
}

function addHeader(pptx, slide, text, slideNum, isV2 = false) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: colors.primary } });
  if (isV2) slide.addText('V2 - REVISED', { x: 11, y: 0.15, w: 1.3, h: 0.25, fontSize: 9, bold: true, color: colors.white, fill: { color: colors.accentGold }, align: 'center' });
  slide.addText(text, { x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 22, bold: true, color: colors.primary });
  addLogoBar(slide);
  slide.addText(String(slideNum), { x: 12.2, y: 5.0, w: 0.3, h: 0.3, fontSize: 10, color: colors.gray500 });
}

async function createMergedPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'BelPak - Toyota Battery Manufacturing NC - Combined Presentation';
  pptx.author = 'Strategic Value Plus';

  let slideNum = 1;

  // ========== V1 SLIDES (1-11) ==========
  
  // V1 Slide 1: Title
  let s1 = pptx.addSlide();
  s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: colors.primary } });
  s1.addText('BELPAK', { x: 4.5, y: 1.5, w: 4, h: 0.5, fontSize: 18, color: colors.white, align: 'center', fill: { color: colors.accent } });
  s1.addText('Toyota Battery Manufacturing NC', { x: 1, y: 2.2, w: 11, h: 0.8, fontSize: 44, bold: true, color: colors.primary, align: 'center' });
  s1.addShape(pptx.shapes.RECTANGLE, { x: 5.5, y: 3.1, w: 2, h: 0.08, fill: { color: colors.accent } });
  s1.addText('Supplier Qualification Brief', { x: 1, y: 3.3, w: 11, h: 0.5, fontSize: 24, color: colors.gray600, align: 'center' });
  s1.addText('Prepared by Strategic Value+ Solutions | December 2025', { x: 1, y: 4.5, w: 11, h: 0.3, fontSize: 12, color: colors.gray500, align: 'center' });
  addLogoBar(s1); s1.addText(String(slideNum++), { x: 12.2, y: 5.0, w: 0.3, h: 0.3, fontSize: 10, color: colors.gray500 });

  // V1 Slide 2
  let s2 = pptx.addSlide(); addHeader(pptx, s2, "BelPak's embedded operations model positions them as a potential Toyota Battery NC partner", slideNum++);
  s2.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 1.0, w: 5.8, h: 2.2, fill: { color: colors.gray50 } });
  s2.addText('🎯 The Opportunity', { x: 0.7, y: 1.1, w: 5.4, h: 0.4, fontSize: 14, bold: true, color: colors.primary });
  s2.addText('• Contract packaging and logistics\n• Embedded operations with Subaru\n• EBE certification\n• 25+ facilities nationwide', { x: 0.7, y: 1.5, w: 5.4, h: 1.6, fontSize: 12, color: colors.gray700 });
  s2.addShape(pptx.shapes.RECTANGLE, { x: 6.5, y: 1.0, w: 5.8, h: 2.2, fill: { color: 'fff5eb' } });
  s2.addText('⚠️ Key Gaps', { x: 6.7, y: 1.1, w: 5.4, h: 0.4, fontSize: 14, bold: true, color: colors.warning });
  s2.addText('• No hazmat experience\n• ISO/IATF certifications needed\n• Battery expertise gaps\n• Toyota interest unconfirmed', { x: 6.7, y: 1.5, w: 5.4, h: 1.6, fontSize: 12, color: colors.gray700 });

  // V1 Slide 3
  let s3 = pptx.addSlide(); addHeader(pptx, s3, "BelPak brings 25+ facilities, 1,000 employees, and proven OEM experience", slideNum++);
  [{ v: '25+', l: 'Facilities' }, { v: '1,000', l: 'Employees' }, { v: '99.6%', l: 'OTIF Rate' }, { v: '45', l: 'Day Standup' }].forEach((st, i) => {
    s3.addShape(pptx.shapes.RECTANGLE, { x: 0.5 + i * 3, y: 1.0, w: 2.8, h: 1.2, fill: { color: colors.gray50 } });
    s3.addText(st.v, { x: 0.5 + i * 3, y: 1.1, w: 2.8, h: 0.7, fontSize: 36, bold: true, color: colors.primary, align: 'center' });
    s3.addText(st.l, { x: 0.5 + i * 3, y: 1.7, w: 2.8, h: 0.4, fontSize: 12, color: colors.gray600, align: 'center' });
  });

  // V1 Slides 4-10
  let s4 = pptx.addSlide(); addHeader(pptx, s4, "BelPak's Subaru relationship demonstrates embedded operations capability", slideNum++);
  let s5 = pptx.addSlide(); addHeader(pptx, s5, "Toyota Battery NC presents multiple service opportunities for BelPak", slideNum++);
  let s6 = pptx.addSlide(); addHeader(pptx, s6, "Toyota supplier qualification requires ISO 9001 and IATF 16949", slideNum++);
  let s7 = pptx.addSlide(); addHeader(pptx, s7, "A phased approach validates opportunity before major investment", slideNum++);
  let s8 = pptx.addSlide(); addHeader(pptx, s8, "Total investment ranges from $200K-$400K over 18-24 months", slideNum++);
  let s9 = pptx.addSlide(); addHeader(pptx, s9, "Several critical risks must be addressed before proceeding", slideNum++);
  let s10 = pptx.addSlide(); addHeader(pptx, s10, "Phase 0 Discovery must answer critical questions", slideNum++);

  // V1 Slide 11: Thank You
  let s11 = pptx.addSlide();
  s11.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: colors.accent } });
  s11.addText('Thank You', { x: 1, y: 2.2, w: 11, h: 0.8, fontSize: 48, bold: true, color: colors.primary, align: 'center' });
  s11.addText('Ready to Begin Discovery?', { x: 1, y: 3.3, w: 11, h: 0.5, fontSize: 22, color: colors.gray600, align: 'center' });
  addLogoBar(s11); s11.addText(String(slideNum++), { x: 12.2, y: 5.0, w: 0.3, h: 0.3, fontSize: 10, color: colors.gray500 });

  // ========== DIVIDER SLIDE ==========
  let divider = pptx.addSlide();
  divider.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.primary } });
  divider.addText('V2 - REVISED PRESENTATION', { x: 1, y: 2.0, w: 11, h: 0.6, fontSize: 36, bold: true, color: colors.white, align: 'center' });
  divider.addText('Updated with feedback and refinements', { x: 1, y: 2.7, w: 11, h: 0.4, fontSize: 18, color: colors.accentGold, align: 'center' });
  divider.addText(String(slideNum++), { x: 12.2, y: 5.0, w: 0.3, h: 0.3, fontSize: 10, color: colors.gray500 });

  // ========== V2 SLIDES (13-24) ==========
  
  // V2 Slide 1: Title (White background)
  let v2s1 = pptx.addSlide();
  v2s1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: colors.accentGold } });
  v2s1.addText('BELPAK', { x: 4.5, y: 1.5, w: 4, h: 0.5, fontSize: 18, color: colors.white, align: 'center', fill: { color: colors.accentGold } });
  v2s1.addText('Toyota Battery Manufacturing NC', { x: 1, y: 2.2, w: 11, h: 0.8, fontSize: 44, bold: true, color: colors.primary, align: 'center' });
  v2s1.addText('Supplier Qualification Discovery', { x: 1, y: 3.3, w: 11, h: 0.5, fontSize: 24, color: colors.gray600, align: 'center' });
  addLogoBar(v2s1); v2s1.addText(String(slideNum++), { x: 12.2, y: 5.0, w: 0.3, h: 0.3, fontSize: 10, color: colors.gray500 });

  // V2 Slide 2: $400M Revenue
  let v2s2 = pptx.addSlide(); addHeader(pptx, v2s2, "BelPak brings $400M revenue, 1,000 employees, and 30+ years OEM experience", slideNum++, true);
  v2s2.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 1.0, w: 5.8, h: 2.2, fill: { color: colors.gray50 } });
  v2s2.addText('🎯 The Opportunity', { x: 0.7, y: 1.1, w: 5.4, h: 0.4, fontSize: 14, bold: true, color: colors.primary });
  v2s2.addText('• Contract packaging and logistics\n• Embedded operations with Subaru\n• EBE certification\n• 25+ facilities nationwide', { x: 0.7, y: 1.5, w: 5.4, h: 1.6, fontSize: 12, color: colors.gray700 });
  v2s2.addShape(pptx.shapes.RECTANGLE, { x: 6.5, y: 1.0, w: 5.8, h: 2.2, fill: { color: 'fff5eb' } });
  v2s2.addText('⚠️ Key Gaps', { x: 6.7, y: 1.1, w: 5.4, h: 0.4, fontSize: 14, bold: true, color: colors.warning });
  v2s2.addText('• No hazmat experience\n• ISO/IATF certifications needed\n• Battery expertise gaps\n• Toyota interest unconfirmed', { x: 6.7, y: 1.5, w: 5.4, h: 1.6, fontSize: 12, color: colors.gray700 });

  // V2 Slide 3: 8 Competitive Advantages
  let v2s3 = pptx.addSlide(); addHeader(pptx, v2s3, "BelPak's 8 competitive advantages position them as Toyota's ideal partner", slideNum++);
  [{ v: '25+', l: 'Facilities' }, { v: '1,000', l: 'Employees' }, { v: '99.6%', l: 'OTIF Rate' }, { v: '45', l: 'Day Standup' }].forEach((st, i) => {
    v2s3.addShape(pptx.shapes.RECTANGLE, { x: 0.5 + i * 3, y: 1.0, w: 2.8, h: 1.2, fill: { color: colors.gray50 } });
    v2s3.addText(st.v, { x: 0.5 + i * 3, y: 1.1, w: 2.8, h: 0.7, fontSize: 36, bold: true, color: colors.primary, align: 'center' });
    v2s3.addText(st.l, { x: 0.5 + i * 3, y: 1.7, w: 2.8, h: 0.4, fontSize: 12, color: colors.gray600, align: 'center' });
  });
  v2s3.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 2.4, w: 11.8, h: 1.5, fill: { color: colors.gray50 } });
  v2s3.addText('8 Competitive Advantages', { x: 0.7, y: 2.5, w: 11.4, h: 0.3, fontSize: 14, bold: true, color: colors.primary });
  v2s3.addText('1. $400M revenue | 2. 1,000+ employees | 3. 30+ years OEM | 4. Subaru relationship\n5. 25+ facilities | 6. EBE certification | 7. 99.6% OTIF | 8. 45-day standup', { x: 0.7, y: 2.9, w: 11.4, h: 0.9, fontSize: 11, color: colors.gray700 });

  // V2 Slides 4-11
  let v2s4 = pptx.addSlide(); addHeader(pptx, v2s4, "BelPak's Subaru relationship demonstrates embedded operations capability", slideNum++);
  let v2s5 = pptx.addSlide(); addHeader(pptx, v2s5, "Toyota Battery NC presents multiple service opportunities for BelPak", slideNum++);
  let v2s6 = pptx.addSlide(); addHeader(pptx, v2s6, "Toyota supplier qualification requires ISO 9001 and IATF 16949", slideNum++);
  let v2s7 = pptx.addSlide(); addHeader(pptx, v2s7, "A phased approach validates opportunity before major investment", slideNum++);
  let v2s8 = pptx.addSlide(); addHeader(pptx, v2s8, "Total investment ranges from $200K-$400K over 18-24 months", slideNum++);
  let v2s9 = pptx.addSlide(); addHeader(pptx, v2s9, "Several critical risks must be addressed before proceeding", slideNum++);
  let v2s10 = pptx.addSlide(); addHeader(pptx, v2s10, "Phase 0 Discovery must answer critical questions", slideNum++);
  let v2s11 = pptx.addSlide(); addHeader(pptx, v2s11, "Strategic Value+ team supports BelPak's Toyota qualification journey", slideNum++);

  // V2 Slide 12: Thank You
  let v2s12 = pptx.addSlide();
  v2s12.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: colors.accentGold } });
  v2s12.addText('Thank You', { x: 1, y: 2.2, w: 11, h: 0.8, fontSize: 48, bold: true, color: colors.primary, align: 'center' });
  v2s12.addText('Ready to Begin Discovery?', { x: 1, y: 3.3, w: 11, h: 0.5, fontSize: 22, color: colors.gray600, align: 'center' });
  addLogoBar(v2s12); v2s12.addText(String(slideNum), { x: 12.2, y: 5.0, w: 0.3, h: 0.3, fontSize: 10, color: colors.gray500 });

  // Save merged presentation
  const outPath = path.join(__dirname, '..', 'public', 'presentations', 'BelPak-TBMNC-Combined-Presentation.pptx');
  await pptx.writeFile({ fileName: outPath });
  console.log(`✅ Merged presentation created: ${outPath}`);
  console.log(`   Total slides: ${slideNum}`);
}

createMergedPresentation().catch(console.error);
