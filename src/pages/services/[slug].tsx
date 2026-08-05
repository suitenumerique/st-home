import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceProConnect from "@/components/services/ServiceProConnect";
import { getServicePage, getServicePageSlugs } from "@/lib/services";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";

type ServicePageProps = {
  slug: string;
};

// Service content is looked up client-side from the registry rather than passed
// through props: the blocks hold ReactNode, which getStaticProps cannot serialize.
export default function ServicePage({ slug }: ServicePageProps) {
  const service = getServicePage(slug);

  // Unreachable: getStaticPaths only emits known slugs and getStaticProps 404s
  // on anything else. Kept to narrow the type.
  if (!service) return null;

  return (
    <>
      <NextSeo title={service.seo.title} description={service.seo.description} />

      <ServiceHero hero={service.hero} />

      {service.features && <ServiceFeatures block={service.features} />}

      {service.proConnect && <ServiceProConnect block={service.proConnect} />}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getServicePageSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<ServicePageProps> = ({ params }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";

  if (!getServicePage(slug)) {
    return { notFound: true };
  }

  return { props: { slug } };
};
