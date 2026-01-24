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
  StyleSheet,
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
  const isMobile = Platform.OS !== "web" || width < 768;
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      {isMobile ? (
        <MobileLayout images={images} onOpenAuth={onOpenAuth} />
      ) : (
<WebLayout
  images={images}
  onOpenAuth={onOpenAuth}
/>


      )}
      <Footer />
    </ScrollView>
  );
}

/* =========================================================
   SECTION 1 — HERO
   Question: What is this?
   ========================================================= */

const HeroMobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImageSection1} />
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          MBBS Exams Are Not About Reading Everything.
        </Text>

        <Text style={styles.mobileBody}>
          They are about writing what examiners keep asking.
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileBullet}>
              ⏱ Very little time
            </Text>
            <Text style={styles.mobileBullet}>
              📚 Too much syllabus
            </Text>
            <Text style={styles.mobileBullet}>
              ❓ No clarity what to study
            </Text>
          </View>
        </View>

        <Text style={[styles.mobileBody, styles.emphasis]}>
          Paragraph fixes this.
        </Text>

      </View>
    </View>
  </View>
));

const HeroWeb = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>

      <Image source={{ uri: image }} style={styles.webImage} />

      <Text style={styles.webHeading}>
        MBBS Exams Are Not About Reading Everything.
      </Text>

      <Text style={styles.webBody}>
        They are about writing what examiners keep asking.
      </Text>

      <View style={styles.bulletGroup}>
        <Text style={styles.webBullet}>⏱ Very little time</Text>
        <Text style={styles.webBullet}>📚 Too much syllabus</Text>
        <Text style={styles.webBullet}>❓ No clarity what to study</Text>
      </View>

      <Text style={[styles.webBody, styles.emphasis]}>
        Paragraph fixes this.
      </Text>

    </View>
  </View>
));




/* =========================================================
   SECTION 2 — PROBLEM
   Question: Why am I stuck?
   ========================================================= */

const ProblemMobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          Why Most MBBS Students Struggle
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileBullet}>
              • No syllabus boundaries
            </Text>
            <Text style={styles.mobileBullet}>
              • No question priority
            </Text>
            <Text style={styles.mobileBullet}>
              • Too much to revise, too little time
            </Text>
          </View>
        </View>

        <Text style={[styles.mobileBody, styles.emphasis]}>
          This is not a discipline problem. It's a system problem.
        </Text>

      </View>
    </View>
  </View>
));

const ProblemWeb = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      <Image source={{ uri: image }} style={styles.webImage} />
      
      <Text style={styles.webHeading}>
        Why Most MBBS Students Get Stuck
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webBullet}>
            • Infinite syllabus
          </Text>
          <Text style={styles.webBullet}>
            • No exam priority
          </Text>
          <Text style={styles.webBullet}>
            • Revision chaos
          </Text>
        </View>
      </View>

      <Text style={[styles.webBody, styles.emphasis]}>
        This is not a discipline problem. It's a system problem.
      </Text>
    </View>
  </View>
));

/* =========================================================
   SECTION 3 — SYSTEM (SECRET SAUCE)
   Question: What's the secret?
   ========================================================= */

const SystemMobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          THE SYSTEM (15 YEARS PROVEN)
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileStep}>
              1️⃣ Past 15 years papers analysed
            </Text>
            <Text style={styles.mobileStep}>
              2️⃣ 200 repeated questions selected
            </Text>
            <Text style={styles.mobileStep}>
              3️⃣ Only what examiners ask
            </Text>
            <Text style={styles.mobileStep}>
              4️⃣ You revise exactly this
            </Text>
          </View>
        </View>

      </View>
    </View>
  </View>
));

const SystemWeb = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      <Image source={{ uri: image }} style={styles.webImage} />
      
      <Text style={styles.webHeading}>
        The System (15 Years Proven)
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webBullet}>
            1️⃣ 15 years analysed
          </Text>
          <Text style={styles.webBullet}>
            2️⃣ 200 repeated questions
          </Text>
          <Text style={styles.webBullet}>
            3️⃣ Examiner-only focus
          </Text>
          <Text style={styles.webBullet}>
            4️⃣ Revise exactly this
          </Text>
        </View>
      </View>
    </View>
  </View>
));

/* =========================================================
   CTA PLACEHOLDERS (FULL CTA IN PART 3)
   ========================================================= */

const CTAMobile = memo(({ onOpenAuth }: any) => (
  <View />
));

const CTAWeb = memo(({ onOpenAuth }: any) => (
  <View />
));
/* =========================================================
   HomeScreen.tsx — EXAM SURVIVAL LANDING PAGE
   PART 2 / 3
   ========================================================= */

/* =========================================================
   SECTION 4 — SCOPE
   Question: What do I study?
   ========================================================= */

const ScopeMobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          What You Actually Study
        </Text>

        <Text style={styles.mobileBody}>
          Every MBBS subject reduces to:
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileStep}>
              ✔ 200 exam-repeated questions
            </Text>
            <Text style={styles.mobileStep}>
              ✔ Nothing outside this scope
            </Text>
          </View>
        </View>

        <Text style={[styles.mobileBody, styles.emphasis]}>
          This becomes your syllabus.
        </Text>

      </View>
    </View>
  </View>
));

const ScopeWeb = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      <Image source={{ uri: image }} style={styles.webImage} />
      
      <Text style={styles.webHeading}>
        What You Actually Study
      </Text>

      <Text style={styles.webBody}>
        Every MBBS subject reduces to:
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webBullet}>
            • Only 200 repeated MBBS questions
          </Text>
          <Text style={styles.webBullet}>
            • Nothing outside examiner scope
          </Text>
        </View>
      </View>

      <Text style={[styles.webBody, styles.emphasis]}>
        This becomes your syllabus.
      </Text>
    </View>
  </View>
));

/* =========================================================
   SECTION 5 — CONTENT
   Question: What do I get per question?
   ========================================================= */

const ContentMobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImage} />
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          Each Question Includes
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileCheck}>
              ✔ Central Concept
            </Text>
            <Text style={styles.mobileCheck}>
              ✔ 25 High-Yield Facts
            </Text>
            <Text style={styles.mobileCheck}>
              ✔ 5 Clinical Case Vignettes
            </Text>
            <Text style={styles.mobileCheck}>
              ✔ Rapid Revision Tables
            </Text>
            <Text style={styles.mobileCheck}>
              ✔ AI Tutor for doubts
            </Text>
          </View>
        </View>

      </View>
    </View>
  </View>
));

const ContentWeb = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      <Image source={{ uri: image }} style={styles.webImage} />
      
      <Text style={styles.webHeading}>
        Each Question Includes
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webBullet}>
            ✔ Central Concept
          </Text>
          <Text style={styles.webBullet}>
            ✔ 25 High-Yield Facts
          </Text>
          <Text style={styles.webBullet}>
            ✔ 5 Clinical Case Vignettes
          </Text>
          <Text style={styles.webBullet}>
            ✔ Rapid Revision Tables
          </Text>
          <Text style={styles.webBullet}>
            ✔ AI Tutor
          </Text>
        </View>
      </View>
    </View>
  </View>
));

/* =========================================================
   SECTION 6 — METHOD
   Question: How exactly does AI help me?
   ========================================================= */

const MethodMobile = memo(({ image }: { image: string }) => (
  <View style={styles.mobileSection}>
    <Image source={{ uri: image }} style={styles.mobileImageSection6} />
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          How Your AI Tutor Works
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileBullet}>
              • You answer questions
            </Text>
            <Text style={styles.mobileBullet}>
              • Weak areas are detected
            </Text>
            <Text style={styles.mobileBullet}>
              • Only weak topics are pushed
            </Text>
            <Text style={styles.mobileBullet}>
              • Repeats till clarity
            </Text>
          </View>
        </View>

      </View>
    </View>
  </View>
));

const MethodWeb = memo(({ image }: { image: string }) => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      <Image source={{ uri: image }} style={styles.webImageTall} />
      
      <Text style={styles.webHeading}>
        How the AI Tutor Helps You
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webBullet}>
            • You answer
          </Text>
          <Text style={styles.webBullet}>
            • Gaps are found
          </Text>
          <Text style={styles.webBullet}>
            • Only weak topics repeat
          </Text>
          <Text style={styles.webBullet}>
            • Stops when mastered
          </Text>
        </View>
      </View>
    </View>
  </View>
));

/* =========================================================
   SECTION 7 — EXAM MATH
   Question: Is this time-efficient?
   ========================================================= */

const MathMobile = memo(() => (
  <View style={styles.mobileSection}>
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          Exam Math That Works
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileStep}>
              200 Questions × 10 Minutes
            </Text>
            <Text style={styles.mobileStep}>
              = 40 Hours
            </Text>
          </View>
        </View>

        <Text style={[styles.mobileBody, styles.emphasis]}>
          Distinction-level preparation.
        </Text>

      </View>
    </View>
  </View>
));

const MathWeb = memo(() => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      
      <Text style={styles.webHeading}>
        Exam Math That Works
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webStep}>
            200 Questions × 10 Minutes
          </Text>
          <Text style={styles.webStep}>
            = 40 Hours
          </Text>
        </View>
      </View>

      <Text style={[styles.webBody, styles.emphasis]}>
        Distinction-level preparation.
      </Text>
    </View>
  </View>
));

/* =========================================================
   SECTION 8 — SYSTEM VS FACULTY
   Question: Why this system?
   ========================================================= */

const SystemVsFacultyMobile = memo(() => (
  <View style={styles.mobileSection}>
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          Not Faculty. A System.
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileBullet}>
              ✔ Exam-focused questions
            </Text>
            <Text style={styles.mobileBullet}>
              ✔ AI-driven revision
            </Text>
            <Text style={styles.mobileBullet}>
              ✔ Daily gap fixing
            </Text>
          </View>
        </View>

        <Text style={[styles.mobileBody, styles.emphasis]}>
          No marathon lectures. No noise.
        </Text>

      </View>
    </View>
  </View>
));

const SystemVsFacultyWeb = memo(() => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      
      <Text style={styles.webHeading}>
        Not Faculty. A System.
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webBullet}>
            ✔ Question-first learning
          </Text>
          <Text style={styles.webBullet}>
            ✔ AI revision loops
          </Text>
          <Text style={styles.webBullet}>
            ✔ Continuous gap correction
          </Text>
        </View>
      </View>

      <Text style={[styles.webBody, styles.emphasis]}>
        No marathon lectures. No noise.
      </Text>
    </View>
  </View>
));
/* =========================================================
   HomeScreen.tsx — EXAM SURVIVAL LANDING PAGE
   PART 3 / 3
   ========================================================= */

/* =========================================================
   SECTION 9 — WHO
   Question: Is this for me?
   ========================================================= */

const WhoMobile = memo(() => (
  <View style={styles.mobileSection}>
    <View style={styles.mobilePadding}>
      <View style={styles.mobileTextCenterBlock}>

        <Text style={styles.mobileHeading}>
          Who This Is For
        </Text>

        <View style={styles.bulletGroup}>
          <View style={styles.bulletColumn}>
            <Text style={styles.mobileBullet}>
              • MBBS students short on time
            </Text>
            <Text style={styles.mobileBullet}>
              • Students confused what to study
            </Text>
            <Text style={styles.mobileBullet}>
              • Anyone who wants marks, not noise
            </Text>
          </View>
        </View>

        <Text style={[styles.mobileBody, styles.emphasis]}>
          Built for real MBBS schedules.
        </Text>

      </View>
    </View>
  </View>
));

const WhoWeb = memo(() => (
  <View style={styles.webSection}>
    <View style={styles.webVerticalLayout}>
      
      <Text style={styles.webHeading}>
        Who This Is For
      </Text>

      <View style={styles.bulletGroup}>
        <View style={styles.bulletColumn}>
          <Text style={styles.webBullet}>
            • Time-constrained MBBS students
          </Text>
          <Text style={styles.webBullet}>
            • First-attempt and repeat students
          </Text>
          <Text style={styles.webBullet}>
            • Anyone who wants predictable results
          </Text>
        </View>
      </View>

      <Text style={[styles.webBody, styles.emphasis]}>
        Built for real MBBS schedules.
      </Text>
    </View>
  </View>
));

/* =========================================================
   SECTION 10 — CTA
   Question: What do I do now?
   ========================================================= */

const FinalCTAMobile = memo(({ onOpenAuth }: any) => (
  <View style={styles.mobileCTASection}>

    <Text style={styles.mobileCTAHeading}>
      Start Exam-Focused Preparation Today
    </Text>

    <Text style={styles.mobileCTAText}>
      200 Questions. 40 Hours. One Clear System.
    </Text>

    <Pressable
      style={styles.mobileCTAButton}
      onPress={() => onOpenAuth?.("signup")}
    >
      <Text style={styles.mobileCTAButtonText}>
        Start MBBS Exam Prep
      </Text>
    </Pressable>

  </View>
));

const FinalCTAWeb = memo(({ onOpenAuth }: any) => (
  <View style={styles.webCTASection}>
    <View style={styles.webVerticalLayout}>

      <Text style={styles.webCTAHeading}>
        Start Exam-Focused Preparation Today
      </Text>

      <Text style={styles.webCTAText}>
        200 Questions. 40 Hours. Pass MBBS Exams with Confidence.
      </Text>

      <Pressable
        style={styles.webCTAButton}
        onPress={() => onOpenAuth?.("signup")}
      >
        <Text style={styles.webCTAButtonText}>
          Start MBBS Exam Prep
        </Text>
      </Pressable>

    </View>
  </View>
));

/* =========================================================
   FINAL LAYOUT WIRING (REPLACE EXISTING)
   ========================================================= */

function MobileLayout({ images, onOpenAuth }: any) {
  return (
    <ScrollView contentContainerStyle={styles.mobileContent}>

      <HeroMobile image={images.img1} />
      <ProblemMobile image={images.img2} />
      <SystemMobile image={images.img3} />
      <ScopeMobile image={images.img4} />
      <ContentMobile image={images.img5} />
      <MethodMobile image={images.img6} />
      <MathMobile />
      <SystemVsFacultyMobile />
      <WhoMobile />
      <FinalCTAMobile onOpenAuth={onOpenAuth} />

    </ScrollView>
  );
}

function WebLayout({ images, onOpenAuth }: any) {
  return (
    <ScrollView contentContainerStyle={styles.webContent}>
      <HeroWeb
        image={images.img1}
      />

      <ProblemWeb image={images.img2} />
      <SystemWeb image={images.img3} />
      <ScopeWeb image={images.img4} />
      <ContentWeb image={images.img5} />
      <MethodWeb image={images.img6} />
      <MathWeb />
      <SystemVsFacultyWeb />
      <WhoWeb />
      <FinalCTAWeb onOpenAuth={onOpenAuth} />

    </ScrollView>
  );
}

/* =========================================================
   STYLES — DARK MODE / MONOLITHIC / MOBILE-FIRST
   REDESIGNED WEB: SINGLE COLUMN VERTICAL FLOW
   ========================================================= */

const styles = StyleSheet.create({
  /* ───────────── ROOT ───────────── */

  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },

  /* ───────────── MOBILE (UNCHANGED) ───────────── */

  mobileContent: {
    paddingBottom: 64,
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

  mobileTextCenterBlock: {
    alignItems: 'center',
  },

  mobileImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#161b22',
  },

  mobileImageSection1: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#161b22',
  },

  mobileImageSection6: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#161b22',
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
    marginBottom: 10,
    textAlign: 'left',
  },

mobileBullet: {
  fontSize: 15,
  color: '#E6B65C',   // 👈 FIX
  lineHeight: 22,
  marginBottom: 10,
  paddingLeft: 6,
  fontWeight: '500',
},


  mobileCheck: {
    fontSize: 16,
    color: '#c9d1d9',
    lineHeight: 24,
    marginBottom: 12,
    paddingLeft: 8,
    fontWeight: '600',
  },

  mobileStep: {
    fontSize: 18,
    color: '#58a6ff',
    lineHeight: 28,
    marginBottom: 8,
    fontWeight: '600',
  },

  emphasis: {
    color: '#58a6ff',
    fontWeight: '600',
    marginTop: 8,
  },

  highlight: {
    color: '#FFD700',
    fontWeight: '700',
  },

  /* ───────────── BULLET CENTERING (UNCHANGED) ───────────── */

  bulletGroup: {
    marginBottom: 8,
  },

  bulletColumn: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  bulletItem: {
    width: '100%',
    maxWidth: 420,
    textAlign: 'left',
  },

  /* ───────────── MOBILE CTA (UNCHANGED) ───────────── */

  mobileCTASection: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#161b22',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },

  mobileCTAHeading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f4e4c1',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 34,
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
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 8,
  },

  mobileCTAButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f0f6fc',
  },

  /* ───────────── WEB (REDESIGNED: SINGLE COLUMN) ───────────── */

  webContent: {
    paddingBottom: 96,
  },

  webSection: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 48,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginVertical: 24,
    backgroundColor: '#161b22',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },

  webVerticalLayout: {
    width: '100%',
    alignItems: 'center',
  },

  webImage: {
  width: '100%',
  aspectRatio: 16 / 9,
  borderRadius: 16,
  marginBottom: 32,
  backgroundColor: '#0d1117',
},


  webImageTall: {
    width: '100%',
    height: 420,
    borderRadius: 16,
    marginBottom: 32,
    backgroundColor: '#0d1117',
  },

  webHeading: {
    fontSize: 28,
    fontWeight: '600',
    color: '#f4e4c1',
    marginBottom: 20,
    lineHeight: 36,
    textAlign: 'center',
  },

  webBody: {
    fontSize: 18,
    color: '#c9d1d9',
    lineHeight: 28,
    marginBottom: 14,
    textAlign: 'center',
  },

  webBullet: {
  fontSize: 17,
  color: '#E6B65C',   // 👈 FIX
  lineHeight: 26,
  marginBottom: 10,
  fontWeight: '500',
},


  webStep: {
    fontSize: 20,
    color: '#58a6ff',
    lineHeight: 32,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ───────────── WEB CTA ───────────── */

  webCTASection: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 64,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginVertical: 32,
    backgroundColor: '#161b22',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },

  webCTAHeading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f4e4c1',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 40,
  },

  webCTAText: {
    fontSize: 20,
    color: '#c9d1d9',
    lineHeight: 32,
    marginBottom: 32,
    textAlign: 'center',
  },

  webCTAButton: {
    backgroundColor: '#238636',
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 10,
    alignSelf: 'center',
  },

  webCTAButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f0f6fc',
  },
});
