import { TestimonialsColumn } from "@/components/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Adalyze gave us clarity on what creatives actually work. Our CTR doubled within a week thanks to its actionable insights.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Priya Sharma",
    role: "Growth Marketer",
  },
  {
    text: "Setting up Adalyze was effortless. The AI-driven recommendations helped us trim wasted spend and scale winning ads fast.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Arjun Mehta",
    role: "Performance Lead",
  },
  {
    text: "The real-time feedback on audience fit and creative impact saved us countless hours of guesswork. Our ROAS improved dramatically.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Neha Verma",
    role: "Digital Strategy Head",
  },
  {
    text: "Adalyze gave us a competitive edge—its suggestions helped refine messaging and audience targeting, increasing conversions across campaigns.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Rohan Iyer",
    role: "CMO",
  },
  {
    text: "With Adalyze, we stopped guessing and started optimizing. The dashboard surfaces issues and opportunities before they become costly.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Ananya Gupta",
    role: "Campaign Manager",
  },
  {
    text: "The depth of analysis and clarity in recommendations helped our team launch better ads more consistently. Implementation was smooth.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Kavya Nair",
    role: "Ad Operations Analyst",
  },
  {
    text: "Adalyze’s insights turned our underperforming creatives into top performers. We now make data-backed decisions in minutes.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Vikram Malhotra",
    role: "Brand Marketing Director",
  },
  {
    text: "The AI understanding of audience preferences is uncanny. Adalyze surfaced opportunities we’d been missing for months.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Ishita Reddy",
    role: "Acquisition Lead",
  },
  {
    text: "Thanks to Adalyze, our ad spend is more efficient and our messaging resonates better. We’ve seen a measurable lift in engagement.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Siddharth Rao",
    role: "E-commerce Growth Manager",
  },
];



const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);


const Testimonials = () => {
  return (
    <section className="bg-background my-20 relative">

      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg">Testimonials</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What our users say
          </h2>
          <p className="text-center mt-5 opacity-75">
            See what our customers have to say about us.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default  Testimonials ;