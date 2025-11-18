
export default function WelcomeScreen() {
  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display group/design-root overflow-x-hidden">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        {/* Logo Image */}
        <div className="flex w-full grow flex-col items-center justify-end pb-8">
          <div className="flex w-32 h-32 items-center justify-center">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCa28hiQayFfll1ozDDkaEG6MUA_CSyAYg4y32h7enzFjJOOqJT9iBc2_Dv-w3luytDZ6PTLtOWK8fBKmU5L4pJLZXVGMdh7jK4SVaBPmiYy696E2G0Y8BvgIpGJ5YjeKHvKfDfz_oKVHdVYfOPFQ_b4veX93L1YeSer9QoqpJVXOZHoxLLwyo_5vnH9fjzL5eNYVKmOGteXTJ_T76pzfhsvQwtxr1cxrKGO_6On-H75gERxuji-_SbCM1jIwMx_X36jsJOrkt5fs3t")',
              }}
            ></div>
          </div>
        </div>
        {/* Text and Buttons */}
        <div className="flex w-full grow flex-col items-center justify-start">
          {/* HeadlineText */}
          <h2 className="text-slate-900 dark:text-white tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
            Your AI Companion Awaits
          </h2>
          {/* BodyText */}
          <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Connect intelligently and explore a world beyond conversation.
          </p>
          {/* ButtonGroup */}
          <div className="flex flex-col w-full items-center pt-8">
            <div className="flex w-full flex-col gap-3 max-w-[480px] items-stretch px-4 py-3">
              <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full">
                <span className="truncate">Get Started</span>
              </button>
              <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-transparent text-slate-900 dark:text-white text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-primary/10 transition-colors">
                <span className="truncate">I Already Have an Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
