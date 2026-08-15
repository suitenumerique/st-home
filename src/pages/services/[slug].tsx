import ServiceFaq from "@/components/services/ServiceFaq";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServiceFoundations from "@/components/services/ServiceFoundations";
import ServiceHero from "@/components/services/ServiceHero";
import ServiceProConnect from "@/components/services/ServiceProConnect";
import ServiceTestimonials from "@/components/services/ServiceTestimonials";
import ServiceTrial from "@/components/services/ServiceTrial";
import { getServicePage, getServicePageSlugs } from "@/lib/services";
// Used only by getStaticProps, so Next keeps it out of the client bundle.
import { countAdoptingOrganizations } from "@/lib/services/deployment";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";

type ServicePageProps = {
  slug: string;
  /** Null when the service declares no id, or when the database was out of reach. */
  adoptionCount: number | null;
};

// Service content is looked up client-side from the registry rather than passed
// through props: the blocks hold ReactNode, which getStaticProps cannot serialize.
// Only the figures read from the database travel through props.
export default function ServicePage({ slug, adoptionCount }: ServicePageProps) {
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

      {service.testimonials && (
        <ServiceTestimonials block={service.testimonials} adoptionCount={adoptionCount} />
      )}

      {service.foundations && <ServiceFoundations block={service.foundations} />}

      {service.faq && <ServiceFaq block={service.faq} />}

      {service.trial && <ServiceTrial block={service.trial} />}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getServicePageSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
});

// Kept in sync with the deployment data without rebuilding: the count moves
// slowly, and a stale figure for an hour is better than a database round-trip
// on every visit.
const REVALIDATE_SECONDS = 3600;

export const getStaticProps: GetStaticProps<ServicePageProps> = async ({ params }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const service = getServicePage(slug);

  if (!service) {
    return { notFound: true };
  }

  const adoptionCount = service.deploymentServiceId
    ? await countAdoptingOrganizations(service.deploymentServiceId)
    : null;

  return { props: { slug, adoptionCount }, revalidate: REVALIDATE_SECONDS };
};
