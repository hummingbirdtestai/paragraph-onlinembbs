// ConceptJSONRenderer.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';

/* ============================================================
   PUBLIC SCREEN WRAPPER (UNCHANGED)
   ============================================================ */

export default function ConceptJSONRenderer({
  data,
  cbmeMeta,
}: {
  data: string;
  cbmeMeta?: {
    chapter?: string | null;
    topic?: string | null;
    chapter_order?: number | null;
    topic_order?: number | null;
  };
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MentorFactSheetBubble message={data} cbmeMeta={cbmeMeta} />
      </ScrollView>
    </View>
  );
}

/* ============================================================
   BREADCRUMB CONTEXT HEADER (NEW)
   ============================================================ */

function ContextBreadcrumb({
  cbmeMeta,
}: {
  cbmeMeta?: {
    chapter?: string | null;
    topic?: string | null;
    chapter_order?: number | null;
    topic_order?: number | null;
  };
}) {
  if (!cbmeMeta?.chapter && !cbmeMeta?.topic) return null;

  return (
    <View style={styles.breadcrumbContainer}>
      {/* Subject Pill */}
      <View style={styles.breadcrumbPill}>
        <View style={[styles.breadcrumbSegment, styles.subjectSegment]}>
          <Text style={styles.breadcrumbLabel}>SUBJECT</Text>
          <Text style={styles.breadcrumbValue}>MBBS</Text>
        </View>

        {/* Chapter Segment */}
        {cbmeMeta.chapter && (
          <>
            <View style={styles.breadcrumbDivider} />
            <View style={[styles.breadcrumbSegment, styles.chapterSegment]}>
              <Text style={styles.breadcrumbLabel}>CHAPTER</Text>
              <Text style={styles.breadcrumbValue} numberOfLines={1}>
                {cbmeMeta.chapter_order ? `${cbmeMeta.chapter_order}. ` : ''}
                {cbmeMeta.chapter}
              </Text>
            </View>
          </>
        )}

        {/* Topic Segment */}
        {cbmeMeta.topic && (
          <>
            <View style={styles.breadcrumbDivider} />
            <View style={[styles.breadcrumbSegment, styles.topicSegment]}>
              <Text style={styles.breadcrumbLabel}>TOPIC</Text>
              <Text style={styles.breadcrumbValue} numberOfLines={1}>
                {cbmeMeta.topic_order ? `${cbmeMeta.topic_order}. ` : ''}
                {cbmeMeta.topic}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

/* ============================================================
   CORE RENDER BUBBLE (WITH BREADCRUMB)
   ============================================================ */

function MentorFactSheetBubble({
  message,
  cbmeMeta,
}: {
  message: string;
  cbmeMeta?: {
    chapter?: string | null;
    topic?: string | null;
    chapter_order?: number | null;
    topic_order?: number | null;
  };
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const sections = isJson(message)
    ? parseJsonIntoSections(JSON.parse(message))
    : parseContentIntoSections(message?.trim() ?? '');

  return (
    <>
      <ContextBreadcrumb cbmeMeta={cbmeMeta} />
      <Animated.View style={[styles.mentorBubble, { opacity: fadeAnim }]}>
        {sections.map((section, index) => (
          <SectionBlock
            key={index}
            section={section}
            isLast={index === sections.length - 1}
            screenWidth={screenWidth}
          />
        ))}
      </Animated.View>
    </>
  );
}

function isJson(input: string) {
  const t = input?.trim();
  return t?.startsWith('{') && t?.endsWith('}');
}

/* ============================================================
   SECTION TYPES & INTERFACES (UNCHANGED)
   ============================================================ */

type SectionType =
  | 'major_header'
  | 'clinical_case'
  | 'viva_question'
  | 'mnemonic'
  | 'high_yield_fact'
  | 'table'
  | 'bullet_list'
  | 'numbered_list'
  | 'paragraph';

interface Section {
  type: SectionType;
  content: string[];
  title?: string;
  rawLines?: string[];
}

/* ============================================================
   JSON SCHEMA (DETERMINISTIC INPUT)
   ============================================================ */

interface FactSheetJSON {
  concept?: string;
  cases?: Array<Record<string, Record<string, string>>>;
  high_yield_facts?: string[];
  tables?: Array<{ markdown: string }>;
  exam_pointers?: string[];
}

/* ============================================================
   JSON → SECTION ADAPTER (NEW, SAFE)
   ============================================================ */

function parseJsonIntoSections(json: FactSheetJSON): Section[] {
  const sections: Section[] = [];

  if (json.concept) {
    sections.push({
      type: 'major_header',
      title: 'Central Concepts',
      content: normalizeMarkdown(json.concept).split('\n'),
    });
  }

  json.cases?.forEach((caseObj) => {
    const title = Object.keys(caseObj)[0];
    const body = caseObj[title];

    const lines: string[] = [];
    Object.entries(body).forEach(([k, v]) => {
      lines.push(`- ${k}: ${v}`);
    });

    sections.push({
      type: 'clinical_case',
      title,
      content: lines,
    });
  });

  if (json.high_yield_facts?.length) {
    sections.push({
      type: 'high_yield_fact',
      title: 'High-Yield Facts',
      content: json.high_yield_facts.map(f => `- ${f}`),
    });
  }

  json.tables?.forEach((t) => {
    sections.push({
      type: 'table',
      rawLines: t.markdown.split('\n'),
      content: [],
    });
  });

  if (json.exam_pointers?.length) {
    sections.push({
      type: 'mnemonic',
      title: 'Exam Pointers',
      content: json.exam_pointers.map(p => `- ${p}`),
    });
  }

  return sections;
}

/* ============================================================
   ORIGINAL MARKDOWN PIPELINE — VERBATIM
   ============================================================ */

function normalizeMarkdown(content: string): string {
  return content
    .split('\n')
    .map(line => {
      const trimmed = line.trim();

      if (/^-{3,}$/.test(trimmed)) return '';

      if (trimmed.startsWith('###')) {
        let normalized = trimmed.replace(/^###\s*/, '');
        if (/^\d+\)\s+/.test(normalized)) return normalized;
        return `***${normalized}***`;
      }

      if (trimmed.startsWith('##')) return `***${trimmed.replace(/^##\s*/, '')}***`;
      if (trimmed.startsWith('#')) return `***${trimmed.replace(/^#\s*/, '')}***`;

      return line;
    })
    .join('\n')
    .replace(/\*\*_([^_*]+)_\*\*/g, '***$1***')
    .replace(/_\*\*([^_*]+)\*\*_/g, '***$1***');
}

function normalizeBulletIndentation(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let lastLineWasBulletHeading = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBullet = /^[•\-–—]\s+/.test(trimmed);

    if (isBullet && trimmed.split(' ').length <= 3 && !trimmed.endsWith('.')) {
      result.push(line);
      lastLineWasBulletHeading = true;
      continue;
    }

    if (isBullet && lastLineWasBulletHeading && !line.startsWith('  ')) {
      result.push('  ' + line);
      lastLineWasBulletHeading = false;
      continue;
    }

    lastLineWasBulletHeading = false;
    result.push(line);
  }

  return result.join('\n');
}

function parseContentIntoSections(content: string): Section[] {
  const normalizedContent = normalizeBulletIndentation(normalizeMarkdown(content));
  const lines = normalizedContent.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  const flush = () => {
    if (currentSection && (currentSection.content.length || currentSection.rawLines?.length)) {
      sections.push(currentSection);
      currentSection = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }

    if (trimmed.startsWith('***') && trimmed.includes('***', 3)) {
      flush();
      const title = trimmed.replace(/\*\*\*/g, '').trim();
      const lower = title.toLowerCase();

      let type: SectionType = 'major_header';
      if (lower.includes('clinical')) type = 'clinical_case';
      else if (lower.includes('viva')) type = 'viva_question';
      else if (lower.includes('high-yield')) type = 'high_yield_fact';
      else if (lower.includes('mnemonic')) type = 'mnemonic';

      currentSection = { type, title, content: [], rawLines: [] };
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (currentSection?.type !== 'table') {
        flush();
        currentSection = { type: 'table', content: [], rawLines: [] };
      }
      currentSection.rawLines!.push(line);
      continue;
    }

    if (!currentSection) {
      currentSection = { type: 'paragraph', content: [line] };
    } else {
      currentSection.content.push(line);
    }
  }

  flush();
  return sections;
}

/* ============================================================
   SECTION BLOCK (UNCHANGED)
   ============================================================ */

function SectionBlock({
  section,
  isLast,
  screenWidth,
}: {
  section: Section;
  isLast: boolean;
  screenWidth: number;
}) {
  const getBorderColor = () => {
    switch (section.type) {
      case 'major_header': return '#B8D4A8';
      case 'high_yield_fact': return '#FFD700';
      case 'clinical_case': return '#4A90E2';
      case 'mnemonic': return '#FF9800';
      case 'viva_question': return '#E91E63';
      default: return 'transparent';
    }
  };

  const bordered = ['major_header','clinical_case','viva_question','mnemonic','high_yield_fact'].includes(section.type);

  if (section.type === 'table') {
    return (
      <View style={[styles.sectionBlock, !isLast && styles.sectionBlockMargin]}>
        {renderTable(section.rawLines || [], screenWidth)}
      </View>
    );
  }

  return (
    <View style={[
      styles.sectionBlock,
      !isLast && styles.sectionBlockMargin,
      bordered && { borderLeftWidth: 3, borderLeftColor: getBorderColor(), paddingLeft: 12 }
    ]}>
      {section.title && (
        <Text style={[styles.sectionTitle, { color: getBorderColor() }]}>
          {stripMarkdown(section.title)}
        </Text>
      )}
      {section.content.map((l, i) => renderLine(l, i))}
    </View>
  );
}

/* ============================================================
   LINE RENDERER — FULL ORIGINAL LOGIC RESTORED
   ============================================================ */

function renderLine(line: string, key: number) {
  const trimmed = line.trim();
  if (!trimmed) return <View key={key} style={{ height: 8 }} />;

  const isBullet = /^[•\-–—]\s/.test(trimmed);
  const isNumbered = /^\d+\.\s/.test(trimmed);
  const isIndented = line.startsWith('  ');
  const isQuestion = /^Q\d+:/.test(trimmed);
  const isAnswer = /^A\d+:/.test(trimmed);

  let style: any = styles.contentText;

  if (isBullet && isIndented) style = [styles.bulletText, styles.indentedText];
  else if (isBullet || isNumbered) style = styles.bulletText;
  else if (isIndented) style = styles.indentedText;
  else if (isQuestion) style = styles.questionText;
  else if (isAnswer) style = styles.answerText;

  return (
    <Text key={key} style={style}>
      {parseInlineMarkup(stripMarkdown(trimmed))}{'\n'}
    </Text>
  );
}

/* ============================================================
   TABLE RENDERER — VERBATIM
   ============================================================ */

function renderTable(tableLines: string[], screenWidth: number) {
  const TABLET_BREAKPOINT = 768;
  const isLargeScreen = screenWidth >= TABLET_BREAKPOINT;

  if (!isLargeScreen) {
    return (
      <View style={styles.tablePlaceholder}>
        <Text style={styles.tablePlaceholderText}>📘 Table available on larger screens</Text>
        <Text style={styles.tablePlaceholderSubtext}>
          Rotate to landscape or view on tablet/desktop for formatted tables
        </Text>
      </View>
    );
  }

  const cleanLines = tableLines.filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.match(/^\|(\s*-+:?\s*\|)+$/);
  });

  if (cleanLines.length === 0) return null;

  const parseRow = (line: string): string[] =>
    line.split('|').slice(1, -1).map(cell => cell.trim());

  const headerRow = parseRow(cleanLines[0]);
  const dataRows = cleanLines.slice(1).map(parseRow);

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableRow}>
        {headerRow.map((header, idx) => (
          <View key={idx} style={[styles.tableCell, styles.tableHeaderCell]}>
            <Text style={styles.tableHeaderText}>{parseInlineMarkup(header)}</Text>
          </View>
        ))}
      </View>
      {dataRows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.tableRow}>
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={styles.tableCell}>
              <Text style={styles.tableCellText}>{parseInlineMarkup(cell)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/* ============================================================
   INLINE MARKUP — VERBATIM
   ============================================================ */

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*_([^_]+)_\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1');
}

function parseInlineMarkup(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*_[^_]+_\*|\*[^*]+\*|_[^_]+_)/g;
  const segments = text.split(regex);

  segments.forEach(segment => {
    if (segment.startsWith('***')) parts.push(<Text key={key++} style={styles.bold}>{segment.slice(3,-3)}</Text>);
    else if (segment.startsWith('**')) parts.push(<Text key={key++} style={styles.bold}>{segment.slice(2,-2)}</Text>);
    else if (segment.startsWith('*_')) parts.push(<Text key={key++} style={styles.bold}>{segment.slice(2,-2)}</Text>);
    else if (segment.startsWith('*')) parts.push(<Text key={key++} style={styles.bold}>{segment.slice(1,-1)}</Text>);
    else if (segment.startsWith('_')) parts.push(<Text key={key++}>{segment.slice(1,-1)}</Text>);
    else parts.push(<Text key={key++}>{segment}</Text>);
  });

  return <>{parts}</>;
}

/* ============================================================
   STYLES — WITH NEW BREADCRUMB STYLES
   ============================================================ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  
  // BREADCRUMB CONTEXT HEADER
  breadcrumbContainer: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    marginBottom: 12,
  },
  breadcrumbPill: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  breadcrumbSegment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  breadcrumbDivider: {
    width: 1,
    backgroundColor: '#2a2a2a',
    alignSelf: 'stretch',
  },
  subjectSegment: {
    backgroundColor: '#1a2530',
  },
  chapterSegment: {
    backgroundColor: '#1a2a1a',
  },
  topicSegment: {
    backgroundColor: '#2a1a2a',
  },
  breadcrumbLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  breadcrumbValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e1e1e1',
    textAlign: 'center',
  },

  mentorBubble: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  sectionBlock: { marginBottom: 0 },
  sectionBlockMargin: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
  contentText: { fontSize: 15, lineHeight: 24, color: '#e1e1e1' },
  bulletText: { fontSize: 15, lineHeight: 24, color: '#e1e1e1', marginTop: 4 },
  indentedText: { fontSize: 14, lineHeight: 22, color: '#d4d4d4', marginLeft: 16, marginTop: 2 },
  questionText: { fontSize: 15, lineHeight: 24, color: '#FF6B9D', fontWeight: '600', marginTop: 6 },
  answerText: { fontSize: 15, lineHeight: 24, color: '#4A9EFF', marginTop: 2 },
  bold: { fontWeight: '700', color: '#25D366' },
  tableContainer: { borderWidth: 1, borderColor: '#333', borderRadius: 8, overflow: 'hidden', marginVertical: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333' },
  tableCell: { flex: 1, padding: 10, justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#333' },
  tableHeaderCell: { backgroundColor: '#2a2a2a' },
  tableHeaderText: { fontSize: 14, fontWeight: '700', color: '#25D366', textAlign: 'center' },
  tableCellText: { fontSize: 13, lineHeight: 20, color: '#e1e1e1', textAlign: 'center' },
  tablePlaceholder: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD93D',
    borderStyle: 'dashed',
  },
  tablePlaceholderText: { fontSize: 16, color: '#FFD93D', fontWeight: '600', marginBottom: 6 },
  tablePlaceholderSubtext: { fontSize: 13, color: '#999', textAlign: 'center' },
});
