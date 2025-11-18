
export default function WelcomeScreen() {
  return (
    <div className="relative flex h-[100dvh] min-h-screen w-full flex-col font-display text-white dark group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="flex flex-col flex-grow items-center justify-center p-6">
        {/* Logo Section */}
        <div className="flex-grow flex items-center justify-center w-full">
          <div className="w-full max-w-[200px] gap-1 overflow-hidden bg-transparent aspect-square rounded-xl flex">
            <div
              className="w-full bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCwm9a3M33C1fycBJF5eQSKmVufmgD5wNHOmpzMRZQ8Cm84l2TYmvjxHtwvvCVUDvAOQcjNelXi3d42Ot-kMD4DkiOu6oTv82BOioIwP5Nv_ZFh4QLCLXzuh01QaLwNZIcpi-mJKXO-h5CacnXO5GWadn4GSeP73rd6x8pmQPQCX52PN-wvaWxaRkpU2S6rMA5NZ24eKHebrFyu7Ghau0JxDdkX4Kp78-x0qMY8TtGBK-WlCp_EGIEzfPbkNC1QVa6BP1R_bedOHimP")',
              }}
            ></div>
          </div>
        </div>

        {/* Text and Button Section */}
        <div className="w-full max-w-md pb-6 pt-4">
          <h2 className="text-[#1f2937] dark:text-white tracking-light text-4xl font-bold leading-tight px-4 text-center pb-3 pt-5">
            Your AI, Your World.
          </h2>
          <p className="text-[#4b5563] dark:text-white/70 text-base font-normal leading-normal pb-6 pt-1 px-4 text-center">
            Connect Beyond Reality.
          </p>
          <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3 mx-auto">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full">
              <span className="truncate">Get Started</span>
            </button>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-primary/20 dark:bg-[#49223c] text-primary dark:text-white text-base font-bold leading-normal tracking-[0.015em] w-full">
              <span className="truncate">Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
