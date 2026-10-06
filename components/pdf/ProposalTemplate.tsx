import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export type PricingCategoryType =
  | 'BASE_COST'
  | 'OPTIONAL_PRODUCT'
  | 'OPTIONAL_SERVICE'
  | 'AMC'
  | 'HOSTING'
  | 'THIRD_PARTY';

export interface ProposalTemplateSection {
  id?: string;
  title: string;
  content: any;
  order: number;
}

export interface ProposalTemplatePricingItem {
  id?: string;
  category: PricingCategoryType;
  title: string;
  description?: string | null;
  amount: number | string;
  billingFrequency?: string | null;
  isOptional?: boolean;
  order: number;
}

export interface ProposalTemplateTimelineItem {
  id?: string;
  phaseName: string;
  duration: string;
  order: number;
}

export interface ProposalTemplateProjectData {
  name?: string;
  clientName?: string;
  clientCompany?: string | null;
  projectNo?: string;
}

export interface ProposalTemplateData {
  id?: string;
  project?: ProposalTemplateProjectData | null;
  validUntil?: Date | string | null;
  sections?: ProposalTemplateSection[];
  pricingItems?: ProposalTemplatePricingItem[];
  timelineItems?: ProposalTemplateTimelineItem[];
}

const styles = StyleSheet.create({
  // Base Page
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },

  // Cover Page
  coverPage: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    position: 'relative',
  },
  coverHeaderBanner: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 45,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomWidth: 4,
    borderBottomColor: '#06B6D4',
  },
  coverBrandText: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#06B6D4',
    letterSpacing: 2,
    marginBottom: 4,
  },
  coverBrandSub: {
    fontSize: 10,
    color: '#93C5FD',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverBody: {
    paddingHorizontal: 45,
    paddingTop: 60,
    paddingBottom: 40,
    flex: 1,
    justifyContent: 'space-between',
  },
  coverBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06B6D4',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  coverBadgeText: {
    color: '#06B6D4',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    leading: 1.2,
    marginBottom: 16,
  },
  coverProjectName: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#93C5FD',
    marginBottom: 30,
  },
  coverDivider: {
    height: 2,
    backgroundColor: '#06B6D4',
    width: 60,
    marginBottom: 30,
  },
  coverMetaGrid: {
    flexDirection: 'row',
    justify: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 40,
  },
  coverMetaCol: {
    width: '48%',
  },
  coverMetaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#06B6D4',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  coverMetaSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooterText: {
    fontSize: 8,
    color: '#64748B',
  },

  // Document Headers (Inner pages)
  innerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A',
    paddingBottom: 10,
    marginBottom: 24,
  },
  innerHeaderBrand: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A8A',
    letterSpacing: 1,
  },
  innerHeaderSub: {
    fontSize: 8,
    color: '#06B6D4',
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  innerHeaderRight: {
    textAlign: 'right',
  },
  innerHeaderTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
  },
  innerHeaderProjectNo: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
  },

  // Section Styles
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 6,
  },
  sectionHeaderAccent: {
    width: 4,
    height: 14,
    backgroundColor: '#06B6D4',
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContentText: {
    fontSize: 9.5,
    color: '#334155',
    lineHeight: 1.5,
    marginBottom: 6,
  },

  // Tables General
  table: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  cellText: {
    fontSize: 9,
    color: '#334155',
  },
  cellTextBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  cellTextSub: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
  },

  // Pricing Columns
  colPricingTitle: { width: '45%' },
  colPricingFreq: { width: '25%' },
  colPricingAmount: { width: '30%', textAlign: 'right' },

  // Category Banner inside Cost Table
  categoryBanner: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBannerText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryBadgeOptional: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },

  // Total Summary Box
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  totalsBox: {
    width: '50%',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#1E3A8A',
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A8A',
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#06B6D4',
  },

  // Timeline Columns
  colPhase: { width: '65%' },
  colDuration: { width: '35%', textAlign: 'right' },

  // Footer & Pagination
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
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
  footerPageNum: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
  },
});

export default function ProposalTemplate({ proposal }: { proposal: ProposalTemplateData }) {
  const parseNum = (val: number | string | undefined | null): number => {
    if (val === undefined || val === null || val === '') return 0;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const formatDate = (d: Date | string | undefined | null) => {
    if (!d) return 'Flexible / Upon Receipt';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return isNaN(dateObj.getTime()) ? 'Flexible' : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatMoney = (val: number | string | undefined | null) => {
    const num = parseNum(val);
    return `LKR ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const project = proposal.project || {};
  const clientName = project.clientName || 'Valued Client';
  const clientCompany = project.clientCompany || null;
  const projectName = project.name || 'Web Solution Development';
  const projectNo = project.projectNo || 'PRJ-EXP';
  const validUntilStr = formatDate(proposal.validUntil);

  // Sort arrays by order
  const sortedSections = [...(proposal.sections || [])].sort((a, b) => a.order - b.order);
  const sortedPricing = [...(proposal.pricingItems || [])].sort((a, b) => a.order - b.order);
  const sortedTimeline = [...(proposal.timelineItems || [])].sort((a, b) => a.order - b.order);

  // Group pricing items by category
  const baseCostItems = sortedPricing.filter((i) => i.category === 'BASE_COST');
  const optionalItems = sortedPricing.filter((i) => i.category === 'OPTIONAL_PRODUCT' || i.category === 'OPTIONAL_SERVICE');
  const amcItems = sortedPricing.filter((i) => i.category === 'AMC');
  const hostingItems = sortedPricing.filter((i) => i.category === 'HOSTING');
  const thirdPartyItems = sortedPricing.filter((i) => i.category === 'THIRD_PARTY');

  const baseTotal = baseCostItems.reduce((sum, item) => sum + parseNum(item.amount), 0);

  const renderContentText = (content: any) => {
    if (typeof content === 'string') {
      return content.split('\n').map((paragraph, idx) => (
        <Text key={idx} style={styles.sectionContentText}>
          {paragraph.trim()}
        </Text>
      ));
    }
    if (content && typeof content === 'object') {
      if (Array.isArray(content)) {
        return content.map((item, idx) => (
          <Text key={idx} style={styles.sectionContentText}>
            • {typeof item === 'string' ? item : JSON.stringify(item)}
          </Text>
        ));
      }
      return <Text style={styles.sectionContentText}>{JSON.stringify(content, null, 2)}</Text>;
    }
    return null;
  };

  return (
    <Document title={`Proposal_${projectNo}`}>
      {/* 1. COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverHeaderBanner}>
          <Text style={styles.coverBrandText}>EXE CENTRAL</Text>
          <Text style={styles.coverBrandSub}>Industrial & Enterprise Digital Solutions</Text>
        </View>

        <View style={styles.coverBody}>
          <View>
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>COMMERCIAL PROPOSAL</Text>
            </View>
            <Text style={styles.coverTitle}>WEBSITE DESIGN AND DEVELOPMENT PROPOSAL</Text>
            <Text style={styles.coverProjectName}>{projectName}</Text>
            <View style={styles.coverDivider} />
          </View>

          <View style={styles.coverMetaGrid}>
            <View style={styles.coverMetaCol}>
              <Text style={styles.coverMetaLabel}>Prepared For</Text>
              <Text style={styles.coverMetaValue}>{clientName}</Text>
              {clientCompany && <Text style={styles.coverMetaSub}>{clientCompany}</Text>}
            </View>
            <View style={styles.coverMetaCol}>
              <Text style={styles.coverMetaLabel}>Proposal Details</Text>
              <Text style={styles.coverMetaValue}>Ref: #{projectNo}</Text>
              <Text style={styles.coverMetaSub}>Valid Until: {validUntilStr}</Text>
            </View>
          </View>

          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>Confidential — Prepared by EXE.lk</Text>
            <Text style={styles.coverFooterText}>www.exe.lk</Text>
          </View>
        </View>
      </Page>

      {/* 2. DYNAMIC SECTIONS & CONTENT PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.innerHeader} fixed>
          <View>
            <Text style={styles.innerHeaderBrand}>EXE CENTRAL</Text>
            <Text style={styles.innerHeaderSub}>COMMERCIAL PROPOSAL</Text>
          </View>
          <View style={styles.innerHeaderRight}>
            <Text style={styles.innerHeaderTitle}>{projectName}</Text>
            <Text style={styles.innerHeaderProjectNo}>Ref: #{projectNo}</Text>
          </View>
        </View>

        {sortedSections.map((sec) => (
          <View key={sec.id || sec.order} style={styles.sectionBlock} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderAccent} />
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            {renderContentText(sec.content)}
          </View>
        ))}

        {/* 3. COST ANALYSIS TABLE */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderAccent} />
            <Text style={styles.sectionTitle}>Cost Analysis & Commercial Terms</Text>
          </View>

          {/* Base Cost Table */}
          {baseCostItems.length > 0 && (
            <View style={styles.table} wrap={false}>
              <View style={styles.categoryBanner}>
                <Text style={styles.categoryBannerText}>Base Development & Implementation Investment</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colPricingTitle]}>Item / Description</Text>
                <Text style={[styles.tableHeaderCell, styles.colPricingFreq]}>Billing</Text>
                <Text style={[styles.tableHeaderCell, styles.colPricingAmount]}>Amount (LKR)</Text>
              </View>
              {baseCostItems.map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <View style={styles.colPricingTitle}>
                    <Text style={styles.cellTextBold}>{item.title}</Text>
                    {item.description && <Text style={styles.cellTextSub}>{item.description}</Text>}
                  </View>
                  <View style={styles.colPricingFreq}>
                    <Text style={styles.cellText}>{item.billingFrequency || 'One-time'}</Text>
                  </View>
                  <View style={styles.colPricingAmount}>
                    <Text style={styles.cellTextBold}>{formatMoney(item.amount)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Optional Add-Ons Table */}
          {optionalItems.length > 0 && (
            <View style={styles.table} wrap={false}>
              <View style={styles.categoryBanner}>
                <Text style={styles.categoryBannerText}>Optional Products & Additional Services</Text>
                <Text style={styles.categoryBadgeOptional}>OPTIONAL</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colPricingTitle]}>Item / Description</Text>
                <Text style={[styles.tableHeaderCell, styles.colPricingFreq]}>Billing</Text>
                <Text style={[styles.tableHeaderCell, styles.colPricingAmount]}>Amount (LKR)</Text>
              </View>
              {optionalItems.map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <View style={styles.colPricingTitle}>
                    <Text style={styles.cellTextBold}>{item.title}</Text>
                    {item.description && <Text style={styles.cellTextSub}>{item.description}</Text>}
                  </View>
                  <View style={styles.colPricingFreq}>
                    <Text style={styles.cellText}>{item.billingFrequency || 'Optional'}</Text>
                  </View>
                  <View style={styles.colPricingAmount}>
                    <Text style={styles.cellTextBold}>{formatMoney(item.amount)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* AMC, Hosting & Third Party Tables */}
          {[
            { label: 'Annual Maintenance Contracts (AMC)', items: amcItems },
            { label: 'Hosting & Infrastructure Solutions', items: hostingItems },
            { label: 'Third-Party Services & Licensing', items: thirdPartyItems },
          ].map(
            (group, gIdx) =>
              group.items.length > 0 && (
                <View key={gIdx} style={styles.table} wrap={false}>
                  <View style={styles.categoryBanner}>
                    <Text style={styles.categoryBannerText}>{group.label}</Text>
                  </View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colPricingTitle]}>Item / Description</Text>
                    <Text style={[styles.tableHeaderCell, styles.colPricingFreq]}>Billing</Text>
                    <Text style={[styles.tableHeaderCell, styles.colPricingAmount]}>Amount (LKR)</Text>
                  </View>
                  {group.items.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                    >
                      <View style={styles.colPricingTitle}>
                        <Text style={styles.cellTextBold}>{item.title}</Text>
                        {item.description && <Text style={styles.cellTextSub}>{item.description}</Text>}
                      </View>
                      <View style={styles.colPricingFreq}>
                        <Text style={styles.cellText}>{item.billingFrequency || 'Recurring'}</Text>
                      </View>
                      <View style={styles.colPricingAmount}>
                        <Text style={styles.cellTextBold}>{formatMoney(item.amount)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )
          )}

          {/* Totals Box */}
          <View style={styles.totalsContainer} wrap={false}>
            <View style={styles.totalsBox}>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total Core Base Cost:</Text>
                <Text style={styles.grandTotalValue}>{formatMoney(baseTotal)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. PROJECT TIMELINE TABLE */}
        {sortedTimeline.length > 0 && (
          <View style={styles.sectionBlock} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderAccent} />
              <Text style={styles.sectionTitle}>Project Schedule & Estimated Timeline</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colPhase]}>Phase / Deliverable Stage</Text>
                <Text style={[styles.tableHeaderCell, styles.colDuration]}>Estimated Duration</Text>
              </View>
              {sortedTimeline.map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <View style={styles.colPhase}>
                    <Text style={styles.cellTextBold}>{item.phaseName}</Text>
                  </View>
                  <View style={styles.colDuration}>
                    <Text style={styles.cellText}>{item.duration}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. FOOTER & PAGINATION */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Confidential — Prepared by EXE.lk for {clientName}
          </Text>
          <Text
            style={styles.footerPageNum}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
