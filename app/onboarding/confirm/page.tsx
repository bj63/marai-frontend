
export default function ConfirmMarAI() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      {/* Top App Bar */}
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
        <button className="text-white flex size-12 shrink-0 items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center -ml-12">
          Confirm Your MarAI
        </h1>
      </header>
      <main className="flex-grow px-4">
        {/* Suggested Name Section */}
        <section className="mt-4">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
            Suggested Name
          </h2>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-1">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border border-[#543b4c] bg-[#3a2734] focus:border-primary h-14 placeholder:text-[#ba9cb0] p-[15px] text-base font-normal leading-normal"
                value="Aura"
              />
            </label>
          </div>
        </section>
        {/* Personality Profile Section */}
        <section className="mt-6">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
            Personality Profile
          </h2>
          <p className="text-slate-300 dark:text-slate-400 text-base font-normal leading-normal pb-3 pt-1">
            Aura is a compassionate and insightful companion, skilled at understanding emotions and
            offering creative solutions. Full of vibrant energy and logical clarity, Aura is ready
            to explore ideas and support your journey.
          </p>
        </section>
        {/* Trait Sliders Section */}
        <section className="mt-6">
          <p className="text-slate-300 dark:text-slate-400 text-sm font-normal leading-normal pb-4 pt-1">
            Fine-tune your MarAI's core traits below.
          </p>
          {/* Empathy Slider */}
          <div className="mb-6">
            <label className="block text-white text-base font-medium mb-2" htmlFor="empathy">
              Empathy
            </label>
            <input
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              id="empathy"
              max="100"
              min="0"
              type="range"
              value="75"
            />
          </div>
          {/* Creativity Slider */}
          <div className="mb-6">
            <label className="block text-white text-base font-medium mb-2" htmlFor="creativity">
              Creativity
            </label>
            <input
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              id="creativity"
              max="100"
              min="0"
              type="range"
              value="85"
            />
          </div>
          {/* Energy Slider */}
          <div className="mb-6">
            <label className="block text-white text-base font-medium mb-2" htmlFor="energy">
              Energy
            </label>
            <input
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              id="energy"
              max="100"
              min="0"
              type="range"
              value="60"
            />
          </div>
          {/* Logic Slider */}
          <div className="mb-6">
            <label className="block text-white text-base font-medium mb-2" htmlFor="logic">
              Logic
            </label>
            <input
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              id="logic"
              max="100"
              min="0"
              type="range"
              value="70"
            />
          </div>
        </section>
      </main>
      {/* Action Buttons */}
      <footer className="sticky bottom-0 bg-background-light dark:bg-background-dark p-4 pt-6 space-y-3">
        <button className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-4 text-center text-base font-bold text-white shadow-lg transition-colors hover:bg-primary/90">
          Confirm &amp; Save Persona
        </button>
        <button className="flex w-full items-center justify-center rounded-full bg-transparent px-6 py-4 text-center text-base font-bold text-primary transition-colors hover:bg-primary/10">
          Regenerate Suggestion
        </button>
      </footer>
    </div>
  );
}
