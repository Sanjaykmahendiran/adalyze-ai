"use client";

import React, { useReducer } from "react";

type State = {
  rangeValue: number;
};

type Action = { type: "change"; payload: number } | { type: "move"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "change":
      return { rangeValue: action.payload };
    case "move":
      return { rangeValue: Math.round(action.payload) };
    default:
      return state;
  }
}

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
type PointerEvent = React.PointerEvent<HTMLDivElement>;
type InlineStyle = React.CSSProperties;

interface Props {
  beforeImage: string;
  afterImage: string;
  pointerMove?: boolean;
  className?: string;
}

export const BeforeAfter: React.FC<Props> = ({
  beforeImage,
  afterImage,
  pointerMove = false,
  className = "",
}) => {
  const [{ rangeValue }, dispatch] = useReducer(reducer, { rangeValue: 50 });

  const handleChange = (event: ChangeEvent) => {
    dispatch({ type: "change", payload: Number(event.target.value) });
  };

  const handlePointerMove = (event: PointerEvent) => {
    const { clientX, currentTarget } = event;
    const { left, width } = currentTarget.getBoundingClientRect();
    const positionX = clientX - left;
    if (positionX >= 0) dispatch({ type: "move", payload: (positionX / width) * 100 });
  };

  return (
    <div
      className={`relative overflow-hidden w-full aspect-square cursor-ew-resize select-none ${className}`}
      onPointerMove={pointerMove ? handlePointerMove : undefined}
    >
      {/* Before Image */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-gray-200 aspect-square"
        style={{ width: `${rangeValue}%` }}
      >
        <img
          src={beforeImage}
          alt="Adalyze AI Before Image"
          className="h-full w-full object-cover"
        />
      </div>

      {/* After Image */}
      <img
        src={afterImage}
        alt="Adalyze AI After Image"
        className="h-full w-full object-cover block"
      />

      {/* Slider */}
      {!pointerMove && (
        <>
          <input
            type="range"
            min={0}
            max={100}
            value={rangeValue}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
          <div
            className="absolute top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 shadow-md rounded-full w-8 h-8 flex items-center justify-center pointer-events-none"
            style={{ left: `${rangeValue}%`, transform: "translate(-50%, -50%)" }}
          >
            <svg
              fill="#333"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path d="M24,12l-5.7-5.7V11c-3.7,0-9,0-12.6,0V6.3L0,12l5.8,5.7V13c3.6,0,8.9,0,12.5,0v4.7L24,12z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
