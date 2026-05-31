const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');

async function convertMarkdownToDocx() {
  try {
    // Read the markdown file
    const markdownContent = fs.readFileSync('./docs/USER-JOURNEYS.md', 'utf-8');
    
    // Parse markdown and create document structure
    const lines = markdownContent.split('\n');
    const children = [];
    
    let inCodeBlock = false;
    let codeBlockContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          children.push(new Paragraph({
            children: [new TextRun({
              text: codeBlockContent.join('\n'),
              font: 'Courier New',
              size: 20,
            })],
            spacing: { before: 200, after: 200 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            shading: { fill: 'F5F5F5' },
          }));
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }
      
      // Handle horizontal rules
      if (line.trim() === '---') {
        children.push(new Paragraph({
          children: [new TextRun({ text: '', })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 1 } },
          spacing: { before: 400, after: 400 },
        }));
        continue;
      }
      
      // Handle headings
      if (line.startsWith('### ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace('### ', ''),
            bold: true,
            size: 28,
          })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 200 },
        }));
        continue;
      }
      
      if (line.startsWith('## ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace('## ', ''),
            bold: true,
            size: 32,
          })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 600, after: 300 },
        }));
        continue;
      }
      
      if (line.startsWith('# ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace('# ', ''),
            bold: true,
            size: 44,
            color: '2E5797',
          })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 400 },
          alignment: AlignmentType.CENTER,
        }));
        continue;
      }
      
      // Handle tables (simplified)
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '');
        if (cells.length > 1 && !line.includes('---')) {
          // This is a table row
          const tableCells = cells.map(cell => 
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: cell.trim(), size: 22 })],
              })],
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { fill: 'FFFFFF' },
              verticalAlign: 'center',
            })
          );
          
          children.push(new TableRow({
            children: tableCells,
          }));
        }
        continue;
      }
      
      // Handle bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace(/^[-*] /, '• '),
            size: 24,
          })],
          bullet: { level: 0 },
          spacing: { before: 100, after: 100 },
        }));
        continue;
      }
      
      // Handle numbered lists
      if (line.match(/^\d+\./)) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line,
            size: 24,
          })],
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { before: 100, after: 100 },
        }));
        continue;
      }
      
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*/g);
        const textRuns = parts.map((part, index) => {
          if (index % 2 === 1) {
            return new TextRun({ text: part, bold: true, size: 24 });
          }
          return new TextRun({ text: part, size: 24 });
        });
        children.push(new Paragraph({
          children: textRuns,
          spacing: { before: 200, after: 200 },
        }));
        continue;
      }
      
      // Handle regular paragraphs
      if (line.trim() !== '') {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line,
            size: 24,
          })],
          spacing: { before: 200, after: 200 },
        }));
      }
    }
    
    // Create the document
    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });
    
    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);
    
    // Write the DOCX file
    fs.writeFileSync('./docs/USER-JOURNEYS.docx', buffer);
    
    console.log('Successfully converted USER-JOURNEYS.md to USER-JOURNEYS.docx');
  } catch (error) {
    console.error('Error converting markdown to docx:', error);
    process.exit(1);
  }
}

convertMarkdownToDocx();
