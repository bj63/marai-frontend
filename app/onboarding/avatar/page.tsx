
export default function CreateAvatarScreen() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Top App Bar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
        <div className="text-white flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-zinc-100">arrow_back</span>
        </div>
        <h2 className="text-zinc-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Create Your Avatar
        </h2>
        <div className="flex w-12 items-center justify-end">
          <p className="text-primary/80 text-base font-bold leading-normal tracking-[0.015em] shrink-0">
            Skip
          </p>
        </div>
      </div>
      {/* Avatar Preview Pane */}
      <div className="px-4 py-3">
        <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-center items-center overflow-hidden bg-zinc-900/50 rounded-lg min-h-80 aspect-square">
          {/* Loading State */}
          <div className="flex flex-col items-center justify-center text-center text-zinc-300 gap-4">
            <svg
              className="animate-spin h-10 w-10 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              ></path>
            </svg>
            <p className="font-medium">Generating your masterpiece...</p>
          </div>
        </div>
      </div>
      {/* Headline 1 */}
      <h3 className="text-zinc-100 tracking-light text-2xl font-bold leading-tight px-4 text-left pb-2 pt-5">
        1. Upload a Photo
      </h3>
      {/* List Item for Upload */}
      <div className="flex items-center gap-4 bg-background-light dark:bg-background-dark px-4 min-h-14 justify-between border-b border-zinc-100/10 py-2">
        <div className="flex items-center gap-4">
          <div className="text-zinc-100 flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
            <span className="material-symbols-outlined">add_photo_alternate</span>
          </div>
          <p className="text-zinc-100 text-base font-normal leading-normal flex-1 truncate">
            Upload a clear, front-facing photo
          </p>
        </div>
        <div className="shrink-0">
          <div className="text-zinc-100 flex size-7 items-center justify-center">
            <span className="material-symbols-outlined">chevron_right</span>
          </div>
        </div>
      </div>
      {/* Headline 2 */}
      <h3 className="text-zinc-100 tracking-light text-2xl font-bold leading-tight px-4 text-left pb-2 pt-5">
        2. Choose your style
      </h3>
      {/* Style Selector */}
      <div className="px-4 py-2">
        <div className="relative">
          <select className="w-full appearance-none bg-zinc-900/50 border border-zinc-100/10 text-zinc-100 text-base rounded-lg focus:ring-primary focus:border-primary block p-3.5 pr-10">
            <option selected>Anime</option>
            <option value="pastel">Pastel</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="mascot">Mascot</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>
      {/* Spacer */}
      <div className="flex-grow"></div>
      {/* Primary CTA Button */}
      <div className="p-4 pt-6">
        <button
          className="w-full bg-primary text-zinc-100 font-bold py-4 px-4 rounded-lg text-lg hover:bg-primary/90 transition-colors duration-200 disabled:bg-zinc-600 disabled:text-zinc-400"
          type="button"
        >
          Generate Avatar
        </button>
      </div>
    </div>
  );
}
