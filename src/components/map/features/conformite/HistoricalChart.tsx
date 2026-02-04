"use client";

import { fr } from "@codegouvfr/react-dsfr";
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
  if (month === "current") return "ce mois";
  const [year, m] = month.split("-");
  const monthNum = parseInt(m);
  const yearShort = year.slice(2);
  return `${monthNum.toString().padStart(2, "0")}.${yearShort}`;
};

export const HistoricalChart = ({
  history,
  selectedRef,
  selectedPeriod = "current",
  onPeriodChange,
}: HistoricalChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousSelectedPeriodRef = useRef<string | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 200 });
  const [timeRange, setTimeRange] = useState<"6months" | "2025">("6months");

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!history?.months) return [];

    let filteredMonths = history.months;

    if (timeRange === "6months") {
      const dateMonths = filteredMonths.filter((m) => m.month !== "current");
      const sortedDateMonths = [...dateMonths].sort((a, b) => b.month.localeCompare(a.month));
      const last6Months = sortedDateMonths.slice(0, 6).map((m) => m.month);
      filteredMonths = filteredMonths.filter(
        (m) => m.month === "current" || last6Months.includes(m.month),
      );
    } else if (timeRange === "2025") {
      filteredMonths = filteredMonths.filter((m) => m.month.startsWith("2025-"));
    }

    return filteredMonths
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
  }, [history, selectedRef, timeRange]);

  const hasData = chartData.length > 0;

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setDimensions((prev) => ({ ...prev, width: Math.max(200, width) }));
      }
    });

    observer.observe(containerRef.current);

    // Force an initial measurement after layout completes
    const rafId = requestAnimationFrame(() => {
      if (containerRef.current) {
        const initialWidth = containerRef.current.getBoundingClientRect().width;
        if (initialWidth > 0) {
          setDimensions((prev) => ({ ...prev, width: Math.max(200, initialWidth) }));
        }
      }
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [hasData]);

  // Render chart
  useEffect(() => {
    if (!svgRef.current || chartData.length === 0 || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 15, right: 15, bottom: 30, left: 60 };
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

    // Click zone container: each zone width = total width / number of zones
    const zoneWidth = innerWidth / chartData.length;
    const clickZoneContainer = g
      .append("g")
      .attr("class", "click-zone-container")
      .attr("aria-label", "Sélection de la période");

    clickZoneContainer
      .append("rect")
      .attr("class", "click-zone-container__bg")
      .attr("x", 0)
      .attr("y", innerHeight + 8)
      .attr("width", innerWidth)
      .attr("height", 21)
      .attr("fill", "#EEF1F4")
      .attr("stroke", "#CFD5DE")
      .attr("rx", 4);

    clickZoneContainer
      .selectAll(".click-zone")
      .data(chartData)
      .join("rect")
      .attr("class", "click-zone")
      .attr("x", (_, i) => i * zoneWidth)
      .attr("y", innerHeight + 8)
      .attr("width", zoneWidth)
      .attr("height", 21)
      .attr("fill", "transparent")
      .attr("stroke", "transparent")
      .attr("rx", 4)
      .attr("cursor", "pointer")
      .style("pointer-events", "all")
      .on("click", (_, d) => {
        if (onPeriodChange) {
          onPeriodChange(d.month);
        }
      });

    const selectedIndex = chartData.findIndex((d) => d.month === selectedPeriod);
    const prevIndex = chartData.findIndex((d) => d.month === previousSelectedPeriodRef.current);
    const fromIndex = prevIndex >= 0 ? prevIndex : selectedIndex;
    const highlight = clickZoneContainer
      .append("rect")
      .attr("class", "click-zone-highlight")
      .attr("y", innerHeight + 8)
      .attr("width", zoneWidth)
      .attr("height", 21)
      .attr("rx", 4)
      .attr("fill", "#DAE2FF")
      .attr("stroke", "#90A7FF")
      .style("pointer-events", "none")
      .attr("x", fromIndex * zoneWidth);

    highlight
      .transition()
      .duration(250)
      .ease(d3.easeCubicOut)
      .attr("x", selectedIndex * zoneWidth);

    previousSelectedPeriodRef.current = selectedPeriod;

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight - 1})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => formatMonth(d as string))
          .tickSize(0),
      )
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .attr("font-size", "10px")
      .attr("pointer-events", "none")
      .attr("fill", (d) => (d === selectedPeriod ? "#000091" : "#666"))
      .attr("dy", "2em");

    // Y axis with semantic labels
    const yAxisLabels: Record<number, string> = {
      0: "A risque",
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
      .call((g) =>
        g.selectAll(".tick line").attr("stroke", "#929292").attr("stroke-dasharray", "1, 3"),
      )
      .selectAll("text")
      .attr("x", -margin.left)
      .style("text-anchor", "start")
      .attr("font-size", "11px")
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

    // Draw points: outer white stroke, then paler stroke, then full-color center
    const pointRadius = 4;
    const palerStrokeWidth = 1;
    const whiteStrokeWidth = 3;
    const getPointColor = (d: ChartDataPoint) => {
      const colorScale = d3
        .scaleLinear<string>()
        .domain([0, 1, 2])
        .range([COLORS.aRisque, COLORS.aRenforcer, COLORS.conforme]);
      return colorScale(d.score);
    };
    const getPalerColor = (fullColor: string) => d3.interpolateRgb(fullColor, "white")(0.5);

    g.selectAll(".point-outer")
      .data(chartData)
      .join("circle")
      .attr("class", "point-outer")
      .attr("cx", (d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.score))
      .attr("r", pointRadius + palerStrokeWidth + whiteStrokeWidth)
      .attr("fill", "#fff")
      .style("pointer-events", "none");

    g.selectAll(".point-mid")
      .data(chartData)
      .join("circle")
      .attr("class", "point-mid")
      .attr("cx", (d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.score))
      .attr("r", pointRadius + palerStrokeWidth)
      .attr("fill", (d) => getPalerColor(getPointColor(d)))
      .style("pointer-events", "none");

    g.selectAll(".point")
      .data(chartData)
      .join("circle")
      .attr("class", "point")
      .attr("cx", (d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.score))
      .attr("r", pointRadius)
      .attr("fill", getPointColor)
      .style("pointer-events", "none");
  }, [chartData, dimensions, selectedRef, selectedPeriod, onPeriodChange]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      <div className={styles.chartFooter}>
        <div className={styles.chartLegend}>
          <div></div>
          <span>Evolution de la conformité</span>
        </div>
        <div className={styles.selectWrapper}>
          <select
            className={styles.timeRangeSelect}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "6months" | "2025")}
          >
            <option value="6months">Derniers 6 mois</option>
            <option value="2025">2025</option>
          </select>
          <span
            className={`${fr.cx("fr-icon-arrow-down-s-line")} ${styles.caretIcon}`}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;
