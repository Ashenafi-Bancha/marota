function PrivacyPolicy() {
  const updatedOn = "February 23, 2026";

  return (
    <main className="min-h-[65vh] px-6 py-16">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 shadow-[0_20px_55px_rgba(2,6,23,0.35)] backdrop-blur-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Legal</p>
        <h1 className="mb-5 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-8 text-xs text-slate-400">Last updated: {updatedOn}</p>

        <div className="space-y-8 text-sm leading-7 text-slate-300">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">1. Scope</h2>
            <p>
              This Privacy Policy explains how Marota Film &amp; Software College collects, uses, stores, and protects personal data when you use
              our website, submit applications, enroll in courses, or interact with our academic services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">2. Information We Collect</h2>
            <ul className="list-disc space-y-2 pl-5 marker:text-slate-500">
              <li>Identity and contact details such as full name, email address, phone number, and city.</li>
              <li>Admissions and enrollment data, including course interests, educational background, and submitted documents.</li>
              <li>Learning activity data such as course progress, attendance, assessments, and completion status.</li>
              <li>Technical data including IP address, browser type, pages visited, and device information.</li>
              <li>Communication records when you contact admissions, support, or administrative teams.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">3. How We Use Your Information</h2>
            <ul className="list-disc space-y-2 pl-5 marker:text-slate-500">
              <li>To process admissions, registration, and course enrollment.</li>
              <li>To deliver learning content, assessments, and academic support.</li>
              <li>To provide service updates, policy notices, and important academic communication.</li>
              <li>To improve website performance, content quality, and user experience.</li>
              <li>To protect platform security and prevent misuse or unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to keep sessions active, remember preferences, and measure website performance.
              You can manage or disable cookies in your browser settings, but some features may not function properly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">5. Sharing and Disclosure</h2>
            <p>
              We do not sell personal data. Information may be shared only when necessary for secure service delivery, legal compliance,
              or academic operations with trusted providers under appropriate confidentiality controls.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">6. Data Retention</h2>
            <p>
              We retain personal data for as long as needed to fulfill educational, administrative, legal, and operational obligations.
              When retention is no longer required, data is deleted, anonymized, or securely archived according to institutional policy.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">7. Your Rights</h2>
            <ul className="list-disc space-y-2 pl-5 marker:text-slate-500">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete personal data.</li>
              <li>Request deletion of data where lawful and operationally feasible.</li>
              <li>Object to or request restriction of certain processing activities.</li>
              <li>Request clarification about how your personal information is used.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">8. Data Security</h2>
            <p>
              We apply reasonable technical and organizational safeguards to protect personal data against unauthorized access,
              alteration, loss, or misuse. No online system is fully risk-free, and users should also protect their account credentials.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">9. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be reflected on this page with a revised "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">10. Contact Us</h2>
            <p>
              For privacy questions, requests, or concerns, contact our admissions and support team via the contact section on this website.
              Please include your full name and enough detail for us to process your request efficiently.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
