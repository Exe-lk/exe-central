import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#1F2933', backgroundColor: '#FFFFFF' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1.5, borderBottomColor: '#2A5CAA', borderBottomStyle: 'solid', paddingBottom: 16, marginBottom: 20 },
  brandBlock: { flexDirection: 'column' },
  companyName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#2A5CAA', letterSpacing: 0.5 },
  companySubtitle: { fontSize: 9, color: '#616E7C', marginTop: 2 },
  invoiceTitleBlock: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1F2933', textTransform: 'uppercase' },
  invoiceNumber: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#2A5CAA', marginTop: 2 },
  statusBadge: { marginTop: 4, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 3, backgroundColor: '#F1F5F9', fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#475569' },
  gridTwoColumns: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  infoBox: { width: '48%', padding: 10, backgroundColor: '#F8FAFC', borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'solid' },
  boxTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#2A5CAA', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { width: '40%', fontSize: 9, color: '#616E7C' },
  infoValue: { width: '60%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1F2933' },
  table: { width: '100%', marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'solid', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#2A5CAA', paddingVertical: 8, paddingHorizontal: 10 },
  tableHeaderCell: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', borderBottomStyle: 'solid', backgroundColor: '#FFFFFF' },
  colDesc: { width: '70%' },
  colAmount: { width: '30%', textAlign: 'right' },
  cellText: { fontSize: 9, color: '#1F2933' },
  cellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1F2933' },
  totalsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 24 },
  totalsBox: { width: '45%', padding: 10, backgroundColor: '#F8FAFC', borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'solid' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#2A5CAA' },
  grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#2A5CAA' },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, borderTopWidth: 1, borderTopColor: '#E2E8F0', borderTopStyle: 'solid', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 8, color: '#94A3B8' },
});

export default function ReceiptTemplate({ receipt }: { receipt: any }) {
  const parseNum = (val: number | string | undefined | null): number => {
    if (val === undefined || val === null || val === '') return 0;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const formatDate = (d: string | Date | undefined | null) => {
    if (!d) return 'N/A';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleDateString();
  };

  const totalAmount = receipt.items?.reduce((sum: number, item: any) => sum + parseNum(item.amount), 0) || 0;
  
  // Extract details from nested relations
  const clientName = receipt.payment?.invoice?.participant?.name || receipt.project?.clientName || 'N/A';
  const clientCompany = receipt.project?.clientCompany;
  const projectNo = receipt.project?.projectNo || 'N/A';
  const proposalNo = receipt.payment?.invoice?.proposalNo;
  const paymentDate = receipt.payment?.paymentDate ? formatDate(receipt.payment.paymentDate) : 'N/A';
  const linkedInvoice = receipt.payment?.invoice?.invoiceNo || 'N/A';
  const paymentMethod = receipt.payment?.method || 'N/A';

  return (
    <Document title={`Receipt_${receipt.receiptNo}`}>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.headerContainer}>
          <View style={styles.brandBlock}>
            <Text style={styles.companyName}>EXE CENTRAL</Text>
            <Text style={styles.companySubtitle}>Outsourcing & Project Management Systems</Text>
          </View>
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>RECEIPT</Text>
            <Text style={styles.invoiceNumber}>#{receipt.receiptNo}</Text>
            <View style={styles.statusBadge}>
              <Text>STATUS: VERIFIED</Text>
            </View>
          </View>
        </View>

        <View style={styles.gridTwoColumns}>
          <View style={styles.infoBox}>
            <Text style={styles.boxTitle}>Received From</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Client Name:</Text>
              <Text style={styles.infoValue}>{clientName}</Text>
            </View>
            {clientCompany && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Company:</Text>
                <Text style={styles.infoValue}>{clientCompany}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <Text style={styles.infoValue}>{paymentMethod}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.boxTitle}>Receipt Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Receipt No:</Text>
              <Text style={styles.infoValue}>{receipt.receiptNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project No:</Text>
              <Text style={styles.infoValue}>{projectNo}</Text>
            </View>
            {proposalNo && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Proposal No:</Text>
                <Text style={styles.infoValue}>{proposalNo}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Date:</Text>
              <Text style={styles.infoValue}>{paymentDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Linked Invoice:</Text>
              <Text style={styles.infoValue}>{linkedInvoice}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Item Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount (LKR)</Text>
          </View>

          {receipt.items && receipt.items.map((item: any, idx: number) => (
            <View key={idx} style={[styles.tableRow, idx % 2 !== 0 ? { backgroundColor: '#F8FAFC' } : {}]}>
              <View style={styles.colDesc}>
                <Text style={styles.cellBold}>{item.description}</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.cellBold}>{parseNum(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Received:</Text>
              <Text style={styles.grandTotalValue}>
                LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>EXE CENTRAL Internal Project Management System</Text>
          <Text style={styles.footerText}>Official Proof of Payment. Valid without signature.</Text>
        </View>
      </Page>
    </Document>
  );
}