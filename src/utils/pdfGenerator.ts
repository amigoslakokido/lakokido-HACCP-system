import jsPDF from 'jspdf';

interface CompanyInfo {
  company_name: string;
  org_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  manager_name?: string;
}

export class PDFGenerator {
  private doc: jsPDF;
  private yPos: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private company: CompanyInfo | null;

  constructor(companyInfo?: CompanyInfo) {
    this.doc = new jsPDF();
    this.yPos = 20;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.company = companyInfo || null;
  }

  addHeader(title: string, subtitle?: string) {
    if (this.company) {
      this.doc.setFillColor(41, 98, 255);
      this.doc.rect(0, 0, this.pageWidth, 50, 'F');

      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(22);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(this.company.company_name, this.margin, 20);

      if (this.company.org_number) {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Org.nr: ${this.company.org_number}`, this.margin, 28);
      }

      if (this.company.phone || this.company.email) {
        const contactInfo = [this.company.phone, this.company.email].filter(Boolean).join(' • ');
        this.doc.text(contactInfo, this.margin, 34);
      }

      this.yPos = 60;
    }

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.yPos);
    this.yPos += 8;

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.margin, this.yPos);
      this.yPos += 8;
    }

    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.yPos, this.pageWidth - this.margin, this.yPos);
    this.yPos += 10;
    this.doc.setTextColor(0, 0, 0);
  }

  addSection(title: string) {
    this.checkPageBreak(20);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 98, 255);
    this.doc.text(title, this.margin, this.yPos);
    this.yPos += 8;
    this.doc.setTextColor(0, 0, 0);
  }

  addSubsection(title: string) {
    this.checkPageBreak(15);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.yPos);
    this.yPos += 6;
  }

  addText(text: string, fontSize: number = 10, indent: number = 0) {
    this.checkPageBreak(10);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');

    const maxWidth = this.pageWidth - (2 * this.margin) - indent;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak(6);
      this.doc.text(line, this.margin + indent, this.yPos);
      this.yPos += 6;
    });
  }

  addBulletPoint(text: string, color?: [number, number, number]) {
    this.checkPageBreak(10);
    this.doc.setFontSize(10);

    if (color) {
      this.doc.setTextColor(color[0], color[1], color[2]);
    }

    this.doc.text('•', this.margin + 5, this.yPos);

    const maxWidth = this.pageWidth - (2 * this.margin) - 15;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string, index: number) => {
      this.checkPageBreak(6);
      this.doc.text(line, this.margin + 15, this.yPos);
      if (index < lines.length - 1) this.yPos += 5;
    });

    this.yPos += 6;
    this.doc.setTextColor(0, 0, 0);
  }

  addKeyValue(key: string, value: string) {
    this.checkPageBreak(8);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${key}:`, this.margin, this.yPos);

    this.doc.setFont('helvetica', 'normal');
    const keyWidth = this.doc.getTextWidth(`${key}: `);

    const maxWidth = this.pageWidth - (2 * this.margin) - keyWidth;
    const lines = this.doc.splitTextToSize(value, maxWidth);

    lines.forEach((line: string, index: number) => {
      if (index === 0) {
        this.doc.text(line, this.margin + keyWidth, this.yPos);
      } else {
        this.checkPageBreak(6);
        this.yPos += 5;
        this.doc.text(line, this.margin + keyWidth, this.yPos);
      }
    });

    this.yPos += 6;
  }

  addInfoBox(title: string, content: string, color: 'blue' | 'green' | 'yellow' | 'red' = 'blue') {
    this.checkPageBreak(30);

    const colors = {
      blue: { bg: [230, 240, 255], text: [37, 99, 235] },
      green: { bg: [220, 252, 231], text: [22, 163, 74] },
      yellow: { bg: [254, 249, 195], text: [161, 98, 7] },
      red: { bg: [254, 226, 226], text: [220, 38, 38] }
    };

    const boxColor = colors[color];

    const boxHeight = 25;
    this.doc.setFillColor(boxColor.bg[0], boxColor.bg[1], boxColor.bg[2]);
    this.doc.roundedRect(this.margin, this.yPos - 5, this.pageWidth - (2 * this.margin), boxHeight, 3, 3, 'F');

    this.doc.setTextColor(boxColor.text[0], boxColor.text[1], boxColor.text[2]);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 5, this.yPos + 2);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    const maxWidth = this.pageWidth - (2 * this.margin) - 10;
    const lines = this.doc.splitTextToSize(content, maxWidth);
    this.doc.text(lines, this.margin + 5, this.yPos + 10);

    this.yPos += boxHeight + 5;
    this.doc.setTextColor(0, 0, 0);
  }

  addTable(headers: string[], rows: string[][]) {
    const colWidth = (this.pageWidth - (2 * this.margin)) / headers.length;

    this.checkPageBreak(30);

    this.doc.setFillColor(41, 98, 255);
    this.doc.rect(this.margin, this.yPos - 5, this.pageWidth - (2 * this.margin), 8, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');

    headers.forEach((header, i) => {
      this.doc.text(header, this.margin + (i * colWidth) + 2, this.yPos);
    });

    this.yPos += 8;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');

    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(10);

      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(this.margin, this.yPos - 5, this.pageWidth - (2 * this.margin), 8, 'F');
      }

      row.forEach((cell, i) => {
        this.doc.text(cell, this.margin + (i * colWidth) + 2, this.yPos);
      });

      this.yPos += 8;
    });

    this.yPos += 5;
  }

  addSpace(space: number = 5) {
    this.yPos += space;
  }

  checkPageBreak(requiredSpace: number = 20) {
    if (this.yPos + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.yPos = this.margin;
      this.addPageNumber();
    }
  }

  addPageNumber() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Side ${i} av ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
    this.doc.setTextColor(0, 0, 0);
  }

  addFooter(text?: string) {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);

      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);

      if (text) {
        this.doc.text(text, this.margin, this.pageHeight - 12);
      }

      const date = new Date().toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      this.doc.text(`Generert: ${date}`, this.pageWidth - this.margin, this.pageHeight - 12, { align: 'right' });
    }

    this.doc.setTextColor(0, 0, 0);
  }

  save(filename: string) {
    this.addPageNumber();
    this.addFooter();
    this.doc.save(filename);
  }

  getDoc(): jsPDF {
    return this.doc;
  }

  getCurrentY(): number {
    return this.yPos;
  }

  setY(y: number) {
    this.yPos = y;
  }
}
