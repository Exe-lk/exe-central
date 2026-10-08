import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Polygon, Path } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 9.5,
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
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  brandBlock: {
    width: '35%',
    minHeight: 45,
  },
  logo: {
    width: 135,
    height: 40,
    marginBottom: 6,
    objectFit: 'contain',
  },
  tagline: {
    fontSize: 9.5,
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
    fontSize: 9,
    color: '#1F2933',
    fontFamily: 'Helvetica',
  },
  ribbonSpacer: {
    width: '35%',
  },
  headerLine: {
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6',
    marginBottom: 20,
    width: '100%',
  },

  // Page 1 Title
  pageTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    textAlign: 'center',
    marginBottom: 26,
    textDecoration: 'underline',
    letterSpacing: 0.5,
  },

  // Fillable Form Fields Section
  formContainer: {
    marginBottom: 28,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  fieldLabel: {
    width: '34%',
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
  },
  fieldColon: {
    width: '3%',
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
  },
  underlineFill: {
    width: '63%',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    height: 18,
  },

  // Declaration
  declarationText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#1F2933',
    lineHeight: 1.4,
    marginBottom: 36,
  },

  // Signature Block
  signatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
    paddingHorizontal: 20,
  },
  sigCol: {
    width: '40%',
    alignItems: 'center',
  },
  sigTopBorder: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    width: '100%',
    paddingTop: 6,
    alignItems: 'center',
  },
  sigLabelText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
  },

  // Office Use Only Box
  officeBox: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 14,
    backgroundColor: '#FFFFFF',
    marginTop: 'auto',
    marginBottom: 10,
  },
  officeBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  officeBoxTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  officeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  officeLabel: {
    width: '40%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  officeColon: {
    width: '3%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  officeUnderline: {
    width: '57%',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    height: 16,
  },

  // Page 2 Attachment Boxes
  attachmentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 16,
  },
  attachmentBox: {
    height: '46%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attachmentSubtext: {
    fontSize: 8.5,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },

  // Bottom Logo on Page 2
  bottomLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomLogo: {
    width: 110,
    height: 32,
    objectFit: 'contain',
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7.5,
    color: '#94A3B8',
  },
});

export default function BankDetailsTemplate() {
  return (
    <Document title="Bank_Account_Details_Form">
      
      {/* PAGE 1: Bank Account Details Form */}
      <Page size="A4" style={styles.page}>
        
        {/* GEOMETRIC RIBBON */}
        <Svg height="150" width="200" viewBox="0 0 200 150" style={{ position: 'absolute', top: -36, right: -36 }} fixed>
          <Polygon points="120,0 200,0 200,150 150,150" fill="#2dd4bf" opacity={0.9} />
          <Polygon points="60,0 200,0 200,80" fill="#3b82f6" opacity={0.9} />
          <Polygon points="0,0 100,0 80,50" fill="#8b5cf6" opacity={0.9} />
        </Svg>

        {/* 3-COLUMN HEADER */}
        <View style={styles.headerContainer}>
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

        <View style={styles.headerLine} />

        {/* TITLE */}
        <Text style={styles.pageTitle}>BANK ACCOUNT DETAILS</Text>

        {/* FILLABLE FORM FIELDS */}
        <View style={styles.formContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>NAME (WITH INITIALS)</Text>
            <Text style={styles.fieldColon}>:</Text>
            <View style={styles.underlineFill} />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>N.I.C. NO.</Text>
            <Text style={styles.fieldColon}>:</Text>
            <View style={styles.underlineFill} />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>BANK ACCOUNT NO.</Text>
            <Text style={styles.fieldColon}>:</Text>
            <View style={styles.underlineFill} />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>NAME OF THE BANK</Text>
            <Text style={styles.fieldColon}>:</Text>
            <View style={styles.underlineFill} />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>BRANCH</Text>
            <Text style={styles.fieldColon}>:</Text>
            <View style={styles.underlineFill} />
          </View>
        </View>

        {/* DECLARATION */}
        <Text style={styles.declarationText}>
          I hereby certify that the information provided above is true and correct to the best of my knowledge.
        </Text>

        {/* SIGNATURE SECTION */}
        <View style={styles.signatureGrid}>
          <View style={styles.sigCol}>
            <View style={styles.sigTopBorder}>
              <Text style={styles.sigLabelText}>Signature</Text>
            </View>
          </View>
          <View style={styles.sigCol}>
            <View style={styles.sigTopBorder}>
              <Text style={styles.sigLabelText}>Date</Text>
            </View>
          </View>
        </View>

        {/* OFFICE USE ONLY BOX */}
        <View style={styles.officeBox}>
          <View style={styles.officeBoxHeader}>
            <Text style={styles.officeBoxTitle}>Office use Only</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Confidential Document</Text>
            </View>
          </View>

          <View style={styles.officeRow}>
            <Text style={styles.officeLabel}>INTERNSHIP ALLOWANCE (LKR)</Text>
            <Text style={styles.officeColon}>:</Text>
            <View style={styles.officeUnderline} />
          </View>

          <View style={styles.officeRow}>
            <Text style={styles.officeLabel}>DIVISION</Text>
            <Text style={styles.officeColon}>:</Text>
            <View style={styles.officeUnderline} />
          </View>

          <View style={styles.officeRow}>
            <Text style={styles.officeLabel}>INTERNSHIP PERIOD (MONTHS)</Text>
            <Text style={styles.officeColon}>:</Text>
            <View style={styles.officeUnderline} />
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EXE CENTRAL • HR Document Vault (Page 1 of 2)</Text>
          <Text style={styles.footerText}>Official Onboarding Form</Text>
        </View>

      </Page>

      {/* PAGE 2: Attachment Areas for Passbook & NIC */}
      <Page size="A4" style={styles.page}>
        
        {/* 3-COLUMN HEADER */}
        <View style={styles.headerContainer}>
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

        <View style={styles.headerLine} />

        {/* ATTACHMENT BOXES */}
        <View style={styles.attachmentContainer}>
          <View style={styles.attachmentBox}>
            <Text style={styles.attachmentText}>Copy of bank passbook (attach here)</Text>
            <Text style={styles.attachmentSubtext}>Please affix a clear photocopy of your bank passbook / statement header confirming account details.</Text>
          </View>

          <View style={styles.attachmentBox}>
            <Text style={styles.attachmentText}>Copy of NIC (attach here)</Text>
            <Text style={styles.attachmentSubtext}>Please affix a clear photocopy of both sides of your National Identity Card / Passport.</Text>
          </View>
        </View>

        {/* BOTTOM LOGO */}
        <View style={styles.bottomLogoContainer}>
          <Image src="/Logo.png" style={styles.bottomLogo} />
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EXE CENTRAL • HR Document Vault (Page 2 of 2)</Text>
          <Text style={styles.footerText}>Mandatory Attachments</Text>
        </View>

      </Page>
    </Document>
  );
}
