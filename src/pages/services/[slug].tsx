import ServiceBanner from "@/components/services/ServiceBanner";
import ServiceCases from "@/components/services/ServiceCases";
import ServiceCriteria from "@/components/services/ServiceCriteria";
import ServiceFaq from "@/components/services/ServiceFaq";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ServiceFoundations from "@/components/services/ServiceFoundations";
import ServiceHelp from "@/components/services/ServiceHelp";
import ServiceHero from "@/components/services/ServiceHero";
import ServicePartners from "@/components/services/ServicePartners";
import ServiceProConnect from "@/components/services/ServiceProConnect";
import ServiceShowcase from "@/components/services/ServiceShowcase";
import ServiceSteps from "@/components/services/ServiceSteps";
import ServiceTestimonials from "@/components/services/ServiceTestimonials";
import ServiceTrial from "@/components/services/ServiceTrial";
import { getServicePage, getServicePageSlugs } from "@/lib/services";
import { countAdoptingOrganizations } from "@/lib/services/deployment";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";
import { Fragment } from "react";

type ServicePageProps = {
  slug: string;
  adoptionCount: number | null;
};

export default function ServicePage({ slug, adoptionCount }: ServicePageProps) {
  const service = getServicePage(slug);

  if (!service) return null;

  return (
    <Fragment key={service.slug}>
      <NextSeo title={service.seo.title} description={service.seo.description} />

      <ServiceHero hero={service.hero} />

      {service.showcase && <ServiceShowcase block={service.showcase} />}

      {service.cases && <ServiceCases block={service.cases} />}

      {service.criteria && <ServiceCriteria block={service.criteria} />}

      {service.steps && <ServiceSteps block={service.steps} />}

      {service.banner && <ServiceBanner block={service.banner} />}

      {service.partners && <ServicePartners block={service.partners} />}

      {service.help && <ServiceHelp block={service.help} />}

      {service.features && <ServiceFeatures block={service.features} />}

      {service.proConnect !== false && <ServiceProConnect service={service} />}

      {service.testimonials && (
        <ServiceTestimonials block={service.testimonials} adoptionCount={adoptionCount} />
      )}

      {service.foundations !== false && (
        <ServiceFoundations repositoryUrl={service.repositoryUrl} />
      )}

      {service.faq && <ServiceFaq block={service.faq} />}

      <ServiceTrial service={service} />
    </Fragment>
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
