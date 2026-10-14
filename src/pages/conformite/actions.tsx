import {
  DEFAULT_SCOPE,
  EXCLUDED_OPERATOR_NAMES,
  isScope,
  OPERATOR_STATUSES,
  SCOPE_LABELS,
} from "@/lib/rpntScopes";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import {
  SegmentedControl,
  type SegmentedControlProps,
} from "@codegouvfr/react-dsfr/SegmentedControl";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import parentAreas from "../../../public/parent_areas.json";
import styles from "../../styles/conformite-actions.module.css";
import type { ActionsGroup, ActionsResponse } from "../api/rcpnt/actions";
import type { ActionsListResponse } from "../api/rcpnt/actions-list";

type OperatorOption = {
  id: string;
  name: string;
  name_with_article: string | null;
  status: string | null;
  departments: string[];
};

// "de" + name_with_article ("l'Adico", "le CDG09", "Gironde Numérique"): "de l'Adico", "du CDG09"
const adherentsLabel = (op: OperatorOption) => {
  const name = op.name_with_article || op.name;
  const prefix = name.startsWith("le ")
    ? "du "
    : name.startsWith("les ")
      ? "des "
      : name.startsWith("la ") || name.startsWith("l'")
        ? "de "
        : /^[aeiouyàâéèêîôûœ]/i.test(name)
          ? "d'"
          : "de ";
  return `Adhérentes ${prefix}${name.replace(/^(le|les) /, "")}`;
};

// An action belongs to the section of its first criterion
const SECTIONS = [
  { title: "Nom de domaine et site internet", prefix: "1.", logo: "/images/rcpnt-site.svg" },
  { title: "Messagerie", prefix: "2.", logo: "/images/rcpnt-messagerie.svg" },
];

const departmentNames: Record<string, string> = Object.fromEntries(
  parentAreas
    .filter((area) => area.type === "department")
    .map((area) => [area.insee_geo, area.name]),
);

const percent = (part: number, total: number) => (total ? (100 * part) / total : 0);

const concernedCount = (data: ActionsResponse, action: { id: string }) =>
  data.groups.reduce((sum, group) => sum + group.counts[action.id], 0);

const formatPercent = (value: number) =>
  `${value < 10 && value > 0 ? value.toFixed(1) : Math.round(value)} %`.replace(".", ",");

// The sort buttons sit inside table headers we cannot give aria-sort to
const sortLabel = (label: string, active: boolean, desc: boolean) =>
  `Trier par ${label.toLowerCase()}${active ? `, tri actuel ${desc ? "décroissant" : "croissant"}` : ""}`;

const departmentLabel = (group: ActionsGroup) =>
  `${group.id} - ${departmentNames[group.id] ?? ""}`.replace(/ - $/, "");

const detailModal = createModal({ id: "rpnt-action-detail", isOpenedByDefault: false });

type Action = ActionsResponse["actions"][number];

type SortKey = "label" | "count" | "value";

type Breakdown = "groups" | "operators";

const SORT_COLUMNS: { key: SortKey; title: (breakdown: string) => string }[] = [
  { key: "label", title: (breakdown) => breakdown },
  { key: "count", title: () => "Collectivités" },
  { key: "value", title: () => "Part" },
];

const DetailTable = ({
  data,
  action,
  breakdown,
}: {
  data: ActionsResponse;
  action: Action;
  breakdown: Breakdown;
}) => {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "count", desc: true });
  const firstColumn = breakdown === "operators" ? "Partenaire" : "Département";

  const rows = data[breakdown]
    .map((group) => ({
      label: breakdown === "operators" ? (group.name ?? group.id) : departmentLabel(group),
      count: group.counts[action.id],
      total: group.total,
      value: percent(group.counts[action.id], group.total),
    }))
    .sort((a, b) => {
      const diff =
        sort.key === "label"
          ? a.label.localeCompare(b.label, "fr", { numeric: true })
          : a[sort.key] - b[sort.key];
      return (sort.desc ? -diff : diff) || a.label.localeCompare(b.label, "fr", { numeric: true });
    });

  const toggle = (key: SortKey) =>
    setSort((prev) => ({ key, desc: prev.key === key ? !prev.desc : key !== "label" }));

  return (
    <Table
      fixed
      headers={SORT_COLUMNS.map(({ key, title }) => (
        <button
          key={key}
          type="button"
          className={styles.sortButton}
          onClick={() => toggle(key)}
          aria-label={sortLabel(title(firstColumn), sort.key === key, sort.desc)}
        >
          {title(firstColumn)}
          {sort.key === key && (sort.desc ? " ▼" : " ▲")}
        </button>
      ))}
      data={rows.map((row) => [row.label, `${row.count} / ${row.total}`, formatPercent(row.value)])}
    />
  );
};

type Tab = Breakdown | "list";

const TAB_LABELS: Record<Tab, string> = {
  groups: "Par département",
  operators: "Par structure de mutualisation",
  list: "Liste complète",
};

const ListTable = ({ action, query }: { action: Action; query: string }) => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: "name" | "population"; desc: boolean }>({
    key: "population",
    desc: true,
  });
  const [result, setResult] = useState<ActionsListResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const order = sort.desc ? "desc" : "asc";
    const params = `action=${action.id}&page=${page}&sort=${sort.key}&order=${order}`;
    fetch(`/api/rcpnt/actions-list?${params}${query}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: ActionsListResponse) => {
        setResult(json);
        setError(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [action.id, page, sort, query]);

  if (error) return <p>La liste n&rsquo;a pas pu être chargée.</p>;
  if (!result) return <p className={styles.listLoading}>Chargement…</p>;

  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));

  const sortHeader = (key: "name" | "population", label: string) => (
    <button
      key={key}
      type="button"
      className={styles.sortButton}
      aria-label={sortLabel(label, sort.key === key, sort.desc)}
      onClick={() => {
        setSort((prev) => ({ key, desc: prev.key === key ? !prev.desc : key === "population" }));
        setPage(1);
      }}
    >
      {label}
      {sort.key === key && (sort.desc ? " ▼" : " ▲")}
    </button>
  );

  return (
    <>
      <p className={fr.cx("fr-text--sm")}>
        {result.total.toLocaleString("fr-FR")}{" "}
        {result.total > 1 ? "collectivités concernées" : "collectivité concernée"}
      </p>
      <Table
        fixed
        className={styles.listTable}
        headers={[
          sortHeader("name", "Collectivité"),
          "Département",
          sortHeader("population", "Population"),
        ]}
        data={result.rows.map((row) => [
          <Link key={row.siret} href={`/bienvenue/${row.siret}`} target="_blank">
            {row.name}
          </Link>,
          row.department ?? "",
          row.population?.toLocaleString("fr-FR") ?? "",
        ])}
      />
      {pageCount > 1 && (
        <div className={`${fr.cx("fr-mt-2w")} ${styles.pagination}`}>
          <Pagination
            showFirstLast={false}
            count={pageCount}
            defaultPage={page}
            getPageLinkProps={(pageNumber) => ({
              href: "#",
              onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                setPage(pageNumber);
              },
            })}
          />
        </div>
      )}
    </>
  );
};

const DetailView = ({
  data,
  action,
  breakdowns,
  exportQuery,
  filtered,
}: {
  data: ActionsResponse;
  action: Action;
  breakdowns: Breakdown[];
  exportQuery: string;
  filtered: boolean;
}) => {
  // Once filtered on a département or an OPSN, only the list is left
  const tabs: Tab[] = filtered ? ["list"] : [...breakdowns, "list"];
  const [tab, setTab] = useState<Tab>(tabs[0]);

  return (
    <>
      <p>
        <a
          className={fr.cx("fr-link", "fr-icon-download-line", "fr-link--icon-left")}
          href={`/api/rcpnt/actions-export?action=${action.id}${exportQuery}`}
          download
        >
          Télécharger la liste des collectivités (CSV)
        </a>
      </p>
      {tabs.length > 1 && (
        <SegmentedControl
          hideLegend
          small
          className={fr.cx("fr-mb-2w")}
          // 2 or 3 segments, the DSFR type only accepts a bounded tuple
          segments={
            tabs.map((key) => ({
              label: TAB_LABELS[key],
              nativeInputProps: { checked: tab === key, onChange: () => setTab(key) },
            })) as unknown as SegmentedControlProps.Segments
          }
        />
      )}
      {tab === "list" ? (
        <ListTable action={action} query={exportQuery} />
      ) : (
        <DetailTable key={tab} data={data} action={action} breakdown={tab} />
      )}
    </>
  );
};

const ActionCard = ({
  action,
  data,
  onDetail,
}: {
  action: Action;
  data: ActionsResponse;
  onDetail: () => void;
}) => {
  const total = data.groups.reduce((sum, group) => sum + group.total, 0);
  const concerned = concernedCount(data, action);

  return (
    <Card
      titleAs="h3"
      title={action.title}
      size="small"
      start={
        <ul className={fr.cx("fr-badges-group")}>
          {action.criteria.map((ref) => (
            <li key={ref}>
              <Link
                href={`/conformite/referentiel#${ref}`}
                target="_blank"
                className={styles.criterion}
              >
                <Badge small noIcon>
                  Critère {ref}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      }
      desc={
        <>
          {action.description}
          <br />
          <a
            href={action.helpUrl ?? `/conformite/referentiel#${action.criteria[0]}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Procédure détaillée
          </a>
          <span className={styles.share}>
            <strong className={styles.shareValue}>
              {formatPercent(percent(concerned, total))}
            </strong>
            <span className={styles.shareDetail}>
              {concerned.toLocaleString("fr-FR")}{" "}
              {concerned > 1 ? "collectivités concernées" : "collectivité concernée"} sur{" "}
              {total.toLocaleString("fr-FR")}
            </span>
          </span>
        </>
      }
      footer={
        <ButtonsGroup
          buttonsSize="small"
          buttons={[
            {
              children: "Liste des collectivités concernées",
              priority: "secondary",
              onClick: onDetail,
            },
          ]}
        />
      }
    />
  );
};

const ConformiteActions: NextPage = () => {
  const router = useRouter();
  const dep = typeof router.query.dep === "string" ? router.query.dep : "";
  const operator = typeof router.query.operator === "string" ? router.query.operator : "";
  const scopeParam = typeof router.query.scope === "string" ? router.query.scope : "";
  // "adherents" only makes sense relative to a chosen OPSN
  const scope =
    isScope(scopeParam) && (operator || scopeParam !== "adherents") ? scopeParam : DEFAULT_SCOPE;

  // Results are tagged with their selection, so loading and error states are derived from it
  const selection = `${dep}|${operator}|${scope}`;
  const [result, setResult] = useState<{ selection: string; data: ActionsResponse } | null>(null);
  const [failedSelection, setFailedSelection] = useState<string | null>(null);
  const error = failedSelection === selection;
  const loading = !error && result?.selection !== selection;
  // Previous figures stay (dimmed) while loading, never next to an error
  const data = error ? null : (result?.data ?? null);

  const [operators, setOperators] = useState<OperatorOption[]>([]);
  const [detail, setDetail] = useState<Action | null>(null);

  useEffect(() => {
    fetch("/api/deployment/operators")
      .then((res) => res.json())
      .then((json: { data: OperatorOption[] }) =>
        setOperators(
          json.data.filter(
            (op) =>
              op.status !== null &&
              OPERATOR_STATUSES.includes(op.status) &&
              !EXCLUDED_OPERATOR_NAMES.includes(op.name),
          ),
        ),
      )
      .catch(() => setOperators([]));
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (dep) params.set("dep", dep);
    if (operator) params.set("operator", operator);
    params.set("scope", scope);

    fetch(`/api/rcpnt/actions?${params}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: ActionsResponse) => setResult({ selection, data: json }))
      .catch((err) => {
        if (err.name !== "AbortError") setFailedSelection(selection);
      });
    return () => controller.abort();
  }, [router.isReady, dep, operator, scope, selection]);

  const setFilter = (key: "dep" | "operator" | "scope", value: string) => {
    const query = { ...router.query, [key]: value };
    if (!value || (key === "scope" && value === DEFAULT_SCOPE)) delete query[key];

    // An OPSN outside the new département is no longer selectable
    const chosen = operators.find((op) => op.id === query.operator);
    if (key === "dep" && value && chosen && !chosen.departments?.includes(value)) {
      delete query.operator;
    }
    // "adherents" only exists relative to an OPSN
    if (!query.operator && query.scope === "adherents") delete query.scope;

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const departmentOptions = useMemo(
    () =>
      Object.entries(departmentNames)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, name]) => ({ code, name })),
    [],
  );

  const chosenOperator = operators.find((op) => op.id === operator);

  const operatorOptions = operators
    .filter((op) => !dep || op.departments?.includes(dep))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filterQuery =
    (dep ? `&dep=${encodeURIComponent(dep)}` : "") +
    (operator ? `&operator=${encodeURIComponent(operator)}` : "");

  // Per section, the actions concerning at least one organization, most concerned first
  const sections = SECTIONS.map((section) => ({
    section,
    actions: (data?.actions ?? [])
      .filter((action) => action.criteria[0].startsWith(section.prefix))
      .map((action) => ({ action, count: data ? concernedCount(data, action) : 0 }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .map(({ action }) => action),
  })).filter(({ actions }) => actions.length > 0);

  const exportQuery = `${filterQuery}&scope=${scope}`;

  const uncovered = data?.groups.reduce((sum, group) => sum + group.uncovered, 0) ?? 0;
  const total = data?.groups.reduce((sum, group) => sum + group.total, 0) ?? 0;

  // Per-département breakdown only makes sense unfiltered; per-partner unless one OPSN is chosen
  const breakdowns: Breakdown[] = [
    ...(filterQuery ? [] : (["groups"] as const)),
    ...(data && data.operators.length > 0 ? (["operators"] as const) : []),
  ];

  return (
    <>
      <NextSeo
        title="Actions prioritaires pour la présence numérique des territoires"
        description="Les actions prioritaires portées par l'ANCT et ses partenaires pour accompagner les collectivités jusqu'à atteindre 100 % de conformité au RPNT"
      />
      <div className={fr.cx("fr-container", "fr-my-6w")}>
        <h1 className={styles.title}>
          Actions prioritaires pour la présence numérique des territoires
        </h1>
        <p>
          À travers la Suite territoriale, l&rsquo;ANCT et les{" "}
          <Link href="/partenaires">structures de mutualisation partenaires</Link> poursuivent un
          objectif commun&nbsp;: accompagner les collectivités jusqu&rsquo;à atteindre{" "}
          <strong>100&nbsp;% de conformité</strong> au{" "}
          <Link href="/conformite/referentiel">
            Référentiel de la présence numérique des territoires (RPNT)
          </Link>{" "}
          à l&rsquo;échelle nationale.
        </p>
        <p>
          Pour y parvenir, les{" "}
          <strong>Actions prioritaires pour la présence numérique des territoires (APNT)</strong>{" "}
          traduisent ce référentiel en gestes concrets. Seuls ses critères «&nbsp;Essentiel&nbsp;»
          sont pris en compte&nbsp;: ils correspondent au niveau minimal de sécurité attendu. Une
          collectivité est «&nbsp;Conforme&nbsp;» lorsqu&rsquo;elle les remplit tous.
        </p>

        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-4w")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
            <Select
              label="Département"
              nativeSelectProps={{
                value: dep,
                onChange: (e) => setFilter("dep", e.target.value),
              }}
            >
              <option value="">Tous les départements</option>
              {departmentOptions.map(({ code, name }) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
              ))}
            </Select>
          </div>
          <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
            <Select
              label="Structure de mutualisation partenaire"
              nativeSelectProps={{
                value: operator,
                onChange: (e) => setFilter("operator", e.target.value),
              }}
            >
              <option value="">Toutes les structures de mutualisation</option>
              {operatorOptions.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                  {op.status === "intention" ? " (à venir)" : ""}
                </option>
              ))}
            </Select>
          </div>
          <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
            <Select
              label="Type de collectivité"
              nativeSelectProps={{
                value: scope,
                onChange: (e) => setFilter("scope", e.target.value),
              }}
            >
              {Object.entries(SCOPE_LABELS)
                .filter(([key]) => operator || key !== "adherents")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {key === "adherents" && chosenOperator ? adherentsLabel(chosenOperator) : label}
                  </option>
                ))}
            </Select>
          </div>
        </div>

        {error && (
          <Alert
            severity="error"
            small
            description="Les données n'ont pas pu être chargées."
            className={fr.cx("fr-mb-4w")}
          />
        )}
        {!data && !error && <p>Chargement…</p>}

        <div aria-busy={loading} className={loading ? styles.loading : undefined}>
          {data && scope === "adherents" && !dep && total === 0 && (
            <Alert
              severity="info"
              small
              description="Cette structure de mutualisation ne nous a pas encore fait parvenir la liste de ses adhérents."
              className={fr.cx("fr-mb-4w")}
            />
          )}

          {data && uncovered > 0 && (
            <Alert
              severity="info"
              small
              description={`${uncovered.toLocaleString("fr-FR")} collectivités non conformes à l'essentiel ne relèvent d'aucune des actions ci-dessous.`}
              className={fr.cx("fr-mb-4w")}
            />
          )}

          {data &&
            sections.map(({ section, actions }) => (
              <section key={section.title} className={fr.cx("fr-mb-6w")}>
                <div className={styles.sectionHeader}>
                  <Image src={section.logo} alt="" width={60} height={60} aria-hidden="true" />
                  <h2 className={fr.cx("fr-mb-0")}>{section.title}</h2>
                </div>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}
                    >
                      <ActionCard
                        action={action}
                        data={data}
                        onDetail={() => {
                          setDetail(action);
                          detailModal.open();
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>

        <detailModal.Component title={detail?.title ?? ""} size="large">
          {data && detail && (
            <DetailView
              key={detail.id}
              data={data}
              action={detail}
              breakdowns={breakdowns}
              exportQuery={exportQuery}
              filtered={Boolean(dep || operator)}
            />
          )}
        </detailModal.Component>
      </div>
    </>
  );
};

export default ConformiteActions;
