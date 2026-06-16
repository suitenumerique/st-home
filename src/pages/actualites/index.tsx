import { type DocsChild } from "@/lib/docs2dsfr/client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { useMemo, useState } from "react";

const PAGE_SIZE = 9;

const parseTags = (value?: string): string[] =>
  value
    ?.split(";")
    .map((t) => t.trim())
    .filter(Boolean) ?? [];

interface BlogIndexProps {
  posts: DocsChild[];
  allServices: string[];
  allCategories: string[];
}

type SelectedFilter = { type: "service" | "category"; value: string } | null;

export default function BlogIndex({ posts, allServices, allCategories }: BlogIndexProps) {
  const [selectedFilter, setSelectedFilter] = useState<SelectedFilter>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (!selectedFilter) return posts;
    return posts.filter((post) => {
      const values = parseTags(post.document?.frontmatter[selectedFilter.type]);
      return values.includes(selectedFilter.value);
    });
  }, [posts, selectedFilter]);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggle = (type: "service" | "category", value: string) => {
    setSelectedFilter((prev) =>
      prev?.type === type && prev?.value === value ? null : { type, value },
    );
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedFilter !== null;

  const resetFilters = () => {
    setSelectedFilter(null);
    setCurrentPage(1);
  };

  return (
    <>
      <div
        style={{
          height: "300px",
          background: "linear-gradient(to bottom, rgba(205, 200, 255, 0.2), transparent)",
          pointerEvents: "none",
        }}
      />
      <div className="fr-container fr-pt-2w fr-pb-6w" style={{ marginTop: "-300px" }}>
        <NextSeo
          title="Actualités"
          description="Découvrez les dernières actualités et nouveautés de la Suite territoriale"
        />

        <Breadcrumb
          segments={[{ label: "Accueil", linkProps: { href: "/" } }]}
          currentPageLabel="Actualités"
        />

        <h1 className="fr-h1">Actualités</h1>

        {allServices.length > 0 && (
          <div className="fr-mb-2w">
            <h2 className="fr-h6 fr-mb-1w">Filtrer par services</h2>
            <div>
              {allServices.map((service) => (
                <Tag
                  key={service}
                  as="button"
                  pressed={selectedFilter?.type === "service" && selectedFilter.value === service}
                  nativeButtonProps={{ onClick: () => toggle("service", service) }}
                  className="fr-mr-1w fr-mb-1w"
                >
                  {service}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {allCategories.length > 0 && (
          <div className="fr-mb-2w">
            <h2 className="fr-h6 fr-mb-1w">Filtrer par thématiques</h2>
            <div>
              {allCategories.map((category) => (
                <Tag
                  key={category}
                  as="button"
                  pressed={selectedFilter?.type === "category" && selectedFilter.value === category}
                  nativeButtonProps={{ onClick: () => toggle("category", category) }}
                  className="fr-mr-1w fr-mb-1w"
                >
                  {category}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <Button
            iconId="ri-arrow-go-back-line"
            priority="tertiary"
            size="small"
            onClick={resetFilters}
            className="fr-mb-3w"
          >
            Réinitialiser les filtres
          </Button>
        )}

        {hasActiveFilters && (
          <p
            className="fr-text--lead fr-mb-3w"
            style={{ fontWeight: 700, color: "var(--text-action-high-blue-france)" }}
          >
            {filteredPosts.length} résultat{filteredPosts.length > 1 ? "s" : ""} correspondant à vos
            critères
          </p>
        )}

        <hr className="fr-mt-4w fr-mb-3w" />

        {paginatedPosts.length === 0 ? (
          <div className="fr-alert fr-alert--info">
            <p>Aucun article disponible pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="fr-grid-row fr-grid-row--gutters">
              {paginatedPosts
                .filter((post) => post.document?.frontmatter.status === "published")
                .map((post) => (
                  <div key={post.id} className="fr-col-12 fr-col-md-6 fr-col-lg-4 fr-mb-4w">
                    <Card
                      linkProps={{
                        href: `/actualites/${post.path}`,
                        title: post.title,
                      }}
                      enlargeLink={true}
                      title={post.title}
                      titleAs="h2"
                      start={(() => {
                        const tags = [
                          ...parseTags(post.document?.frontmatter.category),
                          ...parseTags(post.document?.frontmatter.service),
                        ];
                        return tags.length > 0 ? (
                          <div className="fr-mb-2w">
                            {tags.map((tag) => (
                              <Tag key={tag} as="span" className="fr-mr-1w">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        ) : undefined;
                      })()}
                      endDetail={<>Publié le {post.document?.frontmatter.dateFormatted}</>}
                      imageUrl={post.document?.frontmatter.image || ""}
                      imageAlt={post.title}
                    />
                  </div>
                ))}
            </div>

            {totalPages > 1 && (
              <div className="fr-mt-4w" style={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={totalPages}
                  defaultPage={currentPage}
                  getPageLinkProps={(page) => ({
                    href: "#",
                    onClick: (e: React.MouseEvent) => {
                      e.preventDefault();
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    },
                  })}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const parentId = process.env.DOCS_NEWS_PARENTID || "";
  const forceRefresh = query?.refresh === "1";

  try {
    const { getDocumentChildren } = await import("@/lib/docs2dsfr/server");
    const allPosts = await getDocumentChildren(parentId, forceRefresh);
    const posts = allPosts.filter(
      (post) => post.document?.frontmatter.date && post.document?.frontmatter.path,
    );
    posts.sort(
      (a, b) =>
        new Date(b.document?.frontmatter.date || "").getTime() -
        new Date(a.document?.frontmatter.date || "").getTime(),
    );
    posts.forEach((post) => {
      post.path =
        post.document!.frontmatter.date.substring(0, 10).replace(/\//g, "") +
        "-" +
        post.document!.frontmatter.path;
    });

    const allServices = [
      ...new Set(posts.flatMap((p) => parseTags(p.document?.frontmatter.service))),
    ];
    const allCategories = [
      ...new Set(posts.flatMap((p) => parseTags(p.document?.frontmatter.category))),
    ];

    return {
      props: { posts, allServices, allCategories },
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      props: { posts: [], allServices: [], allCategories: [] },
    };
  }
};
