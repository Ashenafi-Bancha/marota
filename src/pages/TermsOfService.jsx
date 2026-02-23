function TermsOfService() {
  const updatedOn = "February 23, 2026";

  return (
    <main className="min-h-[65vh] px-6 py-16">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 shadow-[0_20px_55px_rgba(2,6,23,0.35)] backdrop-blur-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Legal</p>
        <h1 className="mb-5 text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mb-8 text-xs text-slate-400">Last updated: {updatedOn}</p>

        <div className="space-y-8 text-sm leading-7 text-slate-300">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using this website and any related services of Marota Film &amp; Software College,
              you agree to be bound by these Terms of Service and all applicable policies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">2. Eligibility and Account Responsibility</h2>
            <ul className="list-disc space-y-2 pl-5 marker:text-slate-500">
              <li>You must provide accurate, complete, and current registration details.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for activities conducted through your account unless unauthorized access is reported promptly.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">3. Academic and Service Use</h2>
            <ul className="list-disc space-y-2 pl-5 marker:text-slate-500">
              <li>Use learning resources lawfully and in accordance with institutional standards.</li>
              <li>Do not disrupt classes, assessments, platform operations, or community conduct.</li>
              <li>Do not attempt unauthorized access to restricted systems, content, or user accounts.</li>
              <li>Certificates and completion status are subject to attendance, assessments, and academic requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">4. Fees, Payments, and Enrollment</h2>
            <p>
              Course fees, enrollment terms, and payment schedules are communicated through official admissions channels.
              Access to certain services may depend on successful payment and compliance with enrollment rules.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">5. Intellectual Property</h2>
            <p>
              Course materials, branding, website content, videos, designs, and software content are protected by intellectual property rights.
              You may use them only for authorized educational purposes and may not copy, resell, redistribute, or publish them without permission.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">6. Privacy and Data Use</h2>
            <p>
              Your use of services is also governed by our Privacy Policy, which explains how personal information is collected,
              processed, stored, and protected.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">7. Suspension or Termination</h2>
            <p>
              We may suspend or terminate access to any account or service for policy violations, misuse, non-payment,
              or conduct that harms users, staff, systems, or institutional integrity.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">8. Disclaimers and Limitation of Liability</h2>
            <p>
              Services are provided on an "as available" basis. While we strive for quality and availability,
              we do not guarantee uninterrupted access at all times. To the extent permitted by law,
              Marota is not liable for indirect or consequential losses resulting from service use.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">9. Changes to Terms</h2>
            <p>
              We may revise these Terms of Service periodically. Updated versions will be posted on this page with a revised "Last updated" date.
              Continued use of services after updates means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-white">10. Contact Details</h2>
            <p>
              For questions about these terms, enrollment conditions, or account issues, contact admissions or student support
              through the website contact section.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

export default TermsOfService;
