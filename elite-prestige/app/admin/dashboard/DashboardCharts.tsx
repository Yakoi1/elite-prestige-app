"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#c9a24c", "#9ec3e8", "#d29a5e", "#5cb8ae", "#e7d19a"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#0a2a4a] border border-white/10 px-3 py-2 text-xs font-jost">
      <p className="text-gray1 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name} : {Number(p.value).toLocaleString("fr-FR")}$
        </p>
      ))}
    </div>
  );
}

export function RevenueByCategoryChart({ data }: { data: { name: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="name" stroke="#949399" fontSize={11} />
        <YAxis stroke="#949399" fontSize={11} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" name="Chiffre d'affaires" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueOverTimeChart({ data }: { data: { date: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" stroke="#949399" fontSize={11} />
        <YAxis stroke="#949399" fontSize={11} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="total" name="Chiffre d'affaires" stroke="#c9a24c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TopVehiclesChart({ data }: { data: { name: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis type="number" stroke="#949399" fontSize={11} />
        <YAxis type="category" dataKey="name" stroke="#949399" fontSize={11} width={110} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" name="Chiffre d'affaires" fill="#c9a24c" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FleetAllocationChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
