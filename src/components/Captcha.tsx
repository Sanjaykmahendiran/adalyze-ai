"use client";

import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { RefreshCcwIcon } from "lucide-react";
import { randomText } from "@/lib/captcha";

export interface CaptchaHandle {
  verify: () => boolean;
  reset: () => void;
}

export interface CaptchaProps {
  length?: number;
  className?: string;
}

const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(
  ({ length = 5, className }, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [captchaText, setCaptchaText] = useState(() => randomText(length));
    const [seed, setSeed] = useState(() => Math.random());
    const [status, setStatus] = useState<
      "idle" | "success" | "error"
    >("idle");

    // 🔁 Reset captcha
    const reset = () => {
      setCaptchaText(randomText(length));
      setInputValue("");
      setSeed(Math.random());
      setStatus("idle");
    };

    // ✅ Verify when form submits
    const verify = () => {
      if (inputValue.trim() === captchaText.trim()) {
        setStatus("success");
        return true;
      } else {
        setStatus("error");
        return false;
      }
    };

    useImperativeHandle(ref, () => ({ verify, reset }));

    // 🎨 SVG rendering
    const svg = useMemo(() => {
      const rand = (n = 1) =>
        Math.abs(Math.sin(seed * 10000 + n * 1000)) % 1;
      const letters = captchaText.split("");
      const noiseLines = Array.from({ length: 3 }).map((_, i) => ({
        x1: Math.floor(rand(i) * 10) + i * 10,
        y1: Math.floor(rand(i + 1) * 40),
        x2: Math.floor(rand(i + 2) * 140),
        y2: Math.floor(rand(i + 3) * 40),
      }));

      return (
        <svg
          width="160"
          height="48"
          viewBox="0 0 160 48"
          xmlns="http://www.w3.org/2000/svg"
          className="select-none"
          aria-hidden
        >
          <rect width="100%" height="100%" fill="#000000" rx="4" />
          {noiseLines.map((ln, idx) => (
            <line
              key={idx}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          ))}
          {letters.map((ch, i) => {
            const x = 12 + i * 28 + (rand(i + 4) * 6 - 3);
            const y = 30 + (rand(i + 5) * 6 - 3);
            const rotate = rand(i + 6) * 30 - 15;
            const fontSize = 22 + Math.round(rand(i + 7) * 6);
            return (
              <g key={i} transform={`translate(${x},${y}) rotate(${rotate})`}>
                <text
                  x={0}
                  y={0}
                  fontFamily="Poppins"
                  fontWeight="700"
                  fontSize={fontSize}
                  fill="#ffffff"
                  style={{ userSelect: "none" }}
                >
                  {ch}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }, [captchaText, seed]);

    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          <div className="rounded border border-[#3a3a3a] bg-black p-1">
            {svg}
          </div>
          <input
            placeholder="Enter captcha"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`w-full rounded bg-[#171717] py-4 px-2 text-white focus:outline-none focus:ring-0 border ${
              status === "error"
                ? "border-red-500"
                : status === "success"
                ? "border-green-500"
                : "border-[#3a3a3a]"
            }`}
            style={{ fontFamily: "var(--font-poppins)" }}
          />
          <button
            type="button"
            onClick={reset}
            title="Refresh captcha"
            className="text-white"
          >
            <RefreshCcwIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Inline feedback messages */}
        {status === "error" && (
          <p className="text-red-500 text-sm mt-1">
            Captcha incorrect. Please try again.
          </p>
        )}
        {status === "success" && (
          <p className="text-green-500 text-sm mt-1">
            Captcha verified successfully!
          </p>
        )}
      </div>
    );
  }
);

Captcha.displayName = "Captcha";
export default Captcha;
