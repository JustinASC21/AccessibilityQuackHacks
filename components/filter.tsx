"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  options: string[];
  value: string[];
  onChange: (updated: string[]) => void;
}

export default function Filter({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (option: string) => {
    const updated = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(updated);
  };

  const remove = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div ref={ref} className="relative w-64">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm text-left hover:border-gray-400 transition-colors min-h-[38px]"
      >
        <span className={value.length > 0 ? "text-gray-700 text-md" : "text-gray-400"}>
          {value.length > 0 ? `${value.length} selected` : "Search Accessible"}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`ml-2 flex-shrink-0 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div role="listbox" aria-multiselectable="true" className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden">
          {value.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-gray-100">
              {value.map((v) => (
                <span key={v} className="inline-flex items-center gap-1 bg-gray-900 text-white text-md font-medium rounded-full px-2.5 py-1">
                  {v}
                  <button
                    onClick={(e) => remove(e, v)}
                    aria-label={`Remove ${v}`}
                    className="text-white/60 hover:text-white leading-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="p-1.5">
            {options.map((opt) => (
              <label
                key={opt}
                role="option"
                aria-selected={value.includes(opt)}
                className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-gray-50 cursor-pointer text-md text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="accent-gray-900"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}