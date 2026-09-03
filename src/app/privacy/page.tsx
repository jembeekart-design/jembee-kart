export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">
          Privacy Policy
        </h1>

        <p className="mb-8 text-sm opacity-70">
          Last updated: September 3, 2026
        </p>

        <div className="space-y-7 leading-7">
          <section>
            <h2 className="mb-2 text-xl font-semibold">1. Introduction</h2>
            <p>
              JembeeKart respects your privacy and is committed to protecting
              the personal information you provide while using our services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              2. Information We Collect
            </h2>
            <p>
              We may collect information necessary to provide and secure our
              services, including account information, profile information,
              transaction information, uploaded content, and technical
              information required for authentication and service operation.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              3. Google Account and Drive Access
            </h2>
            <p>
              If you authorize a Google integration, JembeeKart may request
              access to the Google Drive resources necessary for the specific
              feature you authorize. Access is used only for the purposes
              described during authorization and is not used to access
              unrelated personal files.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              4. How We Use Information
            </h2>
            <p>
              Information may be used to provide and improve JembeeKart,
              authenticate users, process transactions, moderate uploaded
              content, maintain security, prevent abuse, and provide customer
              support.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              5. Data Sharing
            </h2>
            <p>
              We do not sell your personal information. Information may be
              shared with service providers when necessary to operate,
              secure, or improve JembeeKart and to comply with applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">6. Data Security</h2>
            <p>
              We use reasonable technical and organizational measures to
              protect information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              7. Data Retention and Deletion
            </h2>
            <p>
              We retain information only for as long as reasonably necessary
              for the purposes described in this policy, legal obligations,
              security, dispute resolution, and legitimate business needs.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">
              8. Your Choices and Rights
            </h2>
            <p>
              Depending on applicable law, you may have rights concerning your
              personal information, including access, correction, deletion,
              and withdrawal of certain permissions.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold">9. Contact Us</h2>
            <p>
              For privacy-related questions or requests, contact us at
              <a
                href="mailto:jembeekart@gmail.com"
                className="ml-1 underline"
              >
                jembeekart@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
