import { NextPage } from "next";
import { NextSeo } from "next-seo";
import { useEffect, useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import HeroSection from "@/components/HeroSection";

type PopRangeStats = {
  ref: string;
  valid: number;
  total: number;
  valid_pop: number;
  total_pop: number;
};

type ApiResponse = {
  [key: string]: PopRangeStats[];
};

const StatsPage: NextPage = () => {
  const [stats, setStats] = useState<{range: string; stats: PopRangeStats}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rcpnt/stats?scope=pop&refs=1.1`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch stats");
        }
        return res.json();
      })
      .then((data: ApiResponse) => {
        // Transform the data into an array of {range, stats} objects
        const statsArray = Object.entries(data).map(([range, statsArray]) => ({
          range,
          stats: statsArray[0], // We know there's only one item per range
        }));

        // Sort by the minimum population in each range
        const sortedStats = statsArray.sort((a, b) => {
          const aMin = parseInt(a.range.split("-")[0]);
          const bMin = parseInt(b.range.split("-")[0]);
          return aMin - bMin;
        });

        setStats(sortedStats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const chartData = stats.map((item) => ({
    range: item.range,
    percentage: Math.round((item.stats.valid / item.stats.total) * 100),
    communes: item.stats.total,
    conformes: item.stats.valid,
  }));

  return (
    <>
      <NextSeo
        title="Statistiques RCPNT - Distribution par taille de commune"
        description="Statistiques de conformité au Référentiel de Conformité de la Présence Numérique des Territoires selon la taille des communes."
      />

      <HeroSection>
        <div className={fr.cx("fr-container", "fr-pt-5w")}>
          <h1
            className={fr.cx("fr-h1", "fr-mb-2w")}
            style={{ color: "var(--text-title-blue-france)" }}
          >
            Statistiques RCPNT
          </h1>
        </div>
      </HeroSection>

      <div className={fr.cx("fr-container", "fr-py-6w")}>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          <div className={fr.cx("fr-col-12")}>
            <div className={fr.cx("fr-card", "fr-p-4w", "fr-mb-4w")}>
              <div className={fr.cx("fr-card__body")}>
                <div className={fr.cx("fr-card__content")}>
                  <h2 className={fr.cx("fr-card__title", "fr-h3", "fr-mb-3w")}>
                    Distribution de la déclaration du site internet selon la taille des communes
                  </h2>
                  <p className={fr.cx("fr-text--sm", "fr-mb-2w")}>
                    Ce graphique montre le taux de conformité au critère 1.1 du RCPNT (déclaration du site internet sur Service-Public.fr) selon la taille des communes.
                  </p>

                  {loading && (
                    <div className={fr.cx("fr-py-4w", "fr-text--center")}>
                      <span className={fr.cx("fr-icon-refresh-line", "fr-icon--sm")} aria-hidden="true" />
                      Chargement des données...
                    </div>
                  )}

                  {error && (
                    <div className={fr.cx("fr-alert", "fr-alert--error", "fr-my-3w")}>
                      <h3 className={fr.cx("fr-alert__title")}>Erreur</h3>
                      <p>{error}</p>
                    </div>
                  )}

                  {!loading && !error && (
                    <>
                      <div style={{ height: "400px" }} className={fr.cx("fr-mb-4w")}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="range"
                              label={{
                                value: "Population de la commune",
                                position: "bottom",
                                offset: 0,
                              }}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              label={{
                                value: "Pourcentage de conformité",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                              }}
                              domain={[0, 100]}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              formatter={(value: number, name: string) => {
                                if (name === "percentage") return [`${value}%`, "Taux de conformité"];
                                return [value, name];
                              }}
                              contentStyle={{
                                backgroundColor: "var(--background-default-grey)",
                                border: "1px solid var(--border-default-grey)",
                                borderRadius: "4px",
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="percentage"
                              fill="var(--background-action-high-blue-france)"
                              name="Taux de conformité"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className={fr.cx("fr-table", "fr-table--bordered")}>
                        <table>
                          <caption className={fr.cx("fr-h6")}>Détails par tranche de population</caption>
                          <thead>
                            <tr>
                              <th scope="col">Population</th>
                              <th scope="col">Communes conformes</th>
                              <th scope="col">Total communes</th>
                              <th scope="col">Taux de conformité</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chartData.map((row) => (
                              <tr key={row.range}>
                                <td>{row.range}</td>
                                <td>{row.conformes.toLocaleString()}</td>
                                <td>{row.communes.toLocaleString()}</td>
                                <td>{row.percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsPage;
