"use client";
import React, { useEffect, useState } from "react";
import DashboardStat from "@/components/dashboard/stat";
import UsersIcon from "@/components/icons/users";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";

export default function ResidentesStats() {
  const [stats, setStats] = useState({
    totalResidentes: 0,
    nuevosEsteMes: 0,
    ocupacionPromedio: 0
  });

  useEffect(() => {
    fetch('/api/usuarios')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) data = [];
        setStats({
          totalResidentes: data.length,
          nuevosEsteMes: data.filter((r: any) => {
            const fecha = new Date(r.fechaRegistro);
            const hoy = new Date();
            return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
          }).length,
          ocupacionPromedio: Math.round((data.filter((r: any) => r.estado === 'Activo').length / (data.length || 1)) * 100)
        });
      });
  }, []);

  const statCards = [
    {
      label: "TOTAL RESIDENTES",
      value: stats.totalResidentes.toString(),
      description: "Residentes registrados",
      icon: UsersIcon,
      tag: "TOTAL",
      intent: "positive" as const,
      direction: "up" as const,
    },
    {
      label: "NUEVOS ESTE MES",
      value: stats.nuevosEsteMes.toString(),
      description: "Registros recientes",
      icon: BoomIcon,
      tag: "MES",
      intent: "positive" as const,
      direction: "up" as const,
    },
    {
      label: "OCUPACIÓN",
      value: `${stats.ocupacionPromedio}%`,
      description: "Promedio del edificio",
      icon: ProcessorIcon,
      tag: "PROMEDIO",
      intent: "positive" as const,
      direction: "up" as const,
    },
  ];

  return (
    <>
      {statCards.map((stat, index) => (
        <div key={index} className="grid-item">
          <DashboardStat
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        </div>
      ))}
    </>
  );
}

