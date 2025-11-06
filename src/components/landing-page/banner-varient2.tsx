import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BannerVarient2: React.FC = () => {
  return (
    <>
      {/* Welcome Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-10">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
                  Protect Your Future Life,{' '}
                  <span className="relative inline-block">
                    <Image
                      src="/assets/img/elements/elementor24.png"
                      alt=""
                      width={60}
                      height={60}
                      className="hidden lg:inline-block animate-bounce"
                    />
                  </span>
                  <br />
                  Our Best{' '}
                  <Image
                    src="/assets/img/images/pera-img2.png"
                    alt=""
                    width={80}
                    height={40}
                    className="hidden lg:inline-block"
                  />
                  {' '}Lawyers
                </h1>

                <p className="text-lg text-gray-600 max-w-3xl animate-fade-in-delay">
                  We know that every case is unique, and we approach each with meticulous attention
                  <br className="hidden lg:block" />
                  has detail. Whether you're facing charges related DUI, drug offenses, assault.
                </p>

                <div className="flex flex-wrap gap-4 animate-fade-in-delay-2">
                  <Link
                    href="/contact1"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Request Case Evolution
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    href="/contact2"
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-gray-800 hover:bg-gray-800 hover:text-white text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="relative">
                  <Image
                    src="/assets/img/elements/elementor25.png"
                    alt=""
                    width={100}
                    height={100}
                    className="hidden lg:block absolute -bottom-10 right-0 animate-float"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="relative animate-fade-in-right">
                <Image
                  src="/assets/img/elements/elementor23.png"
                  alt=""
                  width={150}
                  height={150}
                  className="hidden lg:block animate-pulse-slow"
                />
                <div className="animate-fade-in-right-delay">
                  <Image
                    src="/assets/img/elements/elementor26.png"
                    alt=""
                    width={120}
                    height={120}
                    className="hidden lg:inline-block animate-bounce-slow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: '/assets/img/images/others4-img1.png', delay: 0, marginTop: false },
              { img: '/assets/img/images/others4-img2.png', delay: 200, marginTop: true },
              { img: '/assets/img/images/others4-img3.png', delay: 400, marginTop: false },
              { img: '/assets/img/images/others4-img4.png', delay: 600, marginTop: true },
            ].map((item, index) => (
              <div
                key={index}
                className={`relative group animate-fade-in ${item.marginTop ? 'md:mt-8' : ''}`}
                style={{ animationDelay: `${item.delay}ms` }}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <Image
                    src={item.img}
                    alt={`Gallery image ${index + 1}`}
                    width={300}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Image
                      src="/assets/img/elements/polygon5.png"
                      alt=""
                      width={40}
                      height={40}
                      className="animate-spin-slow"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 1.2s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-right-delay {
          animation: fade-in 1s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default BannerVarient2;