import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import Footer from './Footer';
import { useAuth } from "@/contexts/AuthContext";
import {
  CBMECurriculumTableMobile,
  CBMECurriculumTableWeb,
} from "@/components/CBMECurriculumTable";

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
    img11: string;
  };
}
export default function HomeScreen(
  { images, onOpenAuth }: HomeScreenProps & { onOpenAuth?: (mode: "login" | "signup") => void }
) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isMobile = !isWeb || width < 768;

  const { user } = useAuth();
  const isLoggedIn = !!user;

  if (isMobile) {
    return (
      <MobileLayout
        images={images}
        onOpenAuth={onOpenAuth}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  return (
    <WebLayout
      images={images}
      onOpenAuth={onOpenAuth}
      isLoggedIn={isLoggedIn}
    />
  );
}

function MobileLayout({ images, onOpenAuth, isLoggedIn }: HomeScreenProps & {
  onOpenAuth?: (mode: "login" | "signup") => void;
  isLoggedIn: boolean;
}) {

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.mobileContent}>
      <Section1Mobile image={images.img1} />
      <Section5Mobile image={images.img5} />
      <CBMECurriculumTableMobile />
      <ProFeaturesUnlockMobile />
      <AIPersonalizationMobile />
      <SystemNotFacultyMobile />
      <PersonalMentorMobile />
      <Section2Mobile image={images.img2} />
      <Section4Mobile image={images.img4} />
      <Section3Mobile image={images.img3} />
      <Section6Mobile image={images.img6} />
      <Block5Mobile image={images.img11} />
      <Section9Mobile onOpenAuth={onOpenAuth} isLoggedIn={isLoggedIn} />

      <Footer />
    </ScrollView>
  );
}

function WebLayout({ images, onOpenAuth, isLoggedIn }: HomeScreenProps & {
  onOpenAuth?: (mode: "login" | "signup") => void;
  isLoggedIn: boolean;
}) {

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.webContent}>
      <Section1Web image={images.img1} />
  <Section5Web image={images.img5} />
       <CBMECurriculumTableWeb />
<ProFeaturesUnlockWeb />
<AIPersonalizationWeb />
<SystemNotFacultyWeb />
<PersonalMentorWeb />
<Section2Web image={images.img2} />
<Section4Web image={images.img4} />
<Section3Web image={images.img3} />
<Section6Web image={images.img6} />
<Block5Web image={images.img11} />
      <Section9Web onOpenAuth={onOpenAuth} isLoggedIn={isLoggedIn} />

      <Footer />
    </ScrollView>
  );
}

const Section1Mobile = memo(({ image }: { image: string }) => {
  console.log('Section1Mobile mounted');
  return (
<View style={[styles.mobileSection, { marginBottom: 20 }]}>
      <Image
  source={{ uri: image }}
  style={styles.mobileImageSection1}
  resizeMode="cover"
  progressiveRenderingEnabled
/>
      <View style={styles.mobilePadding}>
<Text style={styles.mobileHeading}>
The Real Problem Is Cracking MBBS University Exams.
You Didn't Fail.
</Text>

<Text style={styles.mobileBody}>
You're Not a Weak Student — The Exam System Is Brutal.
</Text>

<Text style={styles.mobileBody}>
Most MBBS students struggle with university exams because of:
</Text>

<Text style={styles.mobileBullet}>
• <Text style={styles.highlight}>Very short preparation time</Text> between postings and exams
</Text>

<Text style={styles.mobileBullet}>
• <Text style={styles.highlight}>Little to no personalised coaching</Text> on what to study and what to skip
</Text>

<Text style={styles.mobileBullet}>
• <Text style={styles.highlight}>Massive textbooks</Text> with no clear exam boundaries
</Text>

<Text style={styles.mobileBullet}>
• <Text style={styles.highlight}>Minimal clinical correlation</Text> in routine medical college classes
</Text>

<Text style={styles.mobileBullet}>
• <Text style={styles.highlight}>Unclear exam expectations</Text> — what actually fetches marks
</Text>

<Text style={styles.mobileBullet}>
• <Text style={styles.highlight}>Last-minute panic</Text> instead of structured revision
</Text>

<Text style={[styles.mobileBody, styles.emphasis]}>
This isn't preparation.{'\n'}
This is survival.{'\n'}
And survival mode destroys confidence before exams.
</Text>

      </View>
    </View>
  );
});

const Section1Web = memo(({ image }: { image: string }) => {
  console.log('Section1Web mounted');
  return (
    <View style={styles.webSection}>
      <View style={styles.webHero}>
        <View style={styles.webHeroText}>
          <Text style={styles.webHeading}>
The Real Problem Is Cracking MBBS University Exams.
You Didn't Fail.
</Text>

<Text style={styles.webSubheading}>
You're Not a Weak Student — The Exam System Is Brutal.
</Text>

<View style={styles.webBulletList}>
  <Text style={styles.webBullet}>
    • <Text style={styles.highlight}>Very short preparation time</Text> between postings and exams
  </Text>
  <Text style={styles.webBullet}>
    • <Text style={styles.highlight}>Little to no personalised coaching</Text> on what actually fetches marks
  </Text>
  <Text style={styles.webBullet}>
    • <Text style={styles.highlight}>Huge textbooks</Text> with no exam-oriented filtering
  </Text>
  <Text style={styles.webBullet}>
    • <Text style={styles.highlight}>Poor clinical correlation</Text> in routine medical college teaching
  </Text>
  <Text style={styles.webBullet}>
    • <Text style={styles.highlight}>Unpredictable question patterns</Text> year after year
  </Text>
  <Text style={styles.webBullet}>
    • <Text style={styles.highlight}>Last-minute revision chaos</Text> instead of structured preparation
  </Text>
</View>

<Text style={[styles.webBody, styles.emphasis]}>
This isn't preparation. This is survival.{'\n'}
And survival mode kills confidence in university exams.
</Text>
 </View>
        <Image source={{ uri: image }} style={styles.webHeroImage} resizeMode="contain" progressiveRenderingEnabled />
      </View>
    </View>
  );
});

const Section2Mobile = memo(({ image }: { image: string }) => {
  console.log('Section2Mobile mounted');
  return (
    <View style={styles.mobileSection}>
      <Image source={{ uri: image }} style={styles.mobileImage} resizeMode="cover" progressiveRenderingEnabled />
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>MBBS CBME Syllabus Mastery That Actually Works</Text>
        <Text style={styles.mobileBody}>
          Learning can be rewarding, sharp, and energising.
        </Text>
        <Text style={styles.mobileBody}>That's why Paragraph rebuilds your entire journey around:</Text>
        <Text style={styles.mobileCheck}>✔ Short, personalised quizzes</Text>
        <Text style={styles.mobileCheck}>✔ Instant clarity</Text>
        <Text style={styles.mobileCheck}>✔ Visible progress you can feel proud of</Text>
        <Text style={[styles.mobileBody, styles.emphasis]}>
          Minus the drudgery.{'\n'}Plus the dopamine.
        </Text>
      </View>
    </View>
  );
});

const Section2Web = memo(({ image }: { image: string }) => {
  console.log('Section2Web mounted');
  return (
    <View style={styles.webSection}>
      <View style={styles.webReverse}>
        <Image source={{ uri: image }} style={styles.webSideImage} resizeMode="contain" progressiveRenderingEnabled />
        <View style={styles.webTextBlock}>
          <Text style={styles.webHeading}>MBBS CBME Syllabus Mastery That Actually Works</Text>
          <Text style={styles.webBody}>
            Learning can be rewarding, sharp, and energising.
          </Text>
          <Text style={styles.webBody}>That's why Paragraph rebuilds your entire journey around:</Text>
          <View style={styles.webCheckList}>
            <Text style={styles.webCheck}>✔ Short, personalised quizzes</Text>
            <Text style={styles.webCheck}>✔ Instant clarity</Text>
            <Text style={styles.webCheck}>✔ Visible progress you can feel proud of</Text>
          </View>
          <Text style={[styles.webBody, styles.emphasis]}>
            Minus the drudgery. Plus the dopamine.
          </Text>
        </View>
      </View>
    </View>
  );
});

const Section3Mobile = memo(({ image }: { image: string }) => {
  console.log('Section3Mobile mounted');
  return (
    <View style={styles.mobileSection}>
      <Image source={{ uri: image }} style={styles.mobileImage} resizeMode="cover" progressiveRenderingEnabled />
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>Daily Support, Not Daily Stress</Text>
        <Text style={styles.mobileBody}>
          Most apps show a goal.{'\n'}Paragraph actually helps you reach it.
        </Text>
        <Text style={styles.mobileBody}>
          <Text style={styles.bold}>Didn't study today?</Text> Your AI nudges you gently.
        </Text>
        <Text style={styles.mobileBody}>
          <Text style={styles.bold}>Feeling stuck?</Text> It triggers a quick 5-minute revision.
        </Text>
        <Text style={styles.mobileBody}>
          <Text style={styles.bold}>Losing consistency?</Text> It restarts your momentum instantly.
        </Text>
        <Text style={[styles.mobileBody, styles.emphasis]}>
          This isn't an app.{'\n'}It's a daily coaching system that keeps you moving.
        </Text>
      </View>
    </View>
  );
});

const Section3Web = memo(({ image }: { image: string }) => {
  console.log('Section3Web mounted');
  return (
    <View style={styles.webSection}>
      <View style={styles.webHero}>
        <View style={styles.webTextBlock}>
          <Text style={styles.webHeading}>Daily Support, Not Daily Stress</Text>
          <Text style={styles.webSubheading}>
            Most apps show a goal. Paragraph actually helps you reach it.
          </Text>
          <View style={styles.webFeatureGrid}>
            <View style={styles.webFeature}>
              <Text style={styles.webFeatureTitle}>Didn't study today?</Text>
              <Text style={styles.webFeatureText}>Your AI nudges you gently.</Text>
            </View>
            <View style={styles.webFeature}>
              <Text style={styles.webFeatureTitle}>Feeling stuck?</Text>
              <Text style={styles.webFeatureText}>It triggers a quick 5-minute revision.</Text>
            </View>
            <View style={styles.webFeature}>
              <Text style={styles.webFeatureTitle}>Losing consistency?</Text>
              <Text style={styles.webFeatureText}>It restarts your momentum instantly.</Text>
            </View>
          </View>
          <Text style={[styles.webBody, styles.emphasis]}>
            This isn't an app. It's a daily coaching system that keeps you moving.
          </Text>
        </View>
        <Image source={{ uri: image }} style={styles.webSideImage} resizeMode="contain" progressiveRenderingEnabled />
      </View>
    </View>
  );
});

const Section4Mobile = memo(({ image }: { image: string }) => {
  console.log('Section4Mobile mounted');
  return (
    <View style={styles.mobileSection}>
      <Image source={{ uri: image }} style={styles.mobileImage} resizeMode="cover" progressiveRenderingEnabled />
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>From Mistakes to Mastery</Text>
        <Text style={styles.mobileBody}>
          Every mistake is a message.{'\n'}Paragraph listens.
        </Text>
        <Text style={styles.mobileBody}>
          If you get 6 MCQs wrong today, the system instantly:
        </Text>
        <Text style={styles.mobileBullet}>• Detects the weak topics</Text>
        <Text style={styles.mobileBullet}>• Converts them into your revision list</Text>
        <Text style={styles.mobileBullet}>• Auto-prioritises based on your gaps</Text>
        <Text style={[styles.mobileBody, styles.emphasis]}>
          This is how toppers study — not more, but smarter, consistently closing loops.
        </Text>
      </View>
    </View>
  );
});

const Section4Web = memo(({ image }: { image: string }) => {
  console.log('Section4Web mounted');
  return (
    <View style={styles.webSection}>
      <View style={styles.webReverse}>
        <Image source={{ uri: image }} style={styles.webSideImage} resizeMode="contain" progressiveRenderingEnabled />
        <View style={styles.webTextBlock}>
          <Text style={styles.webHeading}>From Mistakes to Mastery</Text>
          <Text style={styles.webSubheading}>
            Every mistake is a message. Paragraph listens.
          </Text>
          <Text style={styles.webBody}>
            If you get 6 MCQs wrong today, the system instantly:
          </Text>
          <View style={styles.webBulletList}>
            <Text style={styles.webBullet}>• Detects the weak topics</Text>
            <Text style={styles.webBullet}>• Converts them into your revision list</Text>
            <Text style={styles.webBullet}>• Auto-prioritises based on your gaps</Text>
          </View>
          <Text style={[styles.webBody, styles.emphasis]}>
            This is how toppers study — not more, but smarter, consistently closing loops.
          </Text>
        </View>
      </View>
    </View>
  );
});

const Section5Mobile = memo(({ image }: { image: string }) => {
  console.log('Section5Mobile mounted');
  return (
    <View style={styles.mobileSection}>
      <Image source={{ uri: image }} style={styles.mobileImage} resizeMode="cover" progressiveRenderingEnabled />
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>
14 MBBS University Exams. 19 Subjects. One Proven System.
</Text>
<Text style={styles.mobileBody}>
AI-powered MBBS UHS University PYQ Question Bank — built strictly for Indian medical colleges.
</Text>
<Text style={styles.mobileBody}>
MBBS university exams are not about reading everything.
They are about writing what examiners repeatedly ask.
</Text>

<Text style={styles.mobileBody}>
Paragraph is built from AI analysis of the last 15 years —
30 UHS MBBS question papers per subject.
</Text>

<Text style={styles.mobileBody}>
For each of the 15 MBBS subjects, we identify:
</Text>

<Text style={styles.mobileStep}>1️⃣ 200 Most Repeated University Questions</Text>
<Text style={styles.mobileStep}>2️⃣ 25 High-Yield Conceptual Facts per Topic</Text>
<Text style={styles.mobileStep}>3️⃣ 10-Minute Rapid Revision per Topic</Text>
<Text style={styles.mobileStep}>4️⃣ Clinically Framed Answers Examiners Expect</Text>

<Text style={[styles.mobileBody, styles.emphasis]}>
40 hours of focused preparation per paper{'\n'}
is enough to score Distinction — and even Gold Medal.
</Text>

<Text style={styles.mobileBody}>
No unnecessary reading.{'\n'}
No guesswork.{'\n'}
No last-minute panic.
</Text>

<Text style={[styles.mobileBody, styles.emphasis]}>
Just a precise, university-exam–oriented system{'\n'}
that tells you exactly what to study — and what to skip.
</Text>
      </View>
    </View>
  );
});

const Section5Web = memo(({ image }: { image: string }) => {
  console.log('Section5Web mounted');
  return (
    <View style={styles.webSection}>
      <View style={styles.webHero}>
        <View style={styles.webTextBlock}>
 <Text style={styles.webHeading}>
14 MBBS University Exams. 19 Subjects. One Proven System.
</Text>
<Text style={styles.webBody}>
AI-powered MBBS UHS University PYQ Question Bank designed for UHS & Indian medical universities.
</Text>
<Text style={styles.webSubheading}>
University exams reward precision — not volume.
Paragraph trains you exactly for that.
</Text>

<Text style={styles.webBody}>
Paragraph is powered by AI analysis of the last 15 years —
30 UHS MBBS university question papers per subject.
</Text>

<Text style={styles.webBody}>
Across all 15 MBBS subjects, the system extracts:
</Text>

<View style={styles.webStepGrid}>
  <View style={styles.webStep}>
    <Text style={styles.webStepNumber}>1️⃣</Text>
    <Text style={styles.webStepText}>200 Most Repeated Questions</Text>
  </View>
  <View style={styles.webStep}>
    <Text style={styles.webStepNumber}>2️⃣</Text>
    <Text style={styles.webStepText}>25 High-Yield Facts per Topic</Text>
  </View>
  <View style={styles.webStep}>
    <Text style={styles.webStepNumber}>3️⃣</Text>
    <Text style={styles.webStepText}>10-Minute Rapid Revision</Text>
  </View>
  <View style={styles.webStep}>
    <Text style={styles.webStepNumber}>4️⃣</Text>
    <Text style={styles.webStepText}>Exam-Ready Answer Framing</Text>
  </View>
</View>

<Text style={[styles.webBody, styles.emphasis]}>
40 hours of focused preparation per paper{'\n'}
is sufficient for Distinction-level performance.
</Text>

<Text style={styles.webBody}>
No bulky textbooks. No random notes. No uncertainty.
</Text>

<Text style={[styles.webBody, styles.emphasis]}>
Just a clear, repeatable university-exam system{'\n'}
designed to maximise marks — year after year.
</Text>

        </View>
        <Image source={{ uri: image }} style={styles.webSideImage} resizeMode="contain" progressiveRenderingEnabled />
      </View>
    </View>
  );
});

const Section6Mobile = memo(({ image }: { image: string }) => {
  console.log('Section6Mobile mounted');
  return (
    <View style={styles.mobileSection}>
      <Image source={{ uri: image }} style={styles.mobileImageSection6} resizeMode="cover" progressiveRenderingEnabled />
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>You Are Never Alone</Text>
        <Text style={styles.mobileBody}>
          And unlike coaching classes where you struggle in silence…
        </Text>
        <Text style={styles.mobileBody}>
          Paragraph gives you a 24×7 AI Tutor that clears doubts instantly:
        </Text>
        <View style={styles.doubtBox}>
          <Text style={styles.doubtText}>"Sir, I'm confused about CO formula…"</Text>
          <Text style={styles.doubtText}>"Factors affecting HR and SV?"</Text>
          <Text style={styles.doubtText}>"Why is this MCQ wrong?"</Text>
        </View>
        <Text style={[styles.mobileBody, styles.emphasis]}>
          Every concept becomes clear.{'\n'}
          Every mistake is corrected immediately.{'\n'}
          You learn with confidence — not confusion.
        </Text>
      </View>
    </View>
  );
});

const Section6Web = memo(({ image }: { image: string }) => {
  console.log('Section6Web mounted');
  return (
    <View style={styles.webSection}>
      <View style={styles.webReverse}>
        <Image source={{ uri: image }} style={styles.webSideImage} resizeMode="contain" progressiveRenderingEnabled />
        <View style={styles.webTextBlock}>
          <Text style={styles.webHeading}>You Are Never Alone</Text>
          <Text style={styles.webBody}>
            And unlike coaching classes where you struggle in silence…
          </Text>
          <Text style={styles.webBody}>
            Paragraph gives you a 24×7 AI Tutor that clears doubts instantly:
          </Text>
          <View style={styles.webDoubtBox}>
            <Text style={styles.webDoubtText}>"Sir, I'm confused about CO formula…"</Text>
            <Text style={styles.webDoubtText}>"Factors affecting HR and SV?"</Text>
            <Text style={styles.webDoubtText}>"Why is this MCQ wrong?"</Text>
          </View>
          <Text style={[styles.webBody, styles.emphasis]}>
            Every concept becomes clear. Every mistake is corrected immediately.{'\n'}
            You learn with confidence — not confusion.
          </Text>
        </View>
      </View>
    </View>
  );
});

const Block5Mobile = memo(({ image }: { image: string }) => {
  return (
    <View style={styles.mobileSection}>
      <Image source={{ uri: image }} style={styles.mobileImage} resizeMode="cover" progressiveRenderingEnabled />
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>A System That Adapts To You</Text>
        <Text style={styles.mobileBody}>
          AI-driven adaptive learning based on mistakes and speed
        </Text>
        <Text style={styles.mobileBody}>
          24×7 AI doubt-clearing chat
        </Text>
        <Text style={styles.mobileBody}>
          Automatic revision and gap-closing without planning stress
        </Text>
        <Text style={[styles.mobileBody, styles.emphasis]}>
          Feels like a personal mentor — because it behaves like one.
        </Text>
      </View>
    </View>
  );
});

const Block5Web = memo(({ image }: { image: string }) => {
  return (
    <View style={styles.webSection}>
      <View style={styles.webHero}>
        <View style={styles.webTextBlock}>
          <Text style={styles.webHeading}>A System That Adapts To You</Text>
          <Text style={styles.webBody}>
            AI-driven adaptive learning based on mistakes and speed
          </Text>
          <Text style={styles.webBody}>
            24×7 AI doubt-clearing chat
          </Text>
          <Text style={styles.webBody}>
            Automatic revision and gap-closing without planning stress
          </Text>
          <Text style={[styles.webBody, styles.emphasis]}>
            Feels like a personal mentor — because it behaves like one.
          </Text>
        </View>
        <Image source={{ uri: image }} style={styles.webSideImage} resizeMode="contain" progressiveRenderingEnabled />
      </View>
    </View>
  );
});

const ProFeaturesUnlockMobile = memo(() => {
  return (
    <View style={styles.mobileSection}>
      <View style={styles.mobilePadding}>
  <Text style={styles.mobileHeading}>
    What You Unlock with Paragraph (MBBS NMC-CBME Edition)
  </Text>

  <View style={styles.proFeatureCard}>
    <Text style={styles.proFeatureTitle}>4,577 NMC-Mapped CBME Topics</Text>
    <Text style={styles.proFeatureText}>– Every topic taught from first principles</Text>
    <Text style={styles.proFeatureText}>– Structured exactly as competencies demand</Text>
  </View>

  <View style={styles.proFeatureCard}>
    <Text style={styles.proFeatureTitle}>50,000 Flashcards</Text>
    <Text style={styles.proFeatureText}>– Rapid recall with spaced repetition</Text>
    <Text style={styles.proFeatureText}>– Built directly from CBME concepts</Text>
    <Text style={styles.proFeatureText}>– Long-term retention across 5 MBBS years</Text>
  </View>

  <View style={styles.proFeatureCard}>
    <Text style={styles.proFeatureTitle}>45,770 High-Yield Facts</Text>
    <Text style={styles.proFeatureText}>– Embedded inside concepts</Text>
    <Text style={styles.proFeatureText}>– Strictly exam-relevant, zero fluff</Text>
  </View>

  <View style={styles.proFeatureCard}>
    <Text style={styles.proFeatureTitle}>22,885 Clinical Case Vignettes</Text>
    <Text style={styles.proFeatureText}>– CBME-aligned, bedside-oriented</Text>
    <Text style={styles.proFeatureText}>– Theory translated into clinical reasoning</Text>
  </View>

  <View style={styles.proFeatureCard}>
    <Text style={styles.proFeatureTitle}>22,885 Core MCQs (Adaptive & Recursive)</Text>
    <Text style={styles.proFeatureText}>– Minimum 5 MCQs per topic</Text>
    <Text style={styles.proFeatureText}>– Automatically repeated until gaps close</Text>
  </View>

  <View style={styles.proFeatureCard}>
    <Text style={styles.proFeatureTitle}>22,885 Viva Voce Questions</Text>
    <Text style={styles.proFeatureText}>– University-exam ready answers</Text>
    <Text style={styles.proFeatureText}>– Ward-round & practical focused</Text>
  </View>

  <View style={styles.proFeatureCard}>
    <Text style={styles.proFeatureTitle}>1,505 AI-Guided Study Hours</Text>
    <Text style={styles.proFeatureText}>– Distributed across all 5 MBBS years</Text>
    <Text style={styles.proFeatureText}>– Delivered via AI-planned daily learning objectives</Text>
    <Text style={styles.proFeatureText}>– No overload, no burnout</Text>
  </View>
</View>
    </View>
  );
});

const ProFeaturesUnlockWeb = memo(() => {
  return (
    <View style={styles.webSection}>
      <View style={styles.webTextBlock}>
        <Text style={styles.webHeading}>
          What You Unlock with Paragraph (MBBS NMC-CBME Edition)
        </Text>

        <View style={styles.webProGrid}>
          <View style={styles.webProCard}>
            <Text style={styles.webProCardTitle}>4,577 NMC-Mapped CBME Topics</Text>
            <Text style={styles.webProCardText}>– Every topic taught from first principles</Text>
            <Text style={styles.webProCardText}>– Structured exactly as competencies demand</Text>
          </View>

          <View style={styles.webProCard}>
            <Text style={styles.webProCardTitle}>50,000 Flashcards</Text>
            <Text style={styles.webProCardText}>– Rapid recall with spaced repetition</Text>
            <Text style={styles.webProCardText}>– Built directly from CBME concepts</Text>
            <Text style={styles.webProCardText}>– Long-term retention across 5 MBBS years</Text>
          </View>

          <View style={styles.webProCard}>
            <Text style={styles.webProCardTitle}>45,770 High-Yield Facts</Text>
            <Text style={styles.webProCardText}>– Embedded inside concepts</Text>
            <Text style={styles.webProCardText}>– Strictly exam-relevant, zero fluff</Text>
          </View>

          <View style={styles.webProCard}>
            <Text style={styles.webProCardTitle}>22,885 Clinical Case Vignettes</Text>
            <Text style={styles.webProCardText}>– CBME-aligned, bedside-oriented</Text>
            <Text style={styles.webProCardText}>– Theory translated into clinical reasoning</Text>
          </View>

          <View style={styles.webProCard}>
            <Text style={styles.webProCardTitle}>22,885 Core MCQs (Adaptive & Recursive)</Text>
            <Text style={styles.webProCardText}>– Minimum 5 MCQs per topic</Text>
            <Text style={styles.webProCardText}>– Automatically repeated until gaps close</Text>
          </View>

          <View style={styles.webProCard}>
            <Text style={styles.webProCardTitle}>22,885 Viva Voce Questions</Text>
            <Text style={styles.webProCardText}>– University-exam ready answers</Text>
            <Text style={styles.webProCardText}>– Ward-round & practical focused</Text>
          </View>

          <View style={styles.webProCard}>
            <Text style={styles.webProCardTitle}>1,505 AI-Guided Study Hours</Text>
            <Text style={styles.webProCardText}>– Distributed across all 5 MBBS years</Text>
            <Text style={styles.webProCardText}>
              – Delivered via AI-planned daily learning objectives
            </Text>
            <Text style={styles.webProCardText}>– No overload, no burnout</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const AIPersonalizationMobile = memo(() => {
  return (
    <View style={styles.mobileSection}>
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>AI-Driven, Hyper-Personalised Learning</Text>

        <Text style={styles.mobileBody}>AI tracks:</Text>
        <Text style={styles.mobileBullet}>– Your mistakes</Text>
        <Text style={styles.mobileBullet}>– Your speed</Text>
        <Text style={styles.mobileBullet}>– Your weak subjects</Text>

        <Text style={[styles.mobileBody, { marginTop: 16 }]}>The system automatically:</Text>
        <Text style={styles.mobileBullet}>– Builds your daily study plan</Text>
        <Text style={styles.mobileBullet}>– Pushes only what YOU need today</Text>
        <Text style={styles.mobileBullet}>– Repeats weak areas until fixed</Text>

        <Text style={[styles.mobileBody, styles.emphasis]}>
          Two students. Same syllabus. Completely different daily plans.
        </Text>
      </View>
    </View>
  );
});

const AIPersonalizationWeb = memo(() => {
  return (
    <View style={styles.webSection}>
      <View style={styles.webTextBlock}>
        <Text style={styles.webHeading}>AI-Driven, Hyper-Personalised Learning</Text>

        <View style={styles.webHero}>
          <View style={styles.webTextBlock}>
            <Text style={styles.webSubheading}>AI tracks:</Text>
            <Text style={styles.webBullet}>– Your mistakes</Text>
            <Text style={styles.webBullet}>– Your speed</Text>
            <Text style={styles.webBullet}>– Your weak subjects</Text>
          </View>

          <View style={styles.webTextBlock}>
            <Text style={styles.webSubheading}>The system automatically:</Text>
            <Text style={styles.webBullet}>– Builds your daily study plan</Text>
            <Text style={styles.webBullet}>– Pushes only what YOU need today</Text>
            <Text style={styles.webBullet}>– Repeats weak areas until fixed</Text>
          </View>
        </View>

        <Text style={[styles.webBody, styles.emphasis, { textAlign: 'center', marginTop: 24 }]}>
          Two students. Same syllabus. Completely different daily plans.
        </Text>
      </View>
    </View>
  );
});

const SystemNotFacultyMobile = memo(() => {
  return (
    <View style={styles.mobileSection}>
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>No Faculty Hype. Just a System.</Text>

        <Text style={styles.mobileBody}>No celebrity faculty dependency</Text>
        <Text style={styles.mobileBody}>No one-size-fits-all schedules</Text>
        <Text style={styles.mobileBody}>No marathon lectures</Text>

        <Text style={[styles.mobileBody, { marginTop: 16, fontWeight: '700', color: '#3fb950' }]}>Instead:</Text>
        <Text style={styles.mobileCheck}>✔ System-driven learning</Text>
        <Text style={styles.mobileCheck}>✔ Self-paced momentum</Text>
        <Text style={styles.mobileCheck}>✔ Daily direction and correction</Text>
      </View>
    </View>
  );
});

const SystemNotFacultyWeb = memo(() => {
  return (
    <View style={styles.webSection}>
      <View style={styles.webTextBlock}>
        <Text style={styles.webHeading}>No Faculty Hype. Just a System.</Text>

        <View style={styles.webHero}>
          <View style={styles.webTextBlock}>
            <Text style={styles.webBody}>No celebrity faculty dependency</Text>
            <Text style={styles.webBody}>No one-size-fits-all schedules</Text>
            <Text style={styles.webBody}>No marathon lectures</Text>
          </View>

          <View style={styles.webTextBlock}>
            <Text style={[styles.webBody, { fontWeight: '700', color: '#3fb950' }]}>Instead:</Text>
            <Text style={styles.webCheck}>✔ System-driven learning</Text>
            <Text style={styles.webCheck}>✔ Self-paced momentum</Text>
            <Text style={styles.webCheck}>✔ Daily direction and correction</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const PersonalMentorMobile = memo(() => {
  return (
    <View style={styles.mobileSection}>
      <View style={styles.mobilePadding}>
        <Text style={styles.mobileHeading}>Feels Like a Personal Mentor</Text>

        <Text style={[styles.mobileCheck, { textAlign: 'center' }]}>✔ 24×7 AI doubt-clearing</Text>
        <Text style={[styles.mobileCheck, { textAlign: 'center' }]}>✔ Instant explanations</Text>
        <Text style={[styles.mobileCheck, { textAlign: 'center' }]}>✔ No waiting for faculty</Text>
        <Text style={[styles.mobileCheck, { textAlign: 'center' }]}>✔ No batch dependency</Text>

        <Text style={[styles.mobileBody, styles.emphasis, { marginTop: 16, textAlign: 'center' }]}>
          Reassuring, supportive, personal.
        </Text>
      </View>
    </View>
  );
});

const PersonalMentorWeb = memo(() => {
  return (
    <View style={styles.webSection}>
      <View style={styles.webTextBlock}>
        <Text style={styles.webHeading}>Feels Like a Personal Mentor</Text>

        <View style={styles.webCheckList}>
          <Text style={[styles.webCheck, { textAlign: 'center' }]}>✔ 24×7 AI doubt-clearing</Text>
          <Text style={[styles.webCheck, { textAlign: 'center' }]}>✔ Instant explanations</Text>
          <Text style={[styles.webCheck, { textAlign: 'center' }]}>✔ No waiting for faculty</Text>
          <Text style={[styles.webCheck, { textAlign: 'center' }]}>✔ No batch dependency</Text>
        </View>

        <Text style={[styles.webBody, styles.emphasis, { textAlign: 'center', marginTop: 24 }]}>
          Reassuring, supportive, personal.
        </Text>
      </View>
    </View>
  );
});

const Section9Mobile = memo(({ onOpenAuth, isLoggedIn }) => {
  if (isLoggedIn) return null;

  return (
    <View style={styles.mobileCTASection}>
      <Text style={styles.mobileCTAHeading}>Start Your Journey</Text>
<Text style={styles.mobileCTAText}>
  This is a university-exam–focused MBBS preparation system —
  efficient, adaptive, personalised, unstoppable.
</Text>


      <Pressable
        style={styles.mobileCTAButton}
        onPress={() => onOpenAuth?.("signup")}
      >
        <Text style={styles.mobileCTAButtonText}>Sign Up Now</Text>
      </Pressable>
    </View>
  );
});

const Section9Web = memo(({ onOpenAuth, isLoggedIn }) => {
  if (isLoggedIn) return null;

  return (
    <View style={styles.webCTASection}>
      <View style={styles.webCTAContent}>
        <Text style={styles.webCTAHeading}>Start Your Journey</Text>

        <Pressable
          style={styles.webCTAButton}
          onPress={() => onOpenAuth?.("signup")}
        >
          <Text style={styles.webCTAButtonText}>Sign Up Now</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  mobileContent: {
    paddingBottom: 40,
  },
  webContent: {
    paddingBottom: 80,
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
  bold: {
    fontWeight: '700',
    color: '#fbbf24',
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
  doubtBox: {
    backgroundColor: '#1c2128',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  doubtText: {
    fontSize: 15,
    color: '#8b949e',
    lineHeight: 22,
    marginBottom: 6,
    fontStyle: 'italic',
  },
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
    lineHeight: 26,
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
  webCheckList: {
    marginVertical: 16,
  },
  webCheck: {
    fontSize: 18,
    color: '#3fb950',
    lineHeight: 28,
    marginBottom: 10,
  },
  webFeatureGrid: {
    marginVertical: 24,
  },
  webFeature: {
    backgroundColor: '#1c2128',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  webFeatureTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 8,
  },
  webFeatureText: {
    fontSize: 16,
    color: '#c9d1d9',
    lineHeight: 24,
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
  webDoubtBox: {
    backgroundColor: '#1c2128',
    padding: 24,
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  webDoubtText: {
    fontSize: 17,
    color: '#8b949e',
    lineHeight: 26,
    marginBottom: 8,
    fontStyle: 'italic',
  },
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

  proFeatureCard: {
    backgroundColor: '#1c2128',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  proFeatureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 8,
  },
  proFeatureText: {
    fontSize: 15,
    color: '#c9d1d9',
    lineHeight: 22,
    marginBottom: 4,
  },

  webProGrid: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  webProCard: {
    backgroundColor: '#1c2128',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    minWidth: 300,
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  webProCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 12,
  },
  webProCardText: {
    fontSize: 17,
    color: '#c9d1d9',
    lineHeight: 26,
    marginBottom: 6,
  },
  webProCardCentered: {
    width: '48%',
    maxWidth: '48%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  centeredText: {
    textAlign: 'center',
  },
});
