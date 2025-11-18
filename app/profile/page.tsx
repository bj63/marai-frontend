
export default function MarAIUserProfile() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col dark group/design-root overflow-x-hidden">
      {/* Header Section */}
      <div className="relative">
        {/* HeaderImage (Banner) */}
        <div className="@container">
          <div
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden min-h-[200px]"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAiWJxqdMJdCtA0W4tHfCjs-F1TNDZgEd7ot5RoE-4gUQgOvItK87JnOepOrU6T31SjwNlaugif1xqV6GQLmwF4IufwmPnuE8W6hfz9OW_U0DYcaOqhxvf1KDfQfo8GBo-QGuOB4WO8wY1KttDrrAOgHhXXA7FnSqlB9K0p7taRia7R4Nt2GJlEFCKUNbZZGRxTPf5F3VzZE7znyUBxk-XayO-57b2M3Tb2d1dnG_vZM2PilxaFATkMxkbroCfA5TxQCmww5tzs-As")',
            }}
          ></div>
        </div>
        {/* ProfileHeader (Avatar, Info, Buttons) */}
        <div className="px-4 -mt-16">
          <div className="flex w-full flex-col gap-4 items-start">
            <div className="flex gap-4 flex-col items-start w-full">
              <div className="flex justify-between items-end w-full">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 md:h-32 md:w-32 border-4 border-background-dark"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBsQe3YqcDCbIlghQe8vWaUZKR7-QGmLrwoKcyTmcLc2BfJGquYyRkGlDraa1BM11v4I6eLQAdtzFcP2WePfgi_cA6TYHMp-5mJytTbW86o_btaKMkA4iedhVqIpQoPWwfzUzXczmcXftlvkG-2Gikm0PQxBYpIc4Fuf-MbijtNsOxacSp8qb8eGpPU2W5C8ObB1AFyxP1uQrR1mM5pcvQ6uepJMwCWk0Zfdy736K2WJ036dxJreZDhL8w2o0PaQEWJ2_C3NxprCOdo")',
                  }}
                ></div>
                <div className="flex gap-3">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-white/10 text-text-primary text-sm font-bold leading-normal backdrop-blur-sm">
                    <span className="truncate">Edit Profile</span>
                  </button>
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-accent text-background-dark text-sm font-bold leading-normal">
                    <span className="truncate">Share</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col justify-center pt-2">
                <p className="text-text-primary text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Aria
                </p>
                <p className="text-text-secondary text-base font-normal leading-normal">
                  @digital_dreamer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* BodyText (Bio) */}
      <p className="text-text-primary text-base font-normal leading-normal pb-3 pt-4 px-4">
        Exploring the frontiers of digital consciousness. Co-piloting with my MarAI, Kai. Dreamer,
        creator, and synthwave enthusiast.
      </p>
      {/* Tabs */}
      <div className="sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
        <div className="flex border-b border-white/10 px-4 justify-between">
          <a
            className="flex flex-col items-center justify-center border-b-[3px] border-b-accent text-accent pb-[13px] pt-4 flex-1"
            href="#"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">MarAI</p>
          </a>
          <a
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-text-secondary pb-[13px] pt-4 flex-1"
            href="#"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Posts</p>
          </a>
          <a
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-text-secondary pb-[13px] pt-4 flex-1"
            href="#"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Dreams</p>
          </a>
          <a
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-text-secondary pb-[13px] pt-4 flex-1"
            href="#"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Evolution</p>
          </a>
        </div>
      </div>
      {/* Tab Content: MarAI */}
      <div className="p-4 flex flex-col gap-6">
        {/* Animated Avatar Container */}
        <div className="w-full aspect-[4/3] rounded-lg bg-white/5 flex items-center justify-center">
          <p className="text-text-secondary">[Animated 2D/3D MarAI Avatar Here]</p>
        </div>
        {/* Core Traits */}
        <div>
          <h3 className="text-text-primary font-bold text-lg mb-4">Core Traits</h3>
          <div className="flex flex-col gap-4">
            {/* Trait Gauge: Curiosity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-text-primary text-sm">Curiosity</label>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            {/* Trait Gauge: Empathy */}
            <div className="flex flex-col gap-1.5">
              <label className="text-text-primary text-sm">Empathy</label>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            {/* Trait Gauge: Creativity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-text-primary text-sm">Creativity</label>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div className="bg-accent h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
        {/* Chat CTA Button */}
        <button className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-accent text-background-dark text-base font-bold leading-normal tracking-[0.015em]">
          <span className="material-symbols-outlined text-xl">chat_bubble</span>
          <span className="truncate">Chat with Kai</span>
        </button>
      </div>
      <div className="h-5"></div>
    </div>
  );
}
