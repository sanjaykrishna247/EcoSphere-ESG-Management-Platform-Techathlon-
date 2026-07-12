import { useEffect, useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendPoint[];
  color?: string;
  valueSuffix?: string;
  height?: number;
}

export function TrendAreaChart({ data, color = "#0d9488", valueSuffix = "", height = 280 }: TrendAreaChartProps) {
  const chartDivRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const seriesRef = useRef<am5xy.LineSeries | null>(null);

  useLayoutEffect(() => {
    if (!chartDivRef.current) return;

    const root = am5.Root.new(chartDivRef.current);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);

    root.numberFormatter.set("numberFormat", `#,###${valueSuffix ? ` '${valueSuffix}'` : ""}`);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0,
        paddingRight: 8,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "label",
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 60 }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
      fill: am5.color(0x737373),
      oversizedBehavior: "truncate",
      maxWidth: 90,
    });
    xAxis.get("renderer").grid.template.setAll({ strokeOpacity: 0 });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );
    yAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
      fill: am5.color(0x737373),
    });
    yAxis.get("renderer").grid.template.setAll({
      strokeDasharray: [3, 3],
      strokeOpacity: 0.5,
    });

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "label",
        stroke: am5.color(color),
        fill: am5.color(color),
        tooltip: am5.Tooltip.new(root, {
          labelText: `{categoryX}: {valueY}${valueSuffix ? ` ${valueSuffix}` : ""}`,
          getFillFromSprite: false,
          autoTextColor: false,
        }),
      })
    );
    seriesRef.current = series;

    series.strokes.template.setAll({ strokeWidth: 2.5 });
    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.15,
      fillGradient: am5.LinearGradient.new(root, {
        stops: [
          { opacity: 0.35 },
          { opacity: 0 },
        ],
        rotation: 90,
      }),
    });

    const tooltip = series.get("tooltip");
    if (tooltip) {
      tooltip.get("background")?.setAll({
        fill: am5.color(0xffffff),
        stroke: am5.color(0xe5e5e5),
        shadowOpacity: 0.08,
        shadowBlur: 8,
      });
      tooltip.label.setAll({ fill: am5.color(0x171717), fontSize: 12 });
    }

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: am5.color(color),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
        }),
      })
    );

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.lineY.set("visible", false);

    return () => {
      root.dispose();
      rootRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, valueSuffix]);

  useEffect(() => {
    const series = seriesRef.current;
    const root = rootRef.current;
    if (!series || !root) return;
    const xAxis = series.get("xAxis") as am5xy.CategoryAxis<am5xy.AxisRendererX>;
    xAxis.data.setAll(data);
    series.data.setAll(data);
  }, [data]);

  return <div ref={chartDivRef} style={{ width: "100%", height }} />;
}
