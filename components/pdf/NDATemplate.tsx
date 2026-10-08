import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Polygon, Path } from '@react-pdf/renderer';

export interface NDATemplateProps {
  employeeName: string;
  date: string;
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

  // Title & Intro
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  introText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.4,
    textAlign: 'justify',
    marginBottom: 10,
  },

  // Numbered Clause Sections
  section: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 3,
    marginTop: 3,
  },
  clauseRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  clauseNumber: {
    width: '5%',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  clauseBody: {
    width: '95%',
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.35,
    textAlign: 'justify',
  },
  plainClauseText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.35,
    textAlign: 'justify',
    marginBottom: 4,
  },

  // Signature Block
  signatureContainer: {
    marginTop: 15,
    paddingTop: 12,
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
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2933',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  sigLineWrapper: {
    marginBottom: 8,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    height: 16,
    marginBottom: 3,
  },
  sigLabel: {
    fontSize: 7.5,
    color: '#64748B',
  },
  sigValue: {
    fontSize: 8.5,
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

export default function NDATemplate({ employeeName, date }: NDATemplateProps) {
  return (
    <Document title={`NDA_${(employeeName || 'Intern').replace(/\s+/g, '_')}`}>
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
        <Text style={styles.title}>CONFIDENTIAL INFORMATION NON-DISCLOSURE AGREEMENT</Text>

        {/* INTRO */}
        <Text style={styles.introText}>
          As a condition of my becoming an intern or my continuing as an intern with EXE.lk, or with any of its current or future subsidiaries, affiliates, successors, or assigns (collectively, the &quot;Company&quot;), and in consideration of my internship and the compensation/stipend now and hereafter paid to me, I, the undersigned hereby agree to be bound by the terms and conditions in this Agreement.
        </Text>

        {/* 1. CONFIDENTIAL INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>1. Confidential Information</Text>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>1.1</Text>
            <Text style={styles.clauseBody}>&quot;Company Information&quot; means all technical data, trade secrets, software code, algorithms, software designs, customer data, infrastructure configurations, credentials, business strategies, pricing models, and proprietary processes of the Company.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>1.2</Text>
            <Text style={styles.clauseBody}>&quot;Third Party Information&quot; means confidential or proprietary information received by the Company from clients, vendors, or partners that is subject to a duty on the Company&apos;s part to maintain confidentiality.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>1.3</Text>
            <Text style={styles.clauseBody}>&quot;Confidential Information&quot; encompasses both Company Information and Third Party Information, in written, graphic, electronic, machine-readable, or oral form.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>1.4</Text>
            <Text style={styles.clauseBody}>Confidential Information does not include information that has become publicly known through lawful publication without breach of this Agreement by the Intern.</Text>
          </View>
        </View>

        {/* ACKNOWLEDGEMENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Acknowledgements</Text>
          
          {/* 1. Non-Disclosure */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>1. Non-Disclosure</Text>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>1.1</Text>
            <Text style={styles.clauseBody}>The Intern agrees to hold all Confidential Information in the strictest confidence and to take all reasonable precautions to prevent its unauthorized disclosure or publication.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>1.2</Text>
            <Text style={styles.clauseBody}>The Intern shall not use, reproduce, distribute, or disclose any Confidential Information except as strictly required in the direct performance of assigned internship duties for the Company.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>1.3</Text>
            <Text style={styles.clauseBody}>The Intern will not reverse engineer, decompile, or disassemble any software, firmware, or hardware prototypes provided by or created for the Company.</Text>
          </View>

          {/* 2. Non-Assistance */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>2. Non-Assistance</Text>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>2.1</Text>
            <Text style={styles.clauseBody}>The Intern will not assist any third party, competing enterprise, or outside individual in obtaining, misusing, or profiting from Confidential Information.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>2.2</Text>
            <Text style={styles.clauseBody}>The Intern shall immediately notify Company management upon discovering any unauthorized disclosure, data loss, or breach of confidentiality.</Text>
          </View>

          {/* 3. Returning Company Documents */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>3. Returning Company Documents</Text>
          <Text style={styles.plainClauseText}>
            Upon termination or conclusion of the internship, or at any time upon request by the Company, the Intern shall immediately surrender to the Company all documents, source code, data repositories, cloud access credentials, tokens, devices, and all copies thereof.
          </Text>

          {/* 4. Post - Employment Duty to Keep Company Informed */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>4. Post - Employment Duty to Keep Company Informed</Text>
          <Text style={styles.plainClauseText}>
            For a period of twelve (12) months following the conclusion of the internship, the Intern shall, upon reasonable written request, verify continued compliance with the terms of this Agreement and provide updated contact coordinates.
          </Text>

          {/* 5. Work Product */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>5. Work Product</Text>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>5.1</Text>
            <Text style={styles.clauseBody}>&quot;Work Product&quot; means all inventions, computer programs, software architectures, algorithms, documentation, and technical improvements conceived, developed, or authored by the Intern during the internship.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>5.2</Text>
            <Text style={styles.clauseBody}>All Work Product created during the internship shall constitute a work-made-for-hire and shall be the sole and exclusive intellectual property of the Company.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>5.3</Text>
            <Text style={styles.clauseBody}>To the extent any Work Product is not deemed a work-made-for-hire, the Intern hereby unconditionally assigns to the Company all worldwide right, title, and interest in such Work Product.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>5.4</Text>
            <Text style={styles.clauseBody}>The Intern agrees to execute all documentation and assignments necessary to assist the Company in patenting, copyrighting, and protecting all Work Product.</Text>
          </View>
          <View style={styles.clauseRow}>
            <Text style={styles.clauseNumber}>5.5</Text>
            <Text style={styles.clauseBody}>The Intern irrevocably waives all moral rights associated with the Work Product to the maximum extent permitted by applicable law.</Text>
          </View>

          {/* 1. No Conflicting obligations */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>1. No Conflicting obligations</Text>
          <Text style={styles.plainClauseText}>
            The Intern certifies and warrants that entering into this Agreement and performing all internship duties does not breach any confidentiality agreements, non-competition agreements, or obligations with any former employer, university, or third party.
          </Text>

          {/* 2. Non-Solicitation */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>2. Non-Solicitation</Text>
          <Text style={styles.plainClauseText}>
            During the internship and for a period of one (1) year following its conclusion, the Intern shall not directly or indirectly recruit, solicit, or encourage any employee, intern, or contractor of the Company to leave the Company.
          </Text>

          {/* 3. Miscellaneous */}
          <Text style={[styles.sectionHeading, { fontSize: 8.5, marginLeft: 4 }]}>3. Miscellaneous</Text>
          <Text style={styles.plainClauseText}>
            This Agreement shall be governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka. If any provision is deemed unenforceable, the remaining provisions shall remain in full force. The obligations of confidentiality shall survive the termination or completion of the internship indefinitely.
          </Text>
        </View>

        {/* SIGNATURE BLOCK */}
        <View style={styles.signatureContainer} wrap={false}>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureColumn}>
              <Text style={styles.sigEntityHeader}>COMPANY: EXE.lk</Text>
              <View style={styles.sigLineWrapper}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>SIGNATURE</Text>
              </View>
              <View style={styles.sigLineWrapper}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>DATE</Text>
              </View>
            </View>

            <View style={styles.signatureColumn}>
              <Text style={styles.sigEntityHeader}>INTERN NAME: {employeeName || '___________________________'}</Text>
              <View style={styles.sigLineWrapper}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>SIGNATURE</Text>
              </View>
              <View style={styles.sigLineWrapper}>
                <Text style={styles.sigValue}>DATE: {date || '___________________________'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EXE CENTRAL • HR Document Vault • Non-Disclosure Agreement</Text>
          <Text style={styles.footerText}>Official &amp; Legally Binding Undertaking</Text>
        </View>

      </Page>
    </Document>
  );
}
