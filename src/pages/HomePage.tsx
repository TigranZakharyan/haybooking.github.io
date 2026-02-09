import Lottie from 'react-lottie';
import hiringLottie from '@/assets/lottie/hiring.json'
import seekingJobLottie from '@/assets/lottie/seekingJob.json'
import { Button } from '@/components';
export function HomePage() {
    return (
        <div className="h-full flex justify-center items-center">
            <div className="fixed -z-1 w-full h-full top-0 bg-linear-[90deg,var(--color-white)_50%,var(--color-primary)_50%]" />
            <div className="flex gap-16 items-center">
                <section className='bg-secondary p-16 rounded-3xl flex flex-col items-center'>
                    <h2 className="text-white uppercase font-bold">I'm here for hiring</h2>
                    <Lottie options={{ animationData: hiringLottie }} width={350} height={350} />
                    <Button size='large' className='text-secondary shadow-[4px_4px_10px_rgba(0,0,0,0.2)]'>Find Services</Button>
                </section>
                <div className='grid grid-cols-2 gap-2 rounded-lg bg-linear-[90deg,var(--color-primary)_50%,var(--color-white)_50%] px-1 pb-3 pt-4'>
                    <p className='uppercase text-xl text-right text-white font-bold'>fast</p>
                    <p className='uppercase text-xl text-secondary font-bold'>booking</p>
                </div>
                <section className="bg-white p-16 rounded-3xl flex flex-col items-center">
                    <h2 className="uppercase font-bold">I'm here seeking job</h2>
                    <Lottie options={{ animationData: seekingJobLottie }} width={350} height={350} />
                    <Button
                        size="large"
                        className="bg-primary text-white hover:bg-primary/92 shadow-[4px_4px_10px_rgba(0,0,0,0.2)]"
                    >
                        Login | Register
                    </Button>

                </section>
            </div>
        </div>
    )
}