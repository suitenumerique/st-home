import ContactUs from "@/components/ContactUs";
import { DocumentContent, type DocsContentResponse } from "@/lib/docs2dsfr/client";
import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

interface BlogPostProps {
  document: DocsContentResponse;
}

export default function BlogPostPage({ document }: BlogPostProps) {
  return (
    <div className={fr.cx("fr-container", "fr-pt-2w")}>
      <NextSeo
        title={document.title}
        description={document.frontmatter.summary || ""}
        openGraph={{
          title: document.title,
          description: document.frontmatter.summary || "",
          images: [
            {
              url: document.frontmatter.image || "",
            },
          ],
        }}
      />

      <Breadcrumb
        segments={[
          { label: "Accueil", linkProps: { href: "/" } },
          { label: "Actualités", linkProps: { href: "/actualites" } },
        ]}
        currentPageLabel={document.title}
      />

      <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
        <div className={fr.cx("fr-col-12", "fr-col-lg-8")}>
          <article>
            <header className={fr.cx("fr-mb-6w")}>
              <h1 className={fr.cx("fr-h1")}>{document.title}</h1>
              <div
                className={fr.cx("fr-text--sm", "fr-mb-2w")}
                style={{ color: "var(--text-mention-grey)" }}
              >
                Publié le{" "}
                {new Date(document.frontmatter.date).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </div>
            </header>

            <div className={fr.cx("fr-text--lg")}>
              <DocumentContent document={document} />
            </div>
          </article>
        </div>
      </div>

      <div className={fr.cx("fr-my-12w")}>
        <div className={fr.cx("fr-grid-row")}>
          <div className={fr.cx("fr-col-offset-lg-2", "fr-col-lg-8")}>
            <ContactUs />
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const docId = params?.slug as string;
  const parentId = process.env.DOCS_NEWS_PARENTID || "";
  const forceRefresh = query?.refresh === "1";

  if (!docId) {
    return {
      notFound: true,
    };
  }

  try {
    // Must fetch all docs to get from path :-/
    // This will be cached however. The bottleneck here is that we have all the content in RAM.
    const { getDocumentChildren } = await import("@/lib/docs2dsfr/server");
    const children = await getDocumentChildren(parentId, forceRefresh);
    //const document = await getDocument(docId);

    let document;
    for (const child of children) {
      if (child.document?.frontmatter.path == docId || child.id == docId) {
        document = child.document;
      }
    }
    if (!document) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        document,
      },
    };
  } catch (error) {
    console.error(`Error fetching document ${docId}:`, error);
    return {
      notFound: true,
    };
  }
};
