export const metadata = {
  title: "Terms & Conditions",
  description: "Terms governing use of Jembee Shorts.",
};

export default function TermsConditionsPage() {
  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <article className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">Terms & Conditions</h1>
        <p className="mb-8 text-sm opacity-70">Last updated: November 7, 2026</p>
        <div className="space-y-6 leading-7">
          <section><h2 className="text-xl font-semibold">1. Acceptance</h2>
            <p>By accessing Jembee Shorts, you agree to these terms and applicable laws. If you do not agree, do not use the service.</p></section>
          <section><h2 className="text-xl font-semibold">2. Accounts</h2>
            <p>You are responsible for keeping your account credentials secure and for activity carried out through your account. Provide accurate information and notify us if you suspect unauthorized access.</p></section>
          <section><h2 className="text-xl font-semibold">3. User content and rights</h2>
            <p>You must own or have permission to upload, publish, or share content. You retain rights you hold in your content and grant the platform only the permissions reasonably needed to host, display, and distribute it as part of the service.</p></section>
          <section><h2 className="text-xl font-semibold">4. Prohibited conduct</h2>
            <p>Do not upload unlawful, infringing, deceptive, hateful, harassing, sexually exploitative, or otherwise harmful material. Do not manipulate views, clicks, advertisements, or platform systems; distribute malware; impersonate others; or interfere with the service.</p></section>
          <section><h2 className="text-xl font-semibold">5. Moderation and reports</h2>
            <p>We may review reports, remove or restrict content, and suspend accounts when reasonably necessary to enforce these terms, protect users, or comply with law. Contact us with the content link and details of a concern.</p></section>
          <section><h2 className="text-xl font-semibold">6. Advertising</h2>
            <p>The service may display advertisements from third-party providers. Ad availability and placement may vary. Users must not click advertisements to support the platform or engage in invalid traffic.</p></section>
          <section><h2 className="text-xl font-semibold">7. Availability and changes</h2>
            <p>Features may change, be interrupted, or be discontinued. We do not guarantee uninterrupted or error-free operation.</p></section>
          <section><h2 className="text-xl font-semibold">8. Contact</h2>
            <p>Questions about these terms can be sent to <a className="underline" href="mailto:jembeekart@gmail.com">jembeekart@gmail.com</a>.</p></section>
        </div>
      </article>
    </main>
  );
}
