export const FabricLoomLayout = () => {
  // Array of 23 slots as seen in the image (xxx, 21 times 231, then xxx)
  const slots = ['', ...Array(22).fill('231'), '']

  return (
    <div className="w-full rounded-xl border border-zinc-300 bg-zinc-200 p-10 shadow-sm">
      <div className="relative flex">
        {/* Main horizontal center line */}
        <div className="absolute top-1/2 z-10 h-0.5 w-full -translate-y-1/2 bg-black" />

        {slots.map((label, index) => (
          <div
            key={index}
            className={`group relative flex h-32 flex-1 items-center justify-center border-red-600 ${
              index !== 0 ? 'border-l' : ''
            }`}
          >
            {/* Slot label (e.g., xxx or 231) positioned near the center line */}
            <span className="relative z-20 -translate-y-2 px-1 text-[11px] font-semibold text-zinc-800">
              {label}
            </span>

            {/* Line Index Label (e.g., L1, L2, ...) centered under each red line */}
            {index !== 0 && (
              <div className="absolute -bottom-8 left-0 -translate-x-1/2 text-[11px] font-bold text-zinc-700">
                L{index}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
