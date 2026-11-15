import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Task, DayNote } from '../types';
import { saveAndShareFile } from './fileSaveService';

export interface PDFExportOptions {
  monthStr: string; // "2026-11"
  monthDisplay: string; // "Nov 2026"
  includeTasks: boolean;
  includeNotes: boolean;
  includeReminderTime: boolean;
  tasks: Task[];
  notes: DayNote[];
}

export async function generateAndDownloadMonthlyPDF(options: PDFExportOptions): Promise<void> {
  const {
    monthStr,
    monthDisplay,
    includeTasks,
    includeNotes,
    includeReminderTime,
    tasks,
    notes,
  } = options;

  // Filter tasks and notes for this month
  const monthTasks = tasks.filter((t) => t.date.startsWith(monthStr));
  const monthNotes = notes.filter((n) => n.date.startsWith(monthStr));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header banner (Deep Purple gradient/solid)
  doc.setFillColor(108, 71, 255); // #6C47FF
  doc.rect(0, 0, pageWidth, 42, 'F');

  // App Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Titan Plus Calendar', 18, 18);

  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Activity, Tasks & Reminders Report', 18, 26);
  doc.text(`Month: ${monthDisplay}`, 18, 33);

  // Generation timestamp on right
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(`Generated: ${dateStr}`, pageWidth - 18, 33, { align: 'right' });

  let cursorY = 52;

  // Stats Summary Cards
  const totalTasks = monthTasks.length;
  const completedTasks = monthTasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const totalNotes = monthNotes.length;

  const cardWidth = (pageWidth - 36 - 15) / 4;
  const cardHeight = 18;

  const cards = [
    { title: 'Total Tasks', value: totalTasks.toString(), color: [243, 244, 246] },
    { title: 'Completed', value: completedTasks.toString(), color: [220, 252, 231] },
    { title: 'Pending', value: pendingTasks.toString(), color: [254, 243, 199] },
    { title: 'Notes', value: totalNotes.toString(), color: [243, 232, 255] },
  ];

  cards.forEach((card, i) => {
    const x = 18 + i * (cardWidth + 5);
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(x, cursorY, cardWidth, cardHeight, 3, 3, 'F');

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(card.title, x + cardWidth / 2, cursorY + 6, { align: 'center' });

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + cardWidth / 2, cursorY + 13, { align: 'center' });
  });

  cursorY += cardHeight + 12;

  // 1. Tasks Section
  if (includeTasks) {
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Tasks & Reminders (${monthTasks.length})`, 18, cursorY);
    cursorY += 4;

    const tableHeaders = ['Date', 'Title', 'Description'];
    if (includeReminderTime) tableHeaders.push('Reminder');
    tableHeaders.push('Status');

    const tableRows = monthTasks
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => {
        const row = [t.date, t.title, t.description || '-'];
        if (includeReminderTime) {
          row.push(t.hasReminder && t.reminderTime ? t.reminderTime : 'None');
        }
        row.push(t.completed ? 'Done' : 'Pending');
        return row;
      });

    if (tableRows.length === 0) {
      cursorY += 4;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No tasks recorded for this month.', 18, cursorY);
      cursorY += 10;
    } else {
      autoTable(doc, {
        startY: cursorY,
        head: [tableHeaders],
        body: tableRows,
        margin: { left: 18, right: 18 },
        theme: 'striped',
        headStyles: {
          fillColor: [108, 71, 255],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8.5,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 253],
        },
      });

      // Update cursor after table
      const lastAutoTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
      cursorY = lastAutoTable ? lastAutoTable.finalY + 12 : cursorY + 40;
    }
  }

  // 2. Notes Section
  if (includeNotes && monthNotes.length > 0) {
    // If running low on page space, add page
    if (cursorY > 230) {
      doc.addPage();
      cursorY = 25;
    }

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Daily Notes (${monthNotes.length})`, 18, cursorY);
    cursorY += 6;

    monthNotes.forEach((n) => {
      if (cursorY > 260) {
        doc.addPage();
        cursorY = 25;
      }

      doc.setFillColor(248, 245, 255);
      doc.setDrawColor(237, 233, 254);
      doc.roundedRect(18, cursorY, pageWidth - 36, 16, 2, 2, 'FD');

      doc.setTextColor(108, 71, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(n.date, 22, cursorY + 6);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(n.content, pageWidth - 46);
      doc.text(lines, 22, cursorY + 11);

      cursorY += 20;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      'Titan Plus Calendar • 100% Offline Device Storage',
      18,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 18,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Save to device storage (Android Documents / Share / Web download)
  const cleanMonth = monthDisplay.replace(/\s+/g, '_');
  const fileName = `Titan_Plus_Calendar_${cleanMonth}.pdf`;
  const dataUriString = doc.output('datauristring');
  await saveAndShareFile(fileName, dataUriString, 'application/pdf');
}
