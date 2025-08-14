import BackToTop from "@/components/BackToTop";
import { DocsChild, DocumentContent } from "@/lib/docs2dsfr/client";
import { fr } from "@codegouvfr/react-dsfr";
import { SideMenu, SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import NextLink from "next/link";

export default function ServicesPage({ sections }: { sections: DocsChild[] }) {
  // Add smooth scrolling behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <>
      <NextSeo
        title="Services numériques"
        description="Les services numériques de la Suite territoriale"
      />
      <div className={fr.cx("fr-container", "fr-my-6w")}>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
          {/* Sidebar */}
          <div className={fr.cx("fr-col-12", "fr-col-md-3")}>
            <SideMenu
              sticky
              align="left"
              burgerMenuButtonText="Services"
              items={sections.map((section) => {
                const ret: SideMenuProps.Item.Link = {
                  isActive: false,
                  linkProps: {
                    href: `#${section.document?.frontmatter.path}`,
                  },
                  text: section.title,
                };
                if (section.children.length === 0) return ret;

                const retWithItems: SideMenuProps.Item.SubMenu = {
                  ...ret,
                  items: section.children.map((child) => ({
                    isActive: false,
                    linkProps: {
                      href: `#${child.document?.frontmatter.path}`,
                    },
                    text: child.title,
                  })),
                };
                return retWithItems;
              })}
            />
          </div>

          {/* Main Content */}
          <div className={fr.cx("fr-col-12", "fr-col-md-9")}>
            {sections.map((section) => (
              <>
                <section
                  key={section.id}
                  id={section.document?.frontmatter.path}
                  className={fr.cx("fr-mb-8w") + " services-section"}
                >
                  <h1>{section.document?.frontmatter.title || section.title}</h1>
                  {section.document?.frontmatter.summary && (
                    <p className={fr.cx("fr-text--lead")}>
                      {section.document?.frontmatter.summary}
                    </p>
                  )}
                  <DocumentContent document={section.document} />
                </section>
                {section.children.map((service) => (
                  <section
                    key={service.id}
                    id={service.document?.frontmatter.path}
                    className={fr.cx("fr-mb-8w") + " services-section"}
                  >
                    <h2>{service.document?.frontmatter.title || service.title}</h2>
                    {service.document?.frontmatter.summary && (
                      <p className={fr.cx("fr-text--lead")}>
                        {service.document?.frontmatter.summary}
                      </p>
                    )}
                    {service.document?.frontmatter.url && (
                      <p>
                        <NextLink className={fr.cx("fr-link")} target="_blank" href={service.document?.frontmatter.url.replace(/<[^>]*>?/g, "")}>
                          {service.document?.frontmatter.url.replace(/<[^>]*>?/g, "")}
                        </NextLink>
                      </p>
                    )}
                    <DocumentContent document={service.document} />
                  </section>
                ))}
              </>
            ))}

            <BackToTop />
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const parentId = process.env.DOCS_SERVICES_PARENTID || "";
  const forceRefresh = query?.refresh === "1";

  try {
    const { getDocumentChildren } = await import("@/lib/docs2dsfr/server");
    const sections = await getDocumentChildren(parentId, forceRefresh);

    for (const section of sections) {
      section.children = await getDocumentChildren(section.id, forceRefresh);
    }

    return {
      props: {
        sections,
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
