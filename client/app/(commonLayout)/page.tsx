import { Destinations } from "@/components/module/Home/Destinations";
import { Hero } from "@/components/module/Home/Hero";
import { HowItWorks } from "@/components/module/Home/HowItWorks";
import { Pricing } from "@/components/module/Home/Pricing";
import { Testimonials } from "@/components/module/Home/Testimonials";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Travel Nest - Discover Your Perfect Destination</title>
        <meta
          name="description"
          content="Explore amazing destinations and book unforgettable tours with our AI-powered travel platform. Get personalized recommendations and create memories that last a lifetime."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Hero />
        <Destinations/>
        <HowItWorks/>
        <Pricing/>
        <Testimonials/>
      </main>
    </>
  );
}