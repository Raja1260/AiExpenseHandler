"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

function HeroSection() {
  const imageref = useRef();

  useEffect(() => {
    const imageElement = imageref.current;
    const handleScroll = () => {
      const scrollPostion = window.scrollY;
      const scrollThresold = 100;
      if (scrollPostion > scrollThresold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title">
          Manage Your Finances <br /> With Intelligence
        </h1>
        <p className="text-xl text-grey-600 mb-8 max-w-2xl mx-auto">
          An Ai-Powered Financial management Platform that helps you
          track,analyze, an optimize your spending with real-time insides
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              get Started
            </Button>
          </Link>
        </div>
      </div>
      <div className="hero-image-wrapper">
        <div ref={imageref} className="hero-image">
          <Image
            src="/banner.jpeg"
            width={1280}
            height={720}
            alt="Dashboard Preview"
            priority
            className="rounded-lg shadow-2xl border mx-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
