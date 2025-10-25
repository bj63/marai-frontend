import ProfileSidebar from '@/components/ProfileSidebar'
import MarketplaceGrid from '@/components/MarketplaceGrid'

export default function Home() {
  return (
    <main className="max-w-[1400px] mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <ProfileSidebar />
        <section className="flex-1 glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Marketplace</h2>
          </div>
          <div className="mt-4">
            <MarketplaceGrid />
          </div>
        </section>
      </div>
    </main>
  )
}
