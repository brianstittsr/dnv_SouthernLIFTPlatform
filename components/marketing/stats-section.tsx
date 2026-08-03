"use client";

import { useEffect, useState } from "react";
import { Building2, Users, DollarSign, Handshake } from "lucide-react";

const stats = [
  {
    label: "Clients",
    value: 475,
    suffix: "",
    icon: Building2,
    description: "Small businesses served",
  },
  {
    label: "Shared Outcome Agreements",
    value: 14,
    suffix: "+",
    icon: Handshake,
    description: "Strategic partnerships established",
  },
  {
    label: "Contract Transactions",
    value: 50,
    suffix: "B+",
    prefix: "$",
    icon: DollarSign,
    description: "Experience associated with public- and private-sector transactions",
  },
  {
    label: "Resource Partners",
    value: 30,
    suffix: "+",
    icon: Users,
    description: "Services and resource network",
  },
];

function AnimatedCounter({ value, suffix, prefix }: { value: number; suffix: string; prefix?: string }) {
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
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{count.toLocaleString()}
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
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={(stat as { prefix?: string }).prefix} />
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
