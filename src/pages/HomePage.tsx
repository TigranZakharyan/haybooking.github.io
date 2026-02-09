import Lottie from 'react-lottie'
import hiringLottie from '@/assets/lottie/hiring.json'
import seekingJobLottie from '@/assets/lottie/seekingJob.json'
import { Button } from '@/components'

export function HomePage() {
  return (
    <div className="h-full relative flex items-center justify-center px-4">
      {/* background */}
      <div className="fixed inset-0 -z-10 bg-linear-[90deg,var(--color-white)_50%,var(--color-primary)_50%]" />

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {/* LEFT CARD */}
        <section className="bg-secondary w-full max-w-md p-8 sm:p-12 lg:p-16 rounded-3xl flex flex-col items-center text-center">
          <h2 className="text-white uppercase font-bold mb-4">
            I'm here for hiring
          </h2>

          <div className="w-56 sm:w-64 md:w-72">
            <Lottie options={{ animationData: hiringLottie }} />
          </div>

          <Button
            size="large"
            className="mt-6 text-secondary shadow-[4px_4px_10px_rgba(0,0,0,0.2)]"
          >
            Find Services
          </Button>
        </section>

        {/* CENTER LOGO */}
        <div className="grid grid-cols-2 rounded-lg bg-linear-[90deg,var(--color-primary)_50%,var(--color-white)_50%] px-2 py-3 sm:px-4 sm:py-4">
          <p className="uppercase text-lg sm:text-xl text-white text-center font-bold">
            fast
          </p>
          <p className="uppercase text-lg sm:text-xl text-center font-bold">
            booking
          </p>
        </div>

        {/* RIGHT CARD */}
        <section className="bg-white w-full max-w-md p-8 sm:p-12 lg:p-16 rounded-3xl flex flex-col items-center text-center">
          <h2 className="uppercase font-bold mb-4">
            I'm here seeking job
          </h2>

          <div className="w-56 sm:w-64 md:w-72">
            <Lottie options={{ animationData: seekingJobLottie }} />
          </div>

          <Button
            size="large"
            className="mt-6 bg-primary text-white hover:bg-primary/92 shadow-[4px_4px_10px_rgba(0,0,0,0.2)]"
          >
            Login | Register
          </Button>
        </section>
      </div>
    </div>
  )
}
