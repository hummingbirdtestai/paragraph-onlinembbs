// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { AuthProvider } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet";
import "./global.css";

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      {/* ✅ Global Head (SEO + SDKs) */}
      <Helmet>
        {/* 🧠 PRIMARY SEO SIGNAL — THIS CONTROLS GOOGLE */}
        <title>
          AI-Powered MBBS UHS University PYQ Question Bank | MBBSClass
        </title>

        <meta
          name="description"
          content="AI-powered MBBS university exam preparation platform built on UHS MBBS past year questions (PYQs), CBME-aligned concepts, clinical case-based answers, and structured revision for Indian medical universities."
        />

        <meta name="robots" content="index, follow" />

        {/* 📘 Optional but powerful for Google AI Overview */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "MBBSClass",
            "description": "AI-powered MBBS UHS university exam preparation platform using past year questions and CBME-aligned learning.",
            "educationalLevel": "Undergraduate Medical",
            "teaches": [
              "MBBS University Exams",
              "UHS MBBS PYQs",
              "CBME Curriculum",
              "Clinical Case-Based Learning"
            ]
          }
          `}
        </script>

        {/* 💳 Cashfree SDK — LEAVE EXACTLY AS IS */}
        <script
          id="cashfree-sdk"
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          type="text/javascript"
        />
      </Helmet>

      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="about" />
          <Stack.Screen name="help" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </AuthProvider>
    </>
  );
}
