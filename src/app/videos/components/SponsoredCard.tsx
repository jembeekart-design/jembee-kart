export default function SponsoredCard() {
  return (
    <aside
      aria-label="Sponsored video placement"
      className="flex h-full w-full flex-col items-center justify-center bg-black p-6 text-center text-white"
    >
      <div className="mb-6 rounded-full bg-white/10 p-4 text-cyan-300" aria-hidden="true">
        <span className="text-4xl">▶</span>
      </div>
      <h2 className="mb-2 text-3xl font-black">JEMBEE PLAY</h2>
      <p className="mb-2 text-lg">Sponsored video placement</p>
      <p className="max-w-xs text-sm text-white/60">
        Advertising appears only in placements enabled by the platform administrator and permitted by the selected ad network.
      </p>
    </aside>
  );
}
