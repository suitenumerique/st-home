import ServiceBanner from "@/components/services/ServiceBanner";
import ServiceFaq from "@/components/services/ServiceFaq";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServiceFoundations from "@/components/services/ServiceFoundations";
import ServiceHero from "@/components/services/ServiceHero";
import ServicePartners from "@/components/services/ServicePartners";
import ServiceProConnect from "@/components/services/ServiceProConnect";
import ServiceSteps from "@/components/services/ServiceSteps";
import ServiceTestimonials from "@/components/services/ServiceTestimonials";
import ServiceTrial from "@/components/services/ServiceTrial";
import { getServicePage, getServicePageSlugs } from "@/lib/services";
import { countAdoptingOrganizations } from "@/lib/services/deployment";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";

type ServicePageProps = {
  slug: string;
  adoptionCount: number | null;
};

export default function ServicePage({ slug, adoptionCount }: ServicePageProps) {
  const service = getServicePage(slug);

  if (!service) return null;

  return (
    <>
      <NextSeo title={service.seo.title} description={service.seo.description} />

      <ServiceHero hero={service.hero} />

      {service.steps && <ServiceSteps block={service.steps} />}

      {service.banner && <ServiceBanner block={service.banner} />}

      {service.partners && <ServicePartners block={service.partners} />}

      {service.features && <ServiceFeatures block={service.features} />}

      {/* On every service page but those that opt out: the content lives in the
          component, only the choice to show it belongs to the service. */}
      {service.proConnect !== false && <ServiceProConnect service={service} />}

      {service.testimonials && (
        <ServiceTestimonials block={service.testimonials} adoptionCount={adoptionCount} />
      )}

      {service.foundations !== false && (
        <ServiceFoundations repositoryUrl={service.repositoryUrl} />
      )}

      {service.faq && <ServiceFaq block={service.faq} />}

      <ServiceTrial service={service} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getServicePageSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
});

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
