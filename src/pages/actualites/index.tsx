import { type DocsChild } from "@/lib/docs2dsfr/client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

interface BlogIndexProps {
  posts: DocsChild[];
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  return (
    <div className="fr-container fr-pt-2w">
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
        <div className="fr-grid-row fr-grid-row--gutters">
          {posts
            .filter((post) => post.document?.frontmatter.status === "published")
            .map((post) => (
              <div key={post.id} className="fr-col-12 fr-col-md-6 fr-col-lg-4 fr-mb-4w">
                <Card
                  linkProps={{
                    href: `/actualites/${post.document?.frontmatter.path}`,
                    title: post.title,
                  }}
                  enlargeLink={true}
                  title={post.title}
                  titleAs="h2"
                  detail=<>Publié le {post.document?.frontmatter.dateFormatted}</>
                  imageUrl={post.document?.frontmatter.image || ""}
                  imageAlt={post.title}
                  desc={post.document?.frontmatter.summary || ""}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const parentId = process.env.DOCS_NEWS_PARENTID || "";
  const forceRefresh = query?.refresh === "1";

  try {
    const { getDocumentChildren } = await import("@/lib/docs2dsfr/server");
    const posts = await getDocumentChildren(parentId, forceRefresh);
    posts.sort(
      (a, b) =>
        new Date(b.document?.frontmatter.date || "").getTime() -
        new Date(a.document?.frontmatter.date || "").getTime(),
    );

    return {
      props: {
        posts,
      },
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      props: {
        posts: [],
      },
    };
  }
};
