import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Polygon, Path } from '@react-pdf/renderer';

export interface ReceiptTemplateItem {
  id?: string | number;
  description: string;
  quantity?: number;
  amount: number | string;
}

export interface ReceiptTemplateData {
  id?: string;
  receiptNo: string;
  generatedAt?: string | Date;
  issuedDate?: string | Date;
  projectId?: string;
  title?: string;
  logoUrl?: string;
  stampUrl?: string;
  project?: {
    id?: string;
    projectNo?: string;
    name?: string;
    clientName?: string;
    clientCompany?: string | null;
    country?: string | null;
    clientAddress?: string | null;
    address?: string | null;
    clientEmail?: string | null;
    email?: string | null;
    clientPhone?: string | null;
    clientContactNo?: string | null;
  } | null;
  payment?: {
    id?: string;
    amount?: number | string;
    method?: string;
    paymentDate?: string | Date;
    status?: string;
    invoice?: {
      invoiceNo?: string;
      proposalNo?: string | null;
      participant?: {
        name?: string;
        code?: string;
      } | null;
    } | null;
  } | null;
  items?: ReceiptTemplateItem[];
  clientName?: string;
  clientCompany?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientContactNo?: string;
  paymentStatusText?: string;
  paymentMethod?: string;
  receiptDescription?: string;
  discountAmount?: number | string;
  taxAmount?: number | string;
}

interface ReceiptTemplateProps {
  receipt: ReceiptTemplateData;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1F2933',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },

  // Perfectly Centered Stamp Watermark (Opacity 0.15)
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    opacity: 0.15,
  },
  watermarkImage: {
    width: 380,
    objectFit: 'contain',
  },

  // Header 3-Column Layout from InvoiceTemplate
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  brandBlock: {
    width: '35%',
    minHeight: 50,
  },
  logo: {
    width: 140,
    height: 42,
    marginBottom: 8,
    objectFit: 'contain',
  },
  tagline: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 4,
  },
  contactBlock: {
    width: '30%',
    alignItems: 'center',
    paddingTop: 4,
  },
  contactWrapper: {
    alignItems: 'flex-start',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  contactText: {
    fontSize: 9.5,
    color: '#1F2933',
    fontFamily: 'Helvetica',
  },
  ribbonSpacer: {
    width: '35%',
  },
  headerLine: {
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6',
    marginBottom: 16,
    width: '100%',
  },

  // Title
  documentTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Top 2-Column Meta Block (Company Address & Receipt Details)
  metaSplitSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  companyColumn: {
    width: '50%',
  },
  companyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 3,
  },
  companyAddressText: {
    fontSize: 8.5,
    color: '#4B5563',
    lineHeight: 1.35,
  },
  metaColumn: {
    width: '45%',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  metaLabel: {
    width: '38%',
    fontSize: 8.5,
    color: '#4B5563',
  },
  metaColon: {
    width: '5%',
    fontSize: 8.5,
    color: '#4B5563',
  },
  metaValue: {
    width: '57%',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
  },

  // Billed To Section
  billedToSection: {
    marginBottom: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  billedToTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 6,
  },
  billedToRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  billedToLabel: {
    width: '16%',
    fontSize: 8.5,
    color: '#4B5563',
  },
  billedToColon: {
    width: '4%',
    fontSize: 8.5,
    color: '#4B5563',
  },
  billedToValue: {
    width: '80%',
    fontSize: 8.5,
    color: '#1F2933',
    fontFamily: 'Helvetica',
  },
  billedToValueBold: {
    width: '80%',
    fontSize: 8.5,
    color: '#1F2933',
    fontFamily: 'Helvetica-Bold',
  },

  // Table Styling
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5CAA',
    minHeight: 22,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    minHeight: 22,
    alignItems: 'center',
  },
  tableRowLast: {
    flexDirection: 'row',
    minHeight: 22,
    alignItems: 'center',
  },
  colNo: {
    width: '10%',
    borderRightWidth: 1,
    borderColor: '#000000',
    textAlign: 'center',
  },
  colDesc: {
    width: '60%',
    borderRightWidth: 1,
    borderColor: '#000000',
  },
  colQty: {
    width: '10%',
    borderRightWidth: 1,
    borderColor: '#000000',
    textAlign: 'center',
  },
  colAmount: {
    width: '20%',
    textAlign: 'right',
  },
  cellText: {
    fontSize: 8.5,
    paddingVertical: 4,
    paddingHorizontal: 6,
    color: '#1F2933',
  },
  cellTextCenter: {
    fontSize: 8.5,
    paddingVertical: 4,
    paddingHorizontal: 6,
    color: '#1F2933',
    textAlign: 'center',
  },
  cellTextRight: {
    fontSize: 8.5,
    paddingVertical: 4,
    paddingHorizontal: 6,
    color: '#1F2933',
    textAlign: 'right',
  },

  // Totals Box
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsTable: {
    width: '42%',
    borderWidth: 1,
    borderColor: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    minHeight: 18,
    alignItems: 'center',
  },
  totalLabelCell: {
    width: '55%',
    borderRightWidth: 1,
    borderColor: '#000000',
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
  },
  totalValueCell: {
    width: '45%',
    paddingVertical: 3,
    paddingHorizontal: 6,
    textAlign: 'right',
    fontSize: 8.5,
    fontFamily: 'Helvetica',
  },
  grandTotalRow: {
    flexDirection: 'row',
    minHeight: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  grandTotalLabelCell: {
    width: '55%',
    borderRightWidth: 1,
    borderColor: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalValueCell: {
    width: '45%',
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: 'right',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },

  // NEW: Bottom Summary and Notes (Borderless, Stacked layout)
  bottomSection: {
    flexDirection: 'column',
    marginTop: 10,
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  paymentLabel: {
    width: '20%',
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  paymentColon: {
    width: '3%',
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  paymentValueBold: {
    width: '77%',
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  paymentValue: {
    width: '77%',
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  notesBlock: {
    marginTop: 20,
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: '3%',
    fontSize: 10,
    color: '#000000',
  },
  bulletText: {
    width: '97%',
    fontSize: 9.5,
    fontFamily: 'Helvetica-Oblique',
    color: '#000000',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  },
});

export default function ReceiptTemplate({ receipt }: ReceiptTemplateProps) {
  const parseNum = (val: number | string | undefined | null): number => {
    if (val === undefined || val === null || val === '') return 0;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const formatMoney = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatLongDate = (d: string | Date | undefined | null) => {
    if (!d) return 'N/A';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const items = receipt.items && receipt.items.length > 0 ? receipt.items : (
    receipt.payment ? [{
      description: receipt.receiptDescription || `Payment for Invoice ${receipt.payment.invoice?.invoiceNo || ''}`,
      quantity: 1,
      amount: parseNum(receipt.payment.amount),
    }] : []
  );

  const subtotal = items.reduce((sum, item) => sum + parseNum(item.amount), 0);
  const discount = parseNum(receipt.discountAmount);
  const tax = parseNum(receipt.taxAmount);
  const totalPaid = subtotal - discount + tax;

  const clientName = receipt.clientName || receipt.payment?.invoice?.participant?.name || receipt.project?.clientName || 'N/A';
  const clientCompany = receipt.clientCompany || receipt.project?.clientCompany || '';
  const clientAddress = receipt.clientAddress || receipt.project?.country || 'N/A';
  const clientEmail = receipt.clientEmail || 'N/A';
  const clientContactNo = receipt.clientContactNo || 'N/A';

  const documentTitle = receipt.title || 'ADVANCE PAYMENT RECEIPT';
  const projectNo = receipt.project?.projectNo || 'N/A';
  const dateIssued = formatLongDate(receipt.issuedDate || receipt.generatedAt);
  const paymentStatus = receipt.paymentStatusText || (receipt.payment?.status === 'VERIFIED' ? 'ADVANCE PAYMENT RECEIVED' : receipt.payment?.status || 'VERIFIED');
  const paymentDate = formatLongDate(receipt.payment?.paymentDate || receipt.issuedDate || receipt.generatedAt);
  const paymentMethod = receipt.paymentMethod || receipt.payment?.method || 'Cash Deposit';

  return (
    <Document title={`Receipt_${receipt.receiptNo}`}>
      <Page size="A4" style={styles.page}>
        
        {/* WATERMARK */}
        <View style={styles.watermarkContainer} fixed>
          <Image src={receipt.stampUrl || '/Stamp.png'} style={styles.watermarkImage} />
        </View>

        {/* GEOMETRIC RIBBON */}
        <Svg height="150" width="200" viewBox="0 0 200 150" style={{ position: 'absolute', top: -36, right: -36 }} fixed>
          <Polygon points="120,0 200,0 200,150 150,150" fill="#2dd4bf" opacity={0.9} />
          <Polygon points="60,0 200,0 200,80" fill="#3b82f6" opacity={0.9} />
          <Polygon points="0,0 100,0 80,50" fill="#8b5cf6" opacity={0.9} />
        </Svg>

        {/* 3-COLUMN HEADER BLOCK */}
        <View style={styles.headerContainer}>
          <View style={styles.brandBlock}>
            <Image src={receipt.logoUrl || '/Logo.png'} style={styles.logo} />
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

          <View style={styles.ribbonSpacer} />
        </View>

        <View style={styles.headerLine} />

        {/* DOCUMENT TITLE */}
        <Text style={styles.documentTitle}>{documentTitle}</Text>

        {/* TOP META BLOCK: COMPANY ADDRESS (LEFT) & RECEIPT META (RIGHT) */}
        <View style={styles.metaSplitSection}>
          <View style={styles.companyColumn}>
            <Text style={styles.companyName}>EXE.lk (Pvt) Ltd</Text>
            <Text style={styles.companyAddressText}>No 289/9A, 5th Lane, Kulasiri Kumarage St,</Text>
            <Text style={styles.companyAddressText}>Katuwana Road, Homagama 10200,</Text>
            <Text style={styles.companyAddressText}>Sri Lanka.</Text>
          </View>
          <View style={styles.metaColumn}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Receipt No</Text>
              <Text style={styles.metaColon}>:</Text>
              <Text style={styles.metaValue}>{receipt.receiptNo}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Project No</Text>
              <Text style={styles.metaColon}>:</Text>
              <Text style={styles.metaValue}>{projectNo}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date Issued</Text>
              <Text style={styles.metaColon}>:</Text>
              <Text style={styles.metaValue}>{dateIssued}</Text>
            </View>
          </View>
        </View>

        {/* BILLED TO SECTION */}
        <View style={styles.billedToSection}>
          <Text style={styles.billedToTitle}>Billed To</Text>
          <View style={styles.billedToRow}>
            <Text style={styles.billedToLabel}>Client Name</Text>
            <Text style={styles.billedToColon}>:</Text>
            <Text style={styles.billedToValueBold}>{clientName}{clientCompany ? ` (${clientCompany})` : ''}</Text>
          </View>
          <View style={styles.billedToRow}>
            <Text style={styles.billedToLabel}>Address</Text>
            <Text style={styles.billedToColon}>:</Text>
            <Text style={styles.billedToValue}>{clientAddress}</Text>
          </View>
          <View style={styles.billedToRow}>
            <Text style={styles.billedToLabel}>Email</Text>
            <Text style={styles.billedToColon}>:</Text>
            <Text style={styles.billedToValue}>{clientEmail}</Text>
          </View>
          <View style={styles.billedToRow}>
            <Text style={styles.billedToLabel}>Contact No</Text>
            <Text style={styles.billedToColon}>:</Text>
            <Text style={styles.billedToValue}>{clientContactNo}</Text>
          </View>
        </View>

        {/* PAYMENT ITEMS TABLE (Current payment only) */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colNo}><Text style={styles.tableHeaderCell}>No</Text></View>
            <View style={styles.colDesc}><Text style={styles.tableHeaderCell}>Description</Text></View>
            <View style={styles.colQty}><Text style={styles.tableHeaderCell}>Qty</Text></View>
            <View style={styles.colAmount}><Text style={styles.tableHeaderCell}>Amount (LKR)</Text></View>
          </View>

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            const itemNumber = String(idx + 1).padStart(2, '0');
            return (
              <View key={idx} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <View style={styles.colNo}><Text style={styles.cellTextCenter}>{itemNumber}</Text></View>
                <View style={styles.colDesc}><Text style={styles.cellText}>{item.description || 'Payment Item'}</Text></View>
                <View style={styles.colQty}><Text style={styles.cellTextCenter}>{item.quantity || 1}</Text></View>
                <View style={styles.colAmount}><Text style={styles.cellTextRight}>{formatMoney(parseNum(item.amount))}</Text></View>
              </View>
            );
          })}
        </View>

        {/* TOTALS BOX (Aligned right directly under table) */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <View style={styles.totalLabelCell}><Text>Subtotal</Text></View>
              <View style={styles.totalValueCell}><Text>{formatMoney(subtotal)}</Text></View>
            </View>
            <View style={styles.totalRow}>
              <View style={styles.totalLabelCell}><Text>Discount</Text></View>
              <View style={styles.totalValueCell}><Text>{formatMoney(discount)}</Text></View>
            </View>
            <View style={styles.totalRow}>
              <View style={styles.totalLabelCell}><Text>TAX (VAT)</Text></View>
              <View style={styles.totalValueCell}><Text>{formatMoney(tax)}</Text></View>
            </View>
            <View style={styles.grandTotalRow}>
              <View style={styles.grandTotalLabelCell}><Text>Total Paid</Text></View>
              <View style={styles.grandTotalValueCell}><Text>{formatMoney(totalPaid)}</Text></View>
            </View>
          </View>
        </View>

        {/* BOTTOM PAYMENT SUMMARY & NOTES (Borderless, Stacked layout matching mockup) */}
        <View style={styles.bottomSection}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status</Text>
            <Text style={styles.paymentColon}>:</Text>
            <Text style={styles.paymentValueBold}>{paymentStatus}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Date</Text>
            <Text style={styles.paymentColon}>:</Text>
            <Text style={styles.paymentValue}>{paymentDate}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentColon}>:</Text>
            <Text style={styles.paymentValue}>{paymentMethod}</Text>
          </View>

          {/* Hardcoded Notes */}
          <View style={styles.notesBlock}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>This receipt confirms payment for the above service</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>This is a computer-generated receipt and does not require a signature</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>For support, billing, or inquires, contact support@exe.lk.</Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EXE CENTRAL Internal Project Management System</Text>
          <Text style={styles.footerText}>Official Proof of Payment. Valid without signature.</Text>
        </View>

      </Page>
    </Document>
  );
}