"use client";

export default function TeamBusinessPage() {

  const teamMembers = [
    {
      name: "Rahul",
      business: 12000
    },

    {
      name: "Aman",
      business: 8500
    },

    {
      name: "Sonia",
      business: 15400
    }
  ];

  const totalBusiness =
    teamMembers.reduce(
      (total, member) =>
        total + member.business,
      0
    );

  return (

    <main className="min-h-screen bg-slate-100 p-4">

      <h1 className="mb-5 text-3xl font-black">
        Team Business
      </h1>

      <div
        className="
          mb-5
          rounded-3xl
          bg-gradient-to-r
          from-violet-600
          to-fuchsia-500
          p-6
          text-[var(--button-text-color)]
        "
      >

        <p className="text-sm">
          Total Team Business
        </p>

        <h2 className="mt-2 text-4xl font-black">

          ₹{totalBusiness}

        </h2>

      </div>

      <div className="space-y-4">

        {teamMembers.map((member, index) => (

          <div
            key={index}
            className="
              rounded-3xl
              bg-[var(--card-color)]
              p-5
              shadow-sm
            "
          >

            <div className="flex items-center justify-between">

              <h2 className="font-black">
                {member.name}
              </h2>

              <p className="text-lg font-black text-purple-600">

                ₹{member.business}

              </p>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}
