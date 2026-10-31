"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, DollarSign, Award } from "lucide-react";

const stats = [
  {
    label: "MBDA Cooperative Agreement",
    value: 1.275,
    suffix: "M",
    prefix: "$",
    decimals: 3,
    icon: DollarSign,
    description: "Federal funding behind the center",
  },
  {
    label: "Louisiana Parishes",
    value: 64,
    suffix: "",
    icon: MapPin,
    description: "Rural service area statewide",
  },
  {
    label: "Program Years",
    value: 3,
    suffix: "",
    icon: Award,
    description: "2026–2029 performance period",
  },
  {
    label: "HBCU Rural Center",
    value: 1,
    suffix: " of 3",
    decimals: 0,
    icon: Building2,
    description: "One of three funded nationwide",
  },
];

function AnimatedCounter({ value, suffix, prefix, decimals = 0 }: { value: number; suffix: string; prefix?: string; decimals?: number }) {
  const [count, setCount] = useState(value);

  useEffect(() => {
    // Check if already animated in this session
    if (sessionStorage.getItem('stats_animated') === 'true') {
      setCount(value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        sessionStorage.setItem('stats_animated', 'true');
        clearInterval(timer);
      } else {
        setCount(decimals > 0 ? Number(current.toFixed(decimals)) : Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, decimals]);

  return (
    <span>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 bg-black text-white">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={(stat as { prefix?: string }).prefix} decimals={(stat as { decimals?: number }).decimals ?? 0} />
              </div>
              <div className="font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
