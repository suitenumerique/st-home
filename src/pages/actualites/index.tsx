import { type DocsChild } from "@/lib/docs2dsfr/client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

const PAGE_SIZE = 9;

interface BlogIndexProps {
  posts: DocsChild[];
  currentPage: number;
  totalPages: number;
}

export default function BlogIndex({ posts, currentPage, totalPages }: BlogIndexProps) {
  return (
    <div className="fr-container fr-pt-2w fr-pb-6w">
      <NextSeo
        title="Actualités"
        description="Découvrez les dernières actualités et nouveautés de la Suite territoriale"
      />

      <Breadcrumb
        segments={[{ label: "Accueil", linkProps: { href: "/" } }]}
        currentPageLabel="Actualités"
      />

      <h1 className="fr-h1">Actualités</h1>
      <p className="fr-text--lg">
        Découvrez les dernières actualités et nouveautés de la Suite territoriale
      </p>

      {posts.length === 0 ? (
        <div className="fr-alert fr-alert--info">
          <p>Aucun article disponible pour le moment.</p>
        </div>
      ) : (
        <>
          <div className="fr-grid-row fr-grid-row--gutters">
            {posts
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
                  start={
                    post.document?.frontmatter.category ? (
                      <Tag as="span" className="fr-mb-2w">
                        {post.document.frontmatter.category}
                      </Tag>
                    ) : undefined
                  }
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
                  href: page === 1 ? "/actualites" : `/actualites?page=${page}`,
                })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const parentId = process.env.DOCS_NEWS_PARENTID || "";
  const forceRefresh = query?.refresh === "1";
  const currentPage = Math.max(1, parseInt((query?.page as string) || "1", 10));

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

    const totalPages = Math.ceil(posts.length / PAGE_SIZE);
    const safePage = Math.min(currentPage, totalPages || 1);
    const paginatedPosts = posts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return {
      props: {
        posts: paginatedPosts,
        currentPage: safePage,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      props: {
        posts: [],
        currentPage: 1,
        totalPages: 0,
      },
    };
  }
};
