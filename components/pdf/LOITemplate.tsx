import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Polygon, Path } from '@react-pdf/renderer';

export interface LOITemplateData {
  employeeName: string;
  position: string;
  date: string;
  durationMonths: string;
  startDate: string;
  probationSalary: string;
  basicSalary: string;
  allowance: string;
  reportingManager: string;
  noticePeriod: string;
  customBodyText: string;
}

export interface LOITemplateProps {
  data: LOITemplateData;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1F2933',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },

  // 3-Column Header from InvoiceTemplate
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  brandBlock: {
    width: '35%',
    minHeight: 45,
  },
  logo: {
    width: 130,
    height: 38,
    marginBottom: 6,
    objectFit: 'contain',
  },
  tagline: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 2,
  },
  contactBlock: {
    width: '30%',
    alignItems: 'center',
    paddingTop: 2,
  },
  contactWrapper: {
    alignItems: 'flex-start',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  contactText: {
    fontSize: 8.5,
    color: '#1F2933',
    fontFamily: 'Helvetica',
  },
  ribbonSpacer: {
    width: '35%',
  },
  headerLine: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#3b82f6',
    marginBottom: 12,
    width: '100%',
  },

  // Document Title & Metadata
  titleContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 8.5,
    color: '#64748B',
    textAlign: 'center',
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  recipientBlock: {
    width: '60%',
  },
  recipientLabel: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  recipientName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  recipientRole: {
    fontSize: 8.5,
    color: '#2A5CAA',
    fontFamily: 'Helvetica-Bold',
  },
  dateBlock: {
    width: '35%',
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 8.5,
    color: '#334155',
    marginBottom: 2,
  },
  refText: {
    fontSize: 8,
    color: '#64748B',
    fontFamily: 'Helvetica-Bold',
  },

  // Subject line
  subjectContainer: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#2A5CAA',
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  subjectText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    textTransform: 'uppercase',
  },

  // Body Paragraphs
  bodyText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.4,
    textAlign: 'justify',
    marginBottom: 10,
  },

  // Key Terms Table
  tableContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  tableHeaderTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    minHeight: 18,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F8FAFC',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  colLabel: {
    width: '38%',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  colValue: {
    width: '62%',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    fontSize: 8,
    color: '#0F172A',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },

  // Terms Section
  termsSection: {
    marginBottom: 8,
  },
  clauseHeading: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 2,
    marginTop: 2,
  },
  clauseText: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.35,
    textAlign: 'justify',
    marginBottom: 4,
  },

  // Signature Block
  signatureContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  signatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureColumn: {
    width: '46%',
  },
  sigEntityHeader: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sigLineWrapper: {
    marginBottom: 6,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    height: 14,
    marginBottom: 2,
  },
  sigLabel: {
    fontSize: 7,
    color: '#64748B',
  },
  sigValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7.5,
    color: '#94A3B8',
  },
});

export default function LOITemplate({ data }: LOITemplateProps) {
  const safeData: LOITemplateData = {
    employeeName: data?.employeeName || 'Intern / Employee Name',
    position: data?.position || 'Intern Software Engineer',
    date: data?.date || new Date().toLocaleDateString('en-GB'),
    durationMonths: data?.durationMonths || '6 Months',
    startDate: data?.startDate || new Date().toLocaleDateString('en-GB'),
    probationSalary: data?.probationSalary || 'LKR 25,000 / Month',
    basicSalary: data?.basicSalary || 'LKR 35,000 / Month',
    allowance: data?.allowance || 'N/A',
    reportingManager: data?.reportingManager || 'Lead Software Engineer / Engineering Division',
    noticePeriod: data?.noticePeriod || '1 Month',
    customBodyText:
      data?.customBodyText ||
      'We are pleased to offer you the position. We believe that this mutual agreement will enable both parties to excel in our respective capabilities in the future. Please find below the details of your employment offer:',
  };

  const cleanDocTitle = `LOI_${safeData.employeeName.replace(/\s+/g, '_')}`;

  return (
    <Document title={cleanDocTitle}>
      <Page size="A4" style={styles.page} wrap={true}>
        
        {/* GEOMETRIC RIBBON */}
        <Svg height="150" width="200" viewBox="0 0 200 150" style={{ position: 'absolute', top: -36, right: -36 }} fixed>
          <Polygon points="120,0 200,0 200,150 150,150" fill="#2dd4bf" opacity={0.9} />
          <Polygon points="60,0 200,0 200,80" fill="#3b82f6" opacity={0.9} />
          <Polygon points="0,0 100,0 80,50" fill="#8b5cf6" opacity={0.9} />
        </Svg>

        {/* 3-COLUMN HEADER */}
        <View style={styles.headerContainer} fixed>
          <View style={styles.brandBlock}>
            <Image src="/Logo.png" style={styles.logo} />
            <Text style={styles.tagline}>Make your idea executable.</Text>
          </View>
          
          <View style={styles.contactBlock}>
            <View style={styles.contactWrapper}>
              <View style={styles.contactItem}>
                <View style={styles.iconCircle}>
                  <Svg width="9" height="9" viewBox="0 0 24 24">
                    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#FFFFFF" />
                  </Svg>
                </View>
                <Text style={styles.contactText}>www.exe.lk</Text>
              </View>
              <View style={styles.contactItem}>
                <View style={styles.iconCircle}>
                  <Svg width="9" height="9" viewBox="0 0 24 24">
                    <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#FFFFFF" />
                  </Svg>
                </View>
                <Text style={styles.contactText}>hello@exe.lk</Text>
              </View>
              <View style={styles.contactItem}>
                <View style={styles.iconCircle}>
                  <Svg width="9" height="9" viewBox="0 0 24 24">
                    <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#FFFFFF" />
                  </Svg>
                </View>
                <Text style={styles.contactText}>+94 70 274 9876 / +94 76 682 8306</Text>
              </View>
            </View>
          </View>

          <View style={styles.ribbonSpacer} />
        </View>

        <View style={styles.headerLine} fixed />

        {/* TITLE */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>LETTER OF INTENT</Text>
          <Text style={styles.subtitle}>Official Offer of Appointment &amp; Employment Undertaking</Text>
        </View>

        {/* RECIPIENT & DATE METADATA */}
        <View style={styles.metaRow}>
          <View style={styles.recipientBlock}>
            <Text style={styles.recipientLabel}>Candidate / Appointee:</Text>
            <Text style={styles.recipientName}>{safeData.employeeName}</Text>
            <Text style={styles.recipientRole}>{safeData.position}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateText}>Date: {safeData.date}</Text>
            <Text style={styles.refText}>CONFIDENTIAL</Text>
          </View>
        </View>

        {/* SUBJECT */}
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectText}>
            Subject: Offer of Appointment for the Position of {safeData.position}
          </Text>
        </View>

        {/* INTRODUCTORY BODY */}
        <Text style={styles.bodyText}>{safeData.customBodyText}</Text>

        {/* KEY EMPLOYMENT TERMS TABLE */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderTitle}>Summary of Employment Terms</Text>
          </View>
          
          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.colLabel}>Designation / Role</Text>
            <Text style={styles.colValue}>{safeData.position}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowOdd]}>
            <Text style={styles.colLabel}>Commencement / Start Date</Text>
            <Text style={styles.colValue}>{safeData.startDate}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.colLabel}>Duration of Term</Text>
            <Text style={styles.colValue}>{safeData.durationMonths}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowOdd]}>
            <Text style={styles.colLabel}>Probationary Allowance / Stipend</Text>
            <Text style={styles.colValue}>{safeData.probationSalary}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.colLabel}>Basic Salary (Post-Probation)</Text>
            <Text style={styles.colValue}>{safeData.basicSalary}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowOdd]}>
            <Text style={styles.colLabel}>Additional Allowances</Text>
            <Text style={styles.colValue}>{safeData.allowance}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={styles.colLabel}>Reporting Supervisor / Division</Text>
            <Text style={styles.colValue}>{safeData.reportingManager}</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowOdd, styles.tableRowLast]}>
            <Text style={styles.colLabel}>Notice Period (Termination)</Text>
            <Text style={styles.colValue}>{safeData.noticePeriod}</Text>
          </View>
        </View>

        {/* GENERAL PROVISIONS */}
        <View style={styles.termsSection}>
          <Text style={styles.clauseHeading}>1. Duties &amp; Code of Conduct</Text>
          <Text style={styles.clauseText}>
            You will be expected to perform the responsibilities assigned by your reporting manager faithfully and diligently, conforming to all company standards, agile sprint cadences, and codebase quality benchmarks.
          </Text>

          <Text style={styles.clauseHeading}>2. Confidentiality &amp; Intellectual Property</Text>
          <Text style={styles.clauseText}>
            This offer is contingent upon your signing and adhering to the EXE.lk Non-Disclosure Agreement (NDA). All inventions, software architecture, algorithms, and source code authored during your engagement remain the exclusive property of EXE.lk.
          </Text>

          <Text style={styles.clauseHeading}>3. Acceptance &amp; Formal Agreement</Text>
          <Text style={styles.clauseText}>
            Please indicate your formal acceptance of this Letter of Intent by signing and returning a duplicate copy within seven (7) days of receipt.
          </Text>
        </View>

        {/* SIGNATURE BLOCK */}
        <View style={styles.signatureContainer} wrap={false}>
          <View style={styles.signatureGrid}>
            
            {/* Company Signatory */}
            <View style={styles.signatureColumn}>
              <Text style={styles.sigEntityHeader}>FOR AND ON BEHALF OF EXE.LK:</Text>
              <View style={styles.sigLineWrapper}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>AUTHORIZED SIGNATURE</Text>
              </View>
              <View style={styles.sigLineWrapper}>
                <Text style={styles.sigValue}>DATE: {safeData.date}</Text>
              </View>
            </View>

            {/* Candidate Acceptance */}
            <View style={styles.signatureColumn}>
              <Text style={styles.sigEntityHeader}>CANDIDATE ACCEPTANCE:</Text>
              <View style={styles.sigLineWrapper}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>SIGNATURE: {safeData.employeeName}</Text>
              </View>
              <View style={styles.sigLineWrapper}>
                <Text style={styles.sigValue}>DATE: ___________________________</Text>
              </View>
            </View>

          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EXE CENTRAL • HR Document Vault • Letter of Intent (LOI)</Text>
          <Text style={styles.footerText}>Official &amp; Legally Binding Employment Offer</Text>
        </View>

      </Page>
    </Document>
  );
}
