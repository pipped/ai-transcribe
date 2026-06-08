"use client";
import React from "react";
import { cn } from "@/lib/utils";

const colors = [
  "rgb(255 255 255)", "rgb(220 220 220)", "rgb(180 180 180)",
  "rgb(140 140 140)", "rgb(100 100 100)", "rgb(60 60 60)",
  "rgb(240 240 240)", "rgb(200 200 200)", "rgb(160 160 160)",
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.transitionDuration = "0s";
  e.currentTarget.style.backgroundColor = getRandomColor();
};

const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.transitionDuration = "2s";
  e.currentTarget.style.backgroundColor = "";
};

const ROWS = 50;
const COLS = 50;
const rowIndices = Array.from({ length: ROWS }, (_, i) => i);
const colIndices = Array.from({ length: COLS }, (_, i) => i);

export const BoxesCore = ({ className, ...rest }: { className?: string }) => (
  <div
    style={{ transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)` }}
    className={cn("absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0", className)}
    {...rest}
  >
    {rowIndices.map((i) => (
      <div key={i} className="w-16 h-8 border-l border-white/10 relative">
        {colIndices.map((j) => (
          <div
            key={j}
            className="w-16 h-8 border-r border-t border-white/10 relative"
            style={{ transition: "background-color 2s ease-out" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {j % 2 === 0 && i % 2 === 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-700 stroke-[1px] pointer-events-none"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            ) : null}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export const Boxes = React.memo(BoxesCore);
