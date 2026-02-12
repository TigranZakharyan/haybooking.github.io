import Lottie from "react-lottie";
import hiringLottie from "@/assets/lottie/hiring.json";
import seekingJobLottie from "@/assets/lottie/seekingJob.json";
import { Button } from "@/components";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 bg-gray-50">
      {/* CARDS WRAPPER */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full max-w-7xl justify-center items-stretch">

        {/* LEFT CARD */}
        <section className="
          bg-white
          rounded-3xl
          border border-gray-200
          shadow-[0_10px_30px_rgba(0,0,0,0.08)]
          py-8 sm:py-12
          px-6 sm:px-12 lg:px-16
          text-center
          flex flex-col items-center
          justify-between
          transition hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]
          flex-1
        ">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
            I'm here for hiring
          </h2>

          <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-xs sm:max-w-sm leading-relaxed">
            Best for spa, salon, wellness center, and therapy business owners
            who want to manage bookings, appointments, and clients.
          </p>

          <div className="w-40 sm:w-52 md:w-60 mb-6">
            <Lottie options={{ animationData: hiringLottie }} />
          </div>

          <Button
            size="large"
            onClick={() => navigate("/findServices")}
            className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl"
          >
            Find Services
          </Button>
        </section>

        {/* RIGHT CARD */}
        <section className="
          bg-white
          rounded-3xl
          border border-gray-200
          shadow-[0_10px_30px_rgba(0,0,0,0.08)]
          py-8 sm:py-12
          px-6 sm:px-12 lg:px-16
          text-center
          flex flex-col items-center
          justify-between
          transition hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]
          flex-1
        ">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
            I'm here seeking job
          </h2>

          <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-xs sm:max-w-sm leading-relaxed">
            Best for personal users who want to book appointments for spa,
            salon, and wellness services at their favorite businesses.
          </p>

          <div className="w-40 sm:w-52 md:w-60 mb-6">
            <Lottie options={{ animationData: seekingJobLottie }} />
          </div>

          <Button
            size="large"
            onClick={() => navigate("/signin")}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl"
          >
            Login | Register
          </Button>
        </section>

      </div>
    </div>
  );
}
