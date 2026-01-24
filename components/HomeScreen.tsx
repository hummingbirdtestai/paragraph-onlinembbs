/* =========================================================
   HomeScreen.tsx — EXAM SURVIVAL LANDING PAGE
   PART 1 / 3
   ========================================================= */

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  useWindowDimensions,
  Pressable,
  StyleSheet,   // ✅ ADD THIS
} from 'react-native';
import Footer from './Footer';
import { useAuth } from "@/contexts/AuthContext";

/* ─────────────────────────────────────────────
   PROPS
───────────────────────────────────────────── */

interface HomeScreenProps {
  images: {
    img1: string;
    img2: string;
    img3: string;
    img4: string;
    img5: string;
    img6: string;
    img7: string;
    img8: string;
    img9: string;
    img10: string;
  };
  onOpenAuth?: (mode: "login" | "signup") => void;
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */

export default function HomeScreen(
  { images, onOpenAuth }: HomeScreenProps
) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isMobile = !isWeb || width < 768;

  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <ScrollView style={styles.container}>
      {isMobile ? (
        <MobileLayout
          images={images}
          onOpenAuth={onOpenAuth}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <WebLayout
          images={images}
          onOpenAuth={onOpenAuth}
          isLoggedIn={isLoggedIn}
        />
      )}
      <Footer />
    </ScrollView>
  );
}

/* ─────────────────────────────────────────────
   MOBILE LAYOUT (10 SECTIONS ONLY)
───────────────────────────────────────────── */

function MobileLayout({ images, onOpenAuth, isLoggedIn }: any) {
  return (
    <ScrollView contentContainerStyle={styles.mobileContent}>

      <Section1Mobile image={images.img1} />
      <Section2Mobile image={images.img2} />
      <Section3Mobile image={images.img3} />
      <Section4Mobile image={images.img4} />

      {/* Sections 5–10 in PART 2 */}

      {!isLoggedIn && (
        <Section10Mobile onOpenAuth={onOpenAuth} />
      )}

    </ScrollView>
  );
}

/* ─────────────────────────────────────────────
   WEB LAYOUT (10 SECTIONS ONLY)
───────────────────────────────────────────── */

function WebLayout({ images, onOpenAuth, isLoggedIn }: any) {
  return (
    <ScrollView contentContainerStyle={styles.webContent}>

      <Section1Web image={images.img1} />
      <Section2Web image={images.img2} />
      <Section3Web image={images.img3} />
      <Section4Web image={images.img4} />

      {/* Sections 5–10 in PART 2 */}

      {!isLoggedIn && (
        <Section10Web onOpenAuth={onOpenAuth} />
      )}

    </ScrollView>
  );
}

/* =========================================================
   SECTION 1 — CORE PROBLEM
   ========================================================= */

const Section1Mobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImageSection1} />
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        MBBS Exams Are Not About Reading Everything.
      </Text>

      <Text style={styles.mobileBody}>
        You didn’t fail because you’re weak.
      </Text>

      <Text style={styles.mobileBody}>
        You fail because the system is brutal.
      </Text>

      <Text style={[styles.mobileBody, styles.emphasis]}>
        This page is about survival.
      </Text>

    </View>
  </View>
));

const Section1Web = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webHero}>
      <View style={styles.webHeroText}>
        <Text style={styles.webHeading}>
          MBBS Exams Are Not About Reading Everything.
        </Text>
        <Text style={styles.webSubheading}>
          They are about surviving the system.
        </Text>
      </View>
      <Image source={{ uri: image }} style={styles.webHeroImage} />
    </View>
  </View>
));

/* =========================================================
   SECTION 2 — REALITY CHECK
   ========================================================= */

const Section2Mobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        The Reality Every MBBS Student Faces
      </Text>

      <Text style={styles.mobileBullet}>
        • <Text style={styles.highlight}>Very short preparation time</Text>
      </Text>

      <Text style={styles.mobileBullet}>
        • <Text style={styles.highlight}>Massive syllabus</Text> with no boundaries
      </Text>

      <Text style={styles.mobileBullet}>
        • <Text style={styles.highlight}>No guidance</Text> on what to skip
      </Text>

    </View>
  </View>
));

const Section2Web = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webReverse}>
      <Image source={{ uri: image }} style={styles.webSideImage} />
      <View style={styles.webTextBlock}>
        <Text style={styles.webHeading}>
          The Reality Every MBBS Student Faces
        </Text>
        <Text style={styles.webBullet}>• Very little time</Text>
        <Text style={styles.webBullet}>• Too much syllabus</Text>
        <Text style={styles.webBullet}>• No clarity what to study</Text>
      </View>
    </View>
  </View>
));

/* =========================================================
   SECTION 3 — THE SECRET
   ========================================================= */

const Section3Mobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        The Secret Nobody Tells You
      </Text>

      <Text style={styles.mobileBody}>
        University exams are predictable.
      </Text>

      <Text style={styles.mobileBody}>
        The same questions repeat.
      </Text>

      <Text style={[styles.mobileBody, styles.emphasis]}>
        We analysed the past 15 years.
      </Text>

    </View>
  </View>
));

const Section3Web = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webHero}>
      <View style={styles.webTextBlock}>
        <Text style={styles.webHeading}>
          The Secret Nobody Tells You
        </Text>
        <Text style={styles.webBody}>
          MBBS university exams repeat patterns.
        </Text>
        <Text style={[styles.webBody, styles.emphasis]}>
          The last 15 years prove it.
        </Text>
      </View>
      <Image source={{ uri: image }} style={styles.webSideImage} />
    </View>
  </View>
));

/* =========================================================
   SECTION 4 — 200 QUESTIONS RULE
   ========================================================= */

const Section4Mobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        200 Questions Decide Everything
      </Text>

      <Text style={styles.mobileBody}>
        Each subject boils down to ~200 questions.
      </Text>

      <Text style={styles.mobileBody}>
        These decide pass, distinction, and medals.
      </Text>

    </View>
  </View>
));

const Section4Web = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webReverse}>
      <Image source={{ uri: image }} style={styles.webSideImage} />
      <View style={styles.webTextBlock}>
        <Text style={styles.webHeading}>
          200 Questions Decide Everything
        </Text>
        <Text style={styles.webBody}>
          Not thousands of pages — just the right questions.
        </Text>
      </View>
    </View>
  </View>
));

/* =========================================================
   SECTIONS 5–10 CONTINUE IN PART 2
   ========================================================= */
/* =========================================================
   HomeScreen.tsx — EXAM SURVIVAL LANDING PAGE
   PART 2 / 3
   ========================================================= */

/* =========================================================
   SECTION 5 — WHAT EACH QUESTION GIVES YOU
   ========================================================= */

const Section5Mobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        What You Study Per Question
      </Text>

      <Text style={styles.mobileStep}>
        ✔ Central concept — crystal clear
      </Text>
      <Text style={styles.mobileStep}>
        ✔ 25 high-yield exam facts
      </Text>
      <Text style={styles.mobileStep}>
        ✔ 5 clinical case vignettes
      </Text>
      <Text style={styles.mobileStep}>
        ✔ Synoptic revision tables
      </Text>

      <Text style={[styles.mobileBody, styles.emphasis]}>
        Nothing extra. Nothing missing.
      </Text>

    </View>
  </View>
));

const Section5Web = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webHero}>
      <View style={styles.webTextBlock}>

        <Text style={styles.webHeading}>
          What You Study Per Question
        </Text>

        <Text style={styles.webBullet}>• Central concept clarity</Text>
        <Text style={styles.webBullet}>• 25 high-yield exam facts</Text>
        <Text style={styles.webBullet}>• 5 clinical case applications</Text>
        <Text style={styles.webBullet}>• Rapid revision tables</Text>

        <Text style={[styles.webBody, styles.emphasis]}>
          Exactly what examiners expect.
        </Text>

      </View>

      <Image source={{ uri: image }} style={styles.webSideImage} />
    </View>
  </View>
));

/* =========================================================
   SECTION 6 — AI TUTOR FLOW
   ========================================================= */

const Section6Mobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImageSection6} />
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        How the AI Tutor Teaches You
      </Text>

      <Text style={styles.mobileBody}>
        Each question is broken into 10 concepts.
      </Text>

      <Text style={styles.mobileBody}>
        The tutor:
      </Text>

      <Text style={styles.mobileBullet}>
        • Tests each concept
      </Text>
      <Text style={styles.mobileBullet}>
        • Finds your weak links
      </Text>
      <Text style={styles.mobileBullet}>
        • Repeats until clarity is complete
      </Text>

      <Text style={[styles.mobileBody, styles.emphasis]}>
        Gaps are fixed immediately — not later.
      </Text>

    </View>
  </View>
));

const Section6Web = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webReverse}>
      <Image source={{ uri: image }} style={styles.webSideImage} />
      <View style={styles.webTextBlock}>

        <Text style={styles.webHeading}>
          How the AI Tutor Teaches You
        </Text>

        <Text style={styles.webBody}>
          Each question is decomposed into 10 core concepts.
        </Text>

        <Text style={styles.webBullet}>• Recursive testing</Text>
        <Text style={styles.webBullet}>• Gap detection</Text>
        <Text style={styles.webBullet}>• Immediate correction</Text>

        <Text style={[styles.webBody, styles.emphasis]}>
          Learning stops only when gaps close.
        </Text>

      </View>
    </View>
  </View>
));

/* =========================================================
   SECTION 7 — EXAM MATH
   ========================================================= */

const Section7Mobile = memo(() => (
  <View style={styles.mobileSection}>
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        Exam Math That Actually Works
      </Text>

      <Text style={styles.mobileStep}>
        200 Questions × 10 Minutes
      </Text>

      <Text style={styles.mobileStep}>
        = 40 Hours Per Subject
      </Text>

      <Text style={[styles.mobileBody, styles.emphasis]}>
        40 focused hours beats 400 random hours.
      </Text>

    </View>
  </View>
));

const Section7Web = memo(() => (
  <View style={styles.webSection}>
    <View style={styles.webTextBlock}>

      <Text style={styles.webHeading}>
        Exam Math That Actually Works
      </Text>

      <Text style={styles.webBody}>
        200 questions × 10 minutes = 40 hours
      </Text>

      <Text style={[styles.webBody, styles.emphasis]}>
        Enough for distinction-level preparation.
      </Text>

    </View>
  </View>
));

/* =========================================================
   SECTION 8 — WHY THIS WORKS
   ========================================================= */

const Section8Mobile = memo(() => (
  <View style={styles.mobileSection}>
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        Why This System Works
      </Text>

      <Text style={styles.mobileBody}>
        Because examiners reward:
      </Text>

      <Text style={styles.mobileBullet}>
        • Structured answers
      </Text>
      <Text style={styles.mobileBullet}>
        • Repeated topics
      </Text>
      <Text style={styles.mobileBullet}>
        • Conceptual clarity
      </Text>

      <Text style={[styles.mobileBody, styles.emphasis]}>
        Not textbook memorisation.
      </Text>

    </View>
  </View>
));

const Section8Web = memo(() => (
  <View style={styles.webSection}>
    <View style={styles.webTextBlock}>

      <Text style={styles.webHeading}>
        Why This System Works
      </Text>

      <Text style={styles.webBullet}>• Repetition-based exams</Text>
      <Text style={styles.webBullet}>• Marks for structure</Text>
      <Text style={styles.webBullet}>• Marks for clarity</Text>

      <Text style={[styles.webBody, styles.emphasis]}>
        This system aligns perfectly with evaluation logic.
      </Text>

    </View>
  </View>
));

/* =========================================================
   SECTION 9 — WHO THIS IS FOR
   ========================================================= */

const Section9Mobile = memo(() => (
  <View style={styles.mobileSection}>
    <View style={styles.mobilePadding}>

      <Text style={styles.mobileHeading}>
        Who This Is For
      </Text>

      <Text style={styles.mobileBullet}>
        • MBBS students short on time
      </Text>
      <Text style={styles.mobileBullet}>
        • Students tired of reading blindly
      </Text>
      <Text style={styles.mobileBullet}>
        • Anyone who wants marks — not noise
      </Text>

      <Text style={[styles.mobileBody, styles.emphasis]}>
        Built for reality, not ideal schedules.
      </Text>

    </View>
  </View>
));

const Section9Web = memo(() => (
  <View style={styles.webSection}>
    <View style={styles.webTextBlock}>

      <Text style={styles.webHeading}>
        Who This Is For
      </Text>

      <Text style={styles.webBullet}>• Time-constrained MBBS students</Text>
      <Text style={styles.webBullet}>• Repeaters & first-attempt students</Text>
      <Text style={styles.webBullet}>• Anyone aiming for certainty</Text>

    </View>
  </View>
));

/* =========================================================
   SECTION 10 — CTA
   ========================================================= */

const Section10Mobile = memo(({ onOpenAuth }: any) => (
  <View style={styles.mobileCTASection}>

    <Text style={styles.mobileCTAHeading}>
      Start Exam-Survival Preparation
    </Text>

    <Text style={styles.mobileCTAText}>
      200 questions. 40 hours. Total clarity.
    </Text>

    <Pressable
      style={styles.mobileCTAButton}
      onPress={() => onOpenAuth?.("signup")}
    >
      <Text style={styles.mobileCTAButtonText}>
        Start Now
      </Text>
    </Pressable>

  </View>
));

const Section10Web = memo(({ onOpenAuth }: any) => (
  <View style={styles.webCTASection}>
    <View style={styles.webCTAContent}>

      <Text style={styles.webCTAHeading}>
        Start Exam-Survival Preparation
      </Text>

      <Text style={styles.webCTAText}>
        200 questions. 40 hours. Predictable results.
      </Text>

      <Pressable
        style={styles.webCTAButton}
        onPress={() => onOpenAuth?.("signup")}
      >
        <Text style={styles.webCTAButtonText}>
          Start Now
        </Text>
      </Pressable>

    </View>
  </View>
));

/* =========================================================
   STYLE SHEET COMES IN PART 3
   ========================================================= */
/* =========================================================
   STYLES — EXACT COPY FROM ORIGINAL (UNCHANGED)
   ========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },

  /* ───────────── MOBILE ───────────── */

  mobileContent: {
    paddingBottom: 40,
  },

  mobileSection: {
    marginBottom: 32,
    marginHorizontal: 16,
  },

  mobilePadding: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: '#161b22',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  mobileImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#161b22',
    borderRadius: 16,
    marginBottom: 16,
  },

  mobileImageSection1: {
    width: '100%',
    height: 260,
    backgroundColor: '#161b22',
    borderRadius: 16,
    marginBottom: 16,
  },

  mobileImageSection6: {
    width: '100%',
    height: 340,
    backgroundColor: '#161b22',
    borderRadius: 16,
    marginBottom: 16,
  },

  mobileHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4e4c1',
    marginBottom: 16,
    lineHeight: 22,
    textAlign: 'center',
  },

  mobileBody: {
    fontSize: 16,
    color: '#c9d1d9',
    lineHeight: 24,
    marginBottom: 12,
  },

  mobileBullet: {
    fontSize: 15,
    color: '#8b949e',
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },

  mobileCheck: {
    fontSize: 16,
    color: '#3fb950',
    lineHeight: 24,
    marginBottom: 8,
  },

  mobileStep: {
    fontSize: 18,
    color: '#58a6ff',
    lineHeight: 28,
    marginBottom: 8,
  },

  emphasis: {
    color: '#58a6ff',
    fontWeight: '600',
    marginTop: 8,
  },

  highlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },

  /* ───────────── CTA MOBILE ───────────── */

  mobileCTASection: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#161b22',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  mobileCTAHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f4e4c1',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 36,
  },

  mobileCTAText: {
    fontSize: 16,
    color: '#c9d1d9',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },

  mobileCTAButton: {
    backgroundColor: '#238636',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginTop: 16,
  },

  mobileCTAButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0f6fc',
  },

  /* ───────────── WEB ───────────── */

  webContent: {
    paddingBottom: 80,
  },

  webSection: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 64,
    paddingHorizontal: 48,
    borderRadius: 20,
    marginVertical: 24,
    backgroundColor: '#161b22',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },

  webHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  webReverse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  webHeroText: {
    flex: 1,
    minWidth: 300,
    marginRight: 20,
    marginLeft: 20,
  },

  webTextBlock: {
    flex: 1,
    minWidth: 300,
    marginRight: 20,
    marginLeft: 20,
  },

  webHeroImage: {
    width: '40%',
    maxWidth: 480,
    minWidth: 260,
    aspectRatio: 4 / 3,
    borderRadius: 16,
    backgroundColor: '#161b22',
  },

  webSideImage: {
    width: '40%',
    maxWidth: 420,
    minWidth: 260,
    aspectRatio: 4 / 3,
    borderRadius: 16,
    backgroundColor: '#161b22',
  },

  webHeading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#f4e4c1',
    marginBottom: 24,
    lineHeight: 32,
    textAlign: 'center',
  },

  webSubheading: {
    fontSize: 24,
    color: '#f4e4c1',
    lineHeight: 36,
    marginBottom: 24,
  },

  webBody: {
    fontSize: 18,
    color: '#c9d1d9',
    lineHeight: 28,
    marginBottom: 16,
  },

  webBulletList: {
    marginVertical: 16,
  },

  webBullet: {
    fontSize: 17,
    color: '#8b949e',
    lineHeight: 26,
    marginBottom: 10,
  },

  webStepGrid: {
    flexDirection: 'row',
    marginVertical: 24,
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },

  webStep: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#1c2128',
    padding: 16,
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  webStepNumber: {
    fontSize: 32,
    marginBottom: 8,
  },

  webStepText: {
    fontSize: 17,
    color: '#58a6ff',
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ───────────── CTA WEB ───────────── */

  webCTASection: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 64,
    paddingHorizontal: 48,
    borderRadius: 20,
    marginVertical: 24,
    backgroundColor: '#161b22',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },

  webCTAContent: {
    maxWidth: 800,
    alignSelf: 'center',
    alignItems: 'center',
  },

  webCTAHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f4e4c1',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 36,
  },

  webCTAText: {
    fontSize: 20,
    color: '#c9d1d9',
    lineHeight: 32,
    marginBottom: 20,
    textAlign: 'center',
  },

  webCTAButton: {
    backgroundColor: '#238636',
    paddingVertical: 20,
    paddingHorizontal: 64,
    borderRadius: 8,
    marginTop: 24,
  },

  webCTAButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f0f6fc',
  },
});
