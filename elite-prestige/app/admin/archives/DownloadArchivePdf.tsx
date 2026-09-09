"use client";

type ArchivedInvoice = {
  createdAt: string;
  createdByName: string;
  vehicleName: string;
  clientName: string | null;
  duration: string;
  amount: number;
};

type ArchivedExpense = {
  createdAt: string;
  label: string;
  note: string | null;
  createdByName: string;
  amount: number;
};

type Archive = {
  id: string;
  createdAt: string;
  closedByName: string;
  totalRevenue: number;
  invoiceCount: number;
  totalPurchaseCost: number;
  totalCustomCost: number;
  totalExpenses: number;
  taxRatePercent: number;
  taxAmount: number;
  netResult: number;
  bankBalanceBefore: number;
  bankBalanceAfter: number;
  invoices: ArchivedInvoice[];
  expenses: ArchivedExpense[];
};

const DURATION_LABELS: Record<string, string> = {
  "24h": "24 heures",
  "3j": "3 jours",
  "7j": "1 semaine"
};

export default function DownloadArchivePdf({ archive }: { archive: Archive }) {
  async function handleDownload() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 48;
    let y = 56;

    const fmt = (n: number) => `${n.toLocaleString("fr-FR")}$`;
    const dateFmt = (d: string) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));

    function ensureSpace(lineHeight: number) {
      if (y + lineHeight > 780) {
        doc.addPage();
        y = 56;
      }
    }

    // En-tête
    doc.setTextColor(201, 162, 76);
    doc.setFontSize(10);
    doc.text("ELITE PRESTIGE", marginX, y);
    y += 20;
    doc.setTextColor(15, 25, 35);
    doc.setFontSize(18);
    doc.text("RAPPORT DE COMPTABILITE", marginX, y);
    y += 10;
    doc.setDrawColor(201, 162, 76);
    doc.setLineWidth(1.2);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Cloture le ${dateFmt(archive.createdAt)} par ${archive.closedByName}`, marginX, y);
    y += 34;

    // Section 1 — résumé
    doc.setFontSize(12);
    doc.setTextColor(15, 25, 35);
    doc.text("1. RESUME FINANCIER", marginX, y);
    y += 6;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.6);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 18;

    const summaryRows: [string, string][] = [
      ["Chiffre d'affaires (factures)", fmt(archive.totalRevenue)],
      ["Nombre de factures", String(archive.invoiceCount)],
      ["Cout d'achat de la flotte", fmt(archive.totalPurchaseCost)],
      ["Cout des customisations", fmt(archive.totalCustomCost)],
      ["Depenses diverses", fmt(archive.totalExpenses)],
      [`Impots (${archive.taxRatePercent}%)`, fmt(archive.taxAmount)],
      ["Resultat net", fmt(archive.netResult)],
      ["Solde bancaire avant cloture", fmt(archive.bankBalanceBefore)],
      ["Solde bancaire apres cloture", fmt(archive.bankBalanceAfter)]
    ];

    doc.setFontSize(10);
    for (const [label, value] of summaryRows) {
      ensureSpace(18);
      doc.setTextColor(80, 80, 80);
      doc.text(label, marginX, y);
      doc.setTextColor(15, 25, 35);
      doc.text(value, pageWidth - marginX, y, { align: "right" });
      y += 18;
    }
    y += 20;

    // Section 2 — factures
    ensureSpace(40);
    doc.setFontSize(12);
    doc.setTextColor(15, 25, 35);
    doc.text(`2. DETAIL DES FACTURES (${archive.invoices.length})`, marginX, y);
    y += 6;
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;

    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text("Date", marginX, y);
    doc.text("Cree par", marginX + 90, y);
    doc.text("Vehicule", marginX + 190, y);
    doc.text("Client", marginX + 300, y);
    doc.text("Duree", marginX + 400, y);
    doc.text("Montant", pageWidth - marginX, y, { align: "right" });
    y += 12;
    doc.setDrawColor(230, 230, 230);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 12;

    doc.setTextColor(30, 30, 30);
    if (archive.invoices.length === 0) {
      doc.text("Aucune facture sur cette periode.", marginX, y);
      y += 16;
    }
    for (const inv of archive.invoices) {
      ensureSpace(16);
      doc.text(dateFmt(inv.createdAt).slice(0, 10), marginX, y);
      doc.text(inv.createdByName.slice(0, 16), marginX + 90, y);
      doc.text(inv.vehicleName.slice(0, 20), marginX + 190, y);
      doc.text((inv.clientName || "-").slice(0, 18), marginX + 300, y);
      doc.text(DURATION_LABELS[inv.duration] || inv.duration, marginX + 400, y);
      doc.text(fmt(inv.amount), pageWidth - marginX, y, { align: "right" });
      y += 15;
    }
    y += 20;

    // Section 3 — dépenses
    ensureSpace(40);
    doc.setFontSize(12);
    doc.setTextColor(15, 25, 35);
    doc.text(`3. DETAIL DES DEPENSES (${archive.expenses.length})`, marginX, y);
    y += 6;
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;

    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text("Date", marginX, y);
    doc.text("Intitule", marginX + 90, y);
    doc.text("Note", marginX + 240, y);
    doc.text("Ajoute par", marginX + 380, y);
    doc.text("Montant", pageWidth - marginX, y, { align: "right" });
    y += 12;
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 12;

    doc.setTextColor(30, 30, 30);
    if (archive.expenses.length === 0) {
      doc.text("Aucune depense sur cette periode.", marginX, y);
      y += 16;
    }
    for (const e of archive.expenses) {
      ensureSpace(16);
      doc.text(dateFmt(e.createdAt).slice(0, 10), marginX, y);
      doc.text(e.label.slice(0, 24), marginX + 90, y);
      doc.text((e.note || "-").slice(0, 22), marginX + 240, y);
      doc.text(e.createdByName.slice(0, 16), marginX + 380, y);
      doc.text(fmt(e.amount), pageWidth - marginX, y, { align: "right" });
      y += 15;
    }

    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      "Document genere automatiquement par ELITE PRESTIGE a des fins de transmission comptable interne.",
      marginX,
      810
    );

    doc.save(`comptabilite-elite-prestige-${archive.id.slice(0, 8)}.pdf`);
  }

  return (
    <button onClick={handleDownload} className="text-gray1 hover:text-gold transition text-xs">
      Télécharger PDF
    </button>
  );
}
