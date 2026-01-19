"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./HistoricalChart.module.css";
import { HistoryData } from "./types";

interface ChartDataPoint {
  month: string;
  label: string;
  score: number;
  conforme: number;
  aRenforcer: number;
  aRisque: number;
  total: number;
}

interface HistoricalChartProps {
  history: HistoryData;
  selectedRef?: string | null;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

const COLORS = {
  conforme: "#009081",
  aRenforcer: "#FFC579",
  aRisque: "#FF6868",
};

// Format month for display
const formatMonth = (month: string): string => {
  if (month === "current") return "Actuel";
  const [year, m] = month.split("-");
  const monthNames = [
    "",
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  return `${monthNames[parseInt(m)]} ${year.slice(2)}`;
};

export const HistoricalChart = ({
  history,
  selectedRef,
  selectedPeriod = "current",
  onPeriodChange,
}: HistoricalChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 280, height: 150 });

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!history?.months) return [];

    return history.months
      .map((monthData) => {
        const getRefValid = (ref: string) => monthData.refs.find((r) => r.ref === ref)?.valid || 0;
        const total = monthData.total;

        if (selectedRef) {
          const valid = getRefValid(selectedRef);
          return {
            month: monthData.month,
            label: formatMonth(monthData.month),
            score: (valid / total) * 2,
            conforme: (valid / total) * 100,
            aRenforcer: 0,
            aRisque: ((total - valid) / total) * 100,
            total,
          };
        }

        const stat_a_valid = getRefValid("a");
        const stat_1a_valid = getRefValid("1.a");
        const stat_2a_valid = getRefValid("2.a");

        const n_score_2 = stat_a_valid;
        const n_score_1 = stat_1a_valid - stat_a_valid + stat_2a_valid - stat_a_valid;
        const n_score_0 = total - n_score_2 - n_score_1;
        const score = (n_score_2 * 2 + n_score_1 * 1) / total;

        return {
          month: monthData.month,
          label: formatMonth(monthData.month),
          score,
          conforme: (n_score_2 / total) * 100,
          aRenforcer: (n_score_1 / total) * 100,
          aRisque: (n_score_0 / total) * 100,
          total,
        };
      })
      .sort((a, b) => {
        // Sort chronologically, with "current" at the end
        if (a.month === "current") return 1;
        if (b.month === "current") return -1;
        return a.month.localeCompare(b.month);
      });
  }, [history, selectedRef]);

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width: Math.max(200, width), height: 200 });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render chart
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 15, right: 15, bottom: 30, left: 75 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.1);

    // Line chart with gradient
    const y = d3.scaleLinear().domain([0, 2]).range([innerHeight, 0]);

    // Clickable zones for each period (rendered first to appear below)
    g.selectAll(".click-zone")
      .data(chartData)
      .join("rect")
      .attr("class", "click-zone")
      .attr("x", (d) => (x(d.month) || 0) - x.bandwidth() * 0.1)
      .attr("y", -10)
      .attr("width", x.bandwidth() * 1.2)
      .attr("height", innerHeight + 30)
      .attr("fill", (d) => (d.month === selectedPeriod ? "rgba(0, 0, 145, 0.05)" : "transparent"))
      .attr("rx", 4)
      .attr("cursor", "pointer")
      .on("click", (_, d) => {
        if (onPeriodChange) {
          onPeriodChange(d.month);
        }
      });

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => formatMonth(d as string))
          .tickSize(0),
      )
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .attr("font-size", "10px")
      .attr("fill", (d) => (d === selectedPeriod ? "#000091" : "#666"))
      .attr("font-weight", (d) => (d === selectedPeriod ? "600" : "400"));

    // Y axis with semantic labels
    const yAxisLabels: Record<number, string> = {
      0: "Non conforme",
      1: "À renforcer",
      2: "Conforme",
    };

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .tickValues([0, 1, 2])
          .tickFormat((d) => yAxisLabels[d as number] || "")
          .tickSize(-innerWidth),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", "#e5e5e5"))
      .selectAll("text")
      .attr("font-size", "9px")
      .attr("fill", "#666");

    // Create gradient definition
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(2));

    gradient.append("stop").attr("offset", "0%").attr("stop-color", COLORS.aRisque);
    gradient.append("stop").attr("offset", "50%").attr("stop-color", COLORS.aRenforcer);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", COLORS.conforme);

    // Line generator
    const line = d3
      .line<ChartDataPoint>()
      .x((d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .y((d) => y(d.score))
      .curve(d3.curveMonotoneX);

    // Draw line
    g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 2.5)
      .attr("d", line)
      .style("pointer-events", "none");

    // Draw points
    g.selectAll(".point")
      .data(chartData)
      .join("circle")
      .attr("class", "point")
      .attr("cx", (d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.score))
      .attr("r", 4)
      .attr("fill", (d) => {
        const colorScale = d3
          .scaleLinear<string>()
          .domain([0, 1, 2])
          .range([COLORS.aRisque, COLORS.aRenforcer, COLORS.conforme]);
        return colorScale(d.score);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("pointer-events", "none");
  }, [chartData, dimensions, selectedRef, selectedPeriod, onPeriodChange]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.header}>
        <p className={styles.title}>Historique</p>
        <p className={styles.subtitle}>Cliquez sur le graphique pour sélectionner une période</p>
      </div>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default HistoricalChart;
