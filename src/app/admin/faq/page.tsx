"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  HelpCircle,
  Plus,
  Trash2,
  ChevronDown
} from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQPage() {

  const [faqs, setFaqs] =
    useState<FAQItem[]>([
      {
        id: 1,
        question:
          "How to place an order?",
        answer:
          "Select products and proceed to checkout."
      },
      {
        id: 2,
        question:
          "How to join affiliate program?",
        answer:
          "Create account and activate affiliate option."
      }
    ]);

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  function addFAQ() {

    if (
      !question ||
      !answer
    ) {
      return;
    }

    const newFAQ = {
      id: Date.now(),
      question,
      answer
    };

    setFaqs((prev) => [
      newFAQ,
      ...prev
    ]);

    setQuestion("");
    setAnswer("");
  }

  function deleteFAQ(
    id: number
  ) {

    setFaqs((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

          <HelpCircle size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            FAQ Manager
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage frequently asked questions
          </p>

        </div>

      </div>

      {/* CREATE FAQ */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <h2 className="text-2xl font-black">
          Add FAQ
        </h2>

        <div className="mt-5 space-y-4">

          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

          <textarea
            placeholder="Answer"
            value={answer}
            onChange={(e) =>
              setAnswer(
                e.target.value
              )
            }
            className="h-32 w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

          <button
            onClick={addFAQ}
            className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold"
          >

            <Plus size={18} />

            Add FAQ

          </button>

        </div>

      </div>

      {/* FAQ LIST */}

      <div className="mt-6 space-y-5">

        {faqs.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex-1">

                  <div className="flex items-center gap-3">

                    <ChevronDown
                      size={20}
                      className="text-cyan-400"
                    />

                    <h2 className="text-xl font-black">
                      {item.question}
                    </h2>

                  </div>

                  <p className="mt-4 text-sm text-gray-400">
                    {item.answer}
                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteFAQ(
                      item.id
                    )
                  }
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500"
                >

                  <Trash2 size={22} />

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-500 p-6">

        <h2 className="text-3xl font-black">
          FAQ System
        </h2>

        <p className="mt-2 text-white/80">
          Help customers with common questions
        </p>

      </div>

    </main>

  );
}
