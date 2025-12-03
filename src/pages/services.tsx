import BackToTop from "@/components/BackToTop";
import { DocsChild, DocumentContent } from "@/lib/docs2dsfr/client";
import { useScrollToHash } from "@/lib/scrollToHash";
import { useActiveSection } from "@/lib/useActiveSection";
import { fr } from "@codegouvfr/react-dsfr";
import { SideMenu, SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import NextLink from "next/link";
import { useEffect } from "react";

export default function ServicesPage({ sections }: { sections: DocsChild[] }) {
  // Use the extracted scrolling hook with custom options for services page
  useScrollToHash({
    onComplete: () => {
      document.documentElement.style.scrollBehavior = "smooth";
    },
  });

  useEffect(() => {
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // Track which section is currently active for SideMenu highlighting
  const sectionIds = sections
    .flatMap((section) => [
      section.document?.frontmatter.path || section.id,
      ...section.children.map((child) => child.document?.frontmatter.path || child.id),
    ])
    .filter(Boolean);

  const activeSection = useActiveSection(sectionIds);

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
                const sectionId = section.document?.frontmatter.path || section.id;
                const isSectionActive = activeSection === sectionId;

                // Check if any child is active
                const hasActiveChild = section.children.some((child) => {
                  const childId = child.document?.frontmatter.path || child.id;
                  return activeSection === childId;
                });

                const ret: SideMenuProps.Item.Link = {
                  isActive: isSectionActive,
                  linkProps: {
                    href: `#${sectionId}`,
                  },
                  text: section.title,
                };
                if (section.children.length === 0) return ret;

                const retWithItems: SideMenuProps.Item.SubMenu = {
                  ...ret,
                  expandedByDefault: hasActiveChild || isSectionActive,
                  items: section.children.map((child) => {
                    const childId = child.document?.frontmatter.path || child.id;
                    return {
                      isActive: activeSection === childId,
                      linkProps: {
                        href: `#${childId}`,
                      },
                      text: child.title,
                    };
                  }),
                };
                return retWithItems;
              })}
            />
          </div>

          {/* Main Content */}
          <div className={fr.cx("fr-col-12", "fr-col-md-9")}>
            {sections.map((section) => (
              <section key={section.id}>
                <section
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
                        <NextLink
                          className={fr.cx("fr-link")}
                          target="_blank"
                          href={service.document?.frontmatter.url.replace(/<[^>]*>?/g, "")}
                        >
                          {service.document?.frontmatter.url.replace(/<[^>]*>?/g, "")}
                        </NextLink>
                      </p>
                    )}
                    <DocumentContent document={service.document} />
                  </section>
                ))}
              </section>
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
    if (!parentId) {
      throw new Error("DOCS_SERVICES_PARENTID is not set");
    }
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
        sections: [],
      },
    };
  }
};
