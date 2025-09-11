"use client";

import { useEffect, useState } from "react";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { User, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialData {
    testi_id: number;
    content: string;
    name: string;
    role: string;
    status: number;
    created_date: string;
}

interface TestimonialsProps {
    testimonialData: TestimonialData[];
}

function ProTestimonials({ testimonialData }: TestimonialsProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        const timer = setTimeout(() => {
            if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
                setCurrent(0);
                api.scrollTo(0);
            } else {
                api.scrollNext();
                setCurrent(current + 1);
            }
        }, 4000);

        return () => clearTimeout(timer);
    }, [api, current]);

    return (
        <div className="w-full py-6 lg:py-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col gap-10">
                        <h2 className="text-2xl md:text-4xl tracking-tighter  font-semibold text-center text-white">
                            What Our Users Say
                        </h2>
                        <Carousel setApi={setApi} className="w-full">
                            <CarouselContent>
                                {testimonialData.map((testimonial) => (
                                    <CarouselItem className="lg:basis-1/2" key={testimonial.testi_id}>
                                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-md h-full  p-6  flex  flex-col">
                                            {/* Rating stars */}
                                            <div className="flex gap-1 mt-2 mb-4" aria-label="Rating: 5 out of 5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                                        aria-hidden="true"
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex flex-col">
                                                    <h3 className="text-xl tracking-tight text-white">
                                                        "{testimonial.content}"
                                                    </h3>
                                                </div>
                                                <p className="flex flex-row gap-2 text-sm items-center">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="bg-gradient-to-br from-[#ff6a00] to-[#a63a00] text-white text-xs">
                                                            {testimonial.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-white font-medium">{testimonial.name}</span>
                                                    <span className="text-muted-foreground">- {testimonial.role}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProTestimonials;
