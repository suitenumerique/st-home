import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { ReactNode } from "react";

export type Faq = {
  question: ReactNode;
  answer: ReactNode;
};

type FaqListProps = {
  faqs: Faq[];
  titleAs?: `h${2 | 3 | 4 | 5 | 6}`;
};

export default function FaqList({ faqs, titleAs }: FaqListProps) {
  return (
    <>
      {faqs.map((faq, index) => (
        <Accordion key={index} label={faq.question} titleAs={titleAs || "h3"}>
          {faq.answer as NonNullable<ReactNode>}
        </Accordion>
      ))}
    </>
  );
}
