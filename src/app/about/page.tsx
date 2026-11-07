export const metadata = {
  title: "About Us",
  description: "Learn about Jembee Shorts, a short-form video and entertainment platform.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">About Jembee Shorts</h1>
        <p className="mb-6 text-sm opacity-70">A short-form video and entertainment platform</p>
        <div className="space-y-5 leading-7">
          <p>
            Jembee Shorts is a digital platform designed to help people discover,
            watch, and share short-form video content. Our aim is to provide a
            simple viewing experience across supported web and mobile devices.
          </p>
          <h2 className="text-xl font-semibold">What you can do</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Browse and watch short-form videos.</li>
            <li>Create an account where registration features are available.</li>
            <li>Share links to content and discover creators.</li>
          </ul>
          <h2 className="text-xl font-semibold">Community and content</h2>
          <p>
            We expect users to share content they own or are authorized to use.
            Content that is unlawful, deceptive, abusive, or infringes another
            person's rights is not permitted. We may review reports and restrict
            content or accounts that violate our rules.
          </p>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            For general questions, feedback, or content concerns, email
            {" "}<a className="underline" href="mailto:jembeekart@gmail.com">jembeekart@gmail.com</a>.
          </p>
        </div>
      </article>
    </main>
  );
}
