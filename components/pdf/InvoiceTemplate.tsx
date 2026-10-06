import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Polygon, Path } from '@react-pdf/renderer';

interface MilestoneData {
  id?: string;
  name?: string;
  order?: number;
  amount?: number | string;
}

interface ParticipantData {
  id?: string;
  code?: string;
  name?: string;
}

interface ProjectData {
  id?: string;
  projectNo?: string;
  name?: string;
  clientName?: string;
  clientCompany?: string | null;
  country?: string | null;
}

export interface InvoiceTemplateData {
  id: string;
  invoiceNo: string;
  costEstimationNo?: string | null;
  proposalNo?: string | null;
  clientName: string;
  clientCompany?: string | null;
  country?: string | null;
  currency: string;
  subtotal: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  paymentNote?: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
  bankSwiftCode?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  bankAddress?: string | null;
  bankCountry?: string | null;
  status: string;
  issuedDate?: string | Date | null;
  dueDate?: string | Date | null;
  project?: ProjectData | null;
  participant?: ParticipantData | null;
  milestone?: MilestoneData | null;
  additionalCosts?: { description: string; amount: number | string }[];
  billingHistory?: { description: string; amount: number; status: string; date: string | Date }[];
}

interface InvoiceTemplateProps {
  invoice: InvoiceTemplateData;
}

const SPECIAL_INSTRUCTIONS =
  'Important: Please do not forget to mention your Invoice number as the reference when you are depositing at the bank counter or the deposit machine since your payment is traced via the invoice number. Further, you are requested to email us a copy of the deposit slip or the screenshot of the online transfer / CEFT Transfer to finance@exe.lk on the payment date itself.\n(Please mention the Invoice Number In the Description).\nTo avoid extending the upcoming projects duration, please pay before the due date.';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#000000', backgroundColor: '#FFFFFF', position: 'relative', display: 'flex', flexDirection: 'column' },

  // Perfectly Centered Watermark (Opacity Increased to 0.20)
  watermarkContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: -1, opacity: 0.20 },
  watermarkImage: { width: 450 },

  // Header Layout with Absolute Centering for Contact Details
  headerContainer: { flexDirection: 'row', width: '100%', marginBottom: 15, position: 'relative', minHeight: 50 },
  brandBlock: { width: '35%', alignItems: 'flex-start' },
  logo: { width: 140, marginBottom: 8 },
  tagline: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1F2933', marginBottom: 4 },

  // Center Contact Block (Absolute Center of Header, Left-Aligned Text Inside)
  contactBlock: { position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center' },
  contactWrapper: { alignItems: 'flex-start', paddingTop: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  contactText: { fontSize: 9.5, color: '#1F2933', fontFamily: 'Helvetica' },

  // Blue Header Line
  headerLine: { borderBottomWidth: 3, borderBottomColor: '#3b82f6', marginBottom: 20, width: '100%' },

  // Title
  invoiceTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1F2933', textAlign: 'center', marginBottom: 25, letterSpacing: 1 },

  // Info Grid (Strict Alignment)
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoColumn: { width: '48%' },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { width: '35%', fontSize: 9, color: '#1F2933' },
  infoColon: { width: '5%', fontSize: 9, color: '#1F2933' },
  infoValue: { width: '60%', fontSize: 9, color: '#1F2933' },

  // Tables (Strict Black Borders)
  table: { width: '100%', borderWidth: 1, borderColor: '#000000', marginBottom: 25 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000000', minHeight: 22, alignItems: 'center' },
  tableRowLast: { flexDirection: 'row', minHeight: 22, alignItems: 'center' },

  // Shared Table Cells
  cellHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9, paddingVertical: 5, paddingHorizontal: 6 },
  cellText: { fontSize: 9, paddingVertical: 5, paddingHorizontal: 6 },
  cellBold: { fontFamily: 'Helvetica-Bold', fontSize: 9, paddingVertical: 5, paddingHorizontal: 6 },
  cellPaid: { fontFamily: 'Helvetica-Oblique', color: '#65a30d', fontSize: 9, paddingVertical: 5, paddingHorizontal: 6 },
  cellPending: { fontFamily: 'Helvetica-Oblique', color: '#1F2933', fontSize: 9, paddingVertical: 5, paddingHorizontal: 6 },

  // Column Widths
  colDesc: { width: '40%', borderRightWidth: 1, borderColor: '#000000' },
  colStatus: { width: '15%', borderRightWidth: 1, borderColor: '#000000' },
  colTaxes: { width: '10%', borderRightWidth: 1, borderColor: '#000000' },
  colDate: { width: '15%', borderRightWidth: 1, borderColor: '#000000' },
  colAmount: { width: '20%', textAlign: 'right' },

  // Bottom Split Layout
  bottomLayout: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },

  // Bank Details Box (Hardcoded Dimensions and Borders)
  bankBlock: { width: '48%', borderWidth: 1, borderColor: '#000000', padding: 12, backgroundColor: '#FFFFFF', minHeight: 120 },
  bankTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', textDecoration: 'underline', marginBottom: 10, textAlign: 'center' },
  bankRow: { flexDirection: 'row', marginBottom: 6 },
  bankLabel: { width: '35%', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  bankColon: { width: '5%', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  bankValue: { width: '60%', fontSize: 9, lineHeight: 1.3 },

  // Totals Section
  totalsBlock: { width: '48%' },
  totalsTable: { width: '100%', borderWidth: 1, borderColor: '#000000' },
  totalRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000000' },
  totalLabelCell: { width: '60%', borderRightWidth: 1, borderColor: '#000000', padding: 6, fontFamily: 'Helvetica' },
  totalValueCell: { width: '40%', padding: 6, textAlign: 'right', fontFamily: 'Helvetica' },
  grandTotalRow: { flexDirection: 'row' },
  grandTotalLabelCell: { width: '60%', borderRightWidth: 1, borderColor: '#000000', padding: 6, fontFamily: 'Helvetica-Bold' },
  grandTotalValueCell: { width: '40%', padding: 6, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  // Automated Wording (Moved inside totalsBlock)
  paymentWordingContainer: { alignItems: 'center', marginTop: 20 },
  paymentWordingTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#2A5CAA', textAlign: 'center', marginBottom: 6 },
  paymentWordingAmount: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#2A5CAA', textAlign: 'center' },

  // Boxed Instructions (Pushed to absolute bottom)
  instructionsBox: { marginTop: 'auto', padding: 12, borderWidth: 1, borderColor: '#000000', backgroundColor: '#FFFFFF', marginBottom: 24 },
  instructionsTitle: { fontSize: 10, fontFamily: 'Helvetica-BoldOblique', color: '#000000', marginBottom: 6 },
  highlightText: { fontSize: 9, color: '#000000', lineHeight: 1.4, backgroundColor: '#fef08a' },
  boldUnderlineText: { fontSize: 9, fontFamily: 'Helvetica-Bold', textDecoration: 'underline', color: '#000000', marginTop: 4 },

  footer: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 8, color: '#94A3B8' },
});

export default function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  const parseNum = (val: number | string | undefined | null): number => {
    if (val === undefined || val === null || val === '') return 0;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const formatMoney = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const subtotal = parseNum(invoice.subtotal);
  const discount = parseNum(invoice.discountAmount);
  const tax = parseNum(invoice.taxAmount);
  const total = parseNum(invoice.totalAmount);
  const currency = invoice.currency || 'LKR';

  const formatDate = (d: string | Date | undefined | null) => {
    if (!d) return ' ';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return isNaN(dateObj.getTime()) ? ' ' : dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const isIndustrial = !invoice.milestone;
  const history = invoice.billingHistory ?? [];
  const estimatedTotal = history.reduce((sum, row) => sum + parseNum(row.amount), 0);
  const baseMilestoneAmount = invoice.milestone?.amount ? parseNum(invoice.milestone.amount) : subtotal;

  return (
    <Document title={`Invoice_${invoice.invoiceNo}`}>
      <Page size="A4" style={styles.page}>

        {/* WATERMARK - Perfectly Centered */}
        <View style={styles.watermarkContainer} fixed>
          <Image src="/Logo.png" style={styles.watermarkImage} />
        </View>

        {/* GEOMETRIC RIBBON (Top Right) */}
        <Svg height="150" width="200" viewBox="0 0 200 150" style={{ position: 'absolute', top: 0, right: 0 }} fixed>
          <Polygon points="120,0 200,0 200,150 150,150" fill="#2dd4bf" opacity={0.9} />
          <Polygon points="60,0 200,0 200,80" fill="#3b82f6" opacity={0.9} />
          <Polygon points="0,0 100,0 80,50" fill="#8b5cf6" opacity={0.9} />
        </Svg>

        {/* 3-COLUMN HEADER BLOCK WITH ABSOLUTE CENTERING */}
        <View style={styles.headerContainer}>

          <View style={styles.brandBlock}>
            <Image src="/Logo.png" style={styles.logo} />
            <Text style={styles.tagline}>Make your idea executable.</Text>
          </View>

          <View style={styles.contactBlock}>
            <View style={styles.contactWrapper}>
              <View style={styles.contactItem}>
                <View style={styles.iconCircle}>
                  <Svg width="10" height="10" viewBox="0 0 24 24">
                    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#FFFFFF" />
                  </Svg>
                </View>
                <Text style={styles.contactText}>www.exe.lk</Text>
              </View>
              <View style={styles.contactItem}>
                <View style={styles.iconCircle}>
                  <Svg width="10" height="10" viewBox="0 0 24 24">
                    <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#FFFFFF" />
                  </Svg>
                </View>
                <Text style={styles.contactText}>hello@exe.lk</Text>
              </View>
              <View style={styles.contactItem}>
                <View style={styles.iconCircle}>
                  <Svg width="10" height="10" viewBox="0 0 24 24">
                    <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#FFFFFF" />
                  </Svg>
                </View>
                <Text style={styles.contactText}>+94 70 274 9876 / +94 76 682 8306</Text>
              </View>
            </View>
          </View>

        </View>
        <View style={styles.headerLine} />

        <Text style={styles.invoiceTitle}>PAYMENT INVOICE</Text>

        {/* INFO GRID */}
        <View style={styles.infoGrid}>
          {/* Left Column */}
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Client Name</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{invoice.clientName || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Project Name</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{invoice.project?.name || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Company Name</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{invoice.clientCompany || ''}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Country</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{invoice.country || ''}</Text></View>
            {invoice.proposalNo && <View style={styles.infoRow}><Text style={styles.infoLabel}>Proposal No</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{invoice.proposalNo}</Text></View>}
            {invoice.participant && (
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Participant</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>[{invoice.participant.code}] {invoice.participant.name}</Text></View>
            )}
          </View>
          {/* Right Column */}
          <View style={styles.infoColumn}>
            {invoice.costEstimationNo && <View style={styles.infoRow}><Text style={styles.infoLabel}>Cost Estimation</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{invoice.costEstimationNo}</Text></View>}
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Invoice No</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{invoice.invoiceNo}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Invoice Date</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{formatDate(invoice.issuedDate)}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Due Date</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Currency</Text><Text style={styles.infoColon}>:</Text><Text style={styles.infoValue}>{currency}</Text></View>
          </View>
        </View>

        {/* DYNAMIC TABLES */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.colDesc}><Text style={styles.cellHeader}>{isIndustrial ? 'Description' : 'Item Description'}</Text></View>
            {isIndustrial && <View style={styles.colStatus}><Text style={styles.cellHeader}>Status</Text></View>}
            {isIndustrial && <View style={styles.colTaxes}><Text style={styles.cellHeader}>Taxes</Text></View>}
            {isIndustrial && <View style={styles.colDate}><Text style={styles.cellHeader}>Date</Text></View>}
            {!isIndustrial && <View style={styles.colDate}><Text style={styles.cellHeader}>Order</Text></View>}
            <View style={styles.colAmount}><Text style={styles.cellHeader}>Amount ({currency})</Text></View>
          </View>

          {isIndustrial && history.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.colDesc}><Text style={styles.cellText}>{row.description || 'Invoice'}</Text></View>
              <View style={styles.colStatus}><Text style={row.status === 'PAID' || row.status === 'VERIFIED' ? styles.cellPaid : styles.cellPending}>{row.status === 'PAID' || row.status === 'VERIFIED' ? 'Paid' : 'Pending'}</Text></View>
              <View style={styles.colTaxes}><Text style={styles.cellText}></Text></View>
              <View style={styles.colDate}><Text style={styles.cellText}>{formatDate(row.date)}</Text></View>
              <View style={styles.colAmount}><Text style={styles.cellText}>{formatMoney(parseNum(row.amount))}</Text></View>
            </View>
          ))}

          {isIndustrial && (
            <View style={styles.tableRowLast}>
              <View style={styles.colDesc}><Text style={styles.cellBold}>Estimated Total cost</Text></View>
              <View style={styles.colStatus}><Text style={styles.cellBold}>____</Text></View>
              <View style={styles.colTaxes}><Text style={styles.cellText}></Text></View>
              <View style={styles.colDate}><Text style={styles.cellText}>{formatDate(invoice.dueDate || invoice.issuedDate)}</Text></View>
              <View style={styles.colAmount}><Text style={styles.cellBold}>{formatMoney(estimatedTotal)}</Text></View>
            </View>
          )}

          {!isIndustrial && (
            <View style={styles.tableRow}>
              <View style={styles.colDesc}><Text style={styles.cellText}>{invoice.milestone?.name ? `Milestone: ${invoice.milestone.name}` : 'Outsourcing Milestone Payment'}</Text></View>
              <View style={styles.colDate}><Text style={styles.cellText}>#{invoice.milestone?.order || 1}</Text></View>
              <View style={styles.colAmount}><Text style={styles.cellText}>{formatMoney(baseMilestoneAmount)}</Text></View>
            </View>
          )}

          {!isIndustrial && invoice.additionalCosts && invoice.additionalCosts.map((cost, idx) => {
            const isLast = idx === invoice.additionalCosts!.length - 1;
            return (
              <View key={idx} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <View style={styles.colDesc}><Text style={styles.cellText}>{cost.description || 'Additional Cost'}</Text></View>
                <View style={styles.colDate}><Text style={styles.cellText}>-</Text></View>
                <View style={styles.colAmount}><Text style={styles.cellText}>{formatMoney(parseNum(cost.amount))}</Text></View>
              </View>
            );
          })}
        </View>

        {/* BOTTOM SPLIT LAYOUT */}
        <View style={styles.bottomLayout}>

          {/* HARDCODED BANK DETAILS BOX */}
          <View style={styles.bankBlock}>
            <Text style={styles.bankTitle}>Bank Details</Text>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account No</Text>
              <Text style={styles.bankColon}>:</Text>
              <Text style={styles.bankValue}>1000661376</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Name</Text>
              <Text style={styles.bankColon}>:</Text>
              <Text style={styles.bankValue}>EXE.LK (PVT) LTD</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Swift Code</Text>
              <Text style={styles.bankColon}>:</Text>
              <Text style={styles.bankValue}>CCEYLKLX</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank</Text>
              <Text style={styles.bankColon}>:</Text>
              <Text style={styles.bankValue}>Commercial Bank</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Branch Name</Text>
              <Text style={styles.bankColon}>:</Text>
              <Text style={styles.bankValue}>Homagama</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Address</Text>
              <Text style={styles.bankColon}>:</Text>
              <Text style={styles.bankValue}>289/9A, 5th Lane, Kulasiri Kumarage Mawatha,{'\n'}Katuwana, Homagama.</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Country</Text>
              <Text style={styles.bankColon}>:</Text>
              <Text style={styles.bankValue}>Sri Lanka</Text>
            </View>
          </View>

          {/* Totals & Dynamic Wording */}
          <View style={styles.totalsBlock}>
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <View style={styles.totalLabelCell}><Text style={styles.cellText}>SUBTOTAL ({currency})</Text></View>
                <View style={styles.totalValueCell}><Text style={styles.cellText}>{formatMoney(subtotal)}</Text></View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabelCell}><Text style={styles.cellText}>DISCOUNT ({currency})</Text></View>
                <View style={styles.totalValueCell}><Text style={styles.cellText}>{formatMoney(discount)}</Text></View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabelCell}><Text style={styles.cellText}>TAX ({currency})</Text></View>
                <View style={styles.totalValueCell}><Text style={styles.cellText}>{formatMoney(tax)}</Text></View>
              </View>
              <View style={styles.grandTotalRow}>
                <View style={styles.grandTotalLabelCell}><Text style={styles.cellBold}>TOTAL ({currency})</Text></View>
                <View style={styles.grandTotalValueCell}><Text style={styles.cellBold}>{formatMoney(total)}</Text></View>
              </View>
            </View>

            <View style={styles.paymentWordingContainer}>
              <Text style={styles.paymentWordingTitle}>This invoice is payment for</Text>
              <Text style={styles.paymentWordingAmount}>{formatMoney(total)} {currency}</Text>
            </View>
          </View>
        </View>

        {/* BOXED INSTRUCTIONS (Auto-pushed to bottom) */}
        <View style={styles.instructionsBox} wrap={false}>
          <Text style={styles.instructionsTitle}>Comments or Special Instructions:</Text>
          <Text style={styles.highlightText}>
            Important: Please do not forget to mention your Invoice number as the reference when you are depositing at the bank counter or the deposit machine since your payment is traced via the invoice number. Further, you are requested to email us a copy of the deposit slip or the screenshot of the online transfer / CEFT Transfer to finance@exe.lk on the payment date itself.
          </Text>
          <Text style={styles.highlightText}>(Please mention the Invoice Number In the Description).</Text>
          <Text style={styles.boldUnderlineText}>To avoid extending the upcoming projects duration, please pay before the due date.</Text>
        </View>


      </Page>
    </Document>
  );
}