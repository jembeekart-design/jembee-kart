export const metadata = {
  title: "Contact Us",
  description: "Contact the Jembee Shorts team for support, privacy questions, and content concerns.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Contact Us</h1>
        <div className="space-y-5 leading-7">
          <p>
            We welcome questions, feedback, support requests, privacy requests,
            and reports about content that may violate our rules or someone else's rights.
          </p>
          <section>
            <h2 className="text-xl font-semibold">Email support</h2>
            <p>
              Email: <a className="underline" href="mailto:jembeekart@gmail.com">jembeekart@gmail.com</a>
            </p>
            <p>When reporting a video, include its link and a short explanation so we can identify it.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Privacy and account requests</h2>
            <p>
              Use the same email address to ask about personal information,
              account access, correction, or deletion. Do not send passwords
              or payment card details by email.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
