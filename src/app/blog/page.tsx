import type { Metadata } from "next";
import { getPublishedBlogs } from "@/lib/content/blogService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest articles, shopping tips, updates and useful information from JembeeKart.",
};

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <h1 className="text-3xl font-bold md:text-4xl">
          JembeeKart Blog
        </h1>

        <p className="mt-4 max-w-3xl leading-7 opacity-80">
          Read useful articles, shopping information, product updates and
          helpful tips from JembeeKart.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.length === 0 ? (
            <div className="rounded-2xl bg-[var(--card-color)] p-6 md:col-span-2 lg:col-span-3">
              <h2 className="text-xl font-bold">
                Articles are coming soon
              </h2>
              <p className="mt-2 leading-7 opacity-70">
                We are currently preparing useful articles and updates for
                JembeeKart customers.
              </p>
            </div>
          ) : (
            blogs.map((blog) => (
              <article
                key={blog.id}
                className="overflow-hidden rounded-2xl bg-[var(--card-color)]"
              >
                {blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="h-48 w-full object-cover"
                  />
                ) : null}

                <div className="p-5">
                  <h2 className="text-xl font-bold">
                    {blog.title}
                  </h2>

                  {blog.description ? (
                    <p className="mt-3 leading-7 opacity-80">
                      {blog.description}
                    </p>
                  ) : null}

                  {blog.author ? (
                    <p className="mt-4 text-sm opacity-60">
                      By {blog.author}
                    </p>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
