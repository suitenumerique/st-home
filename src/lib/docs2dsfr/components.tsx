import FaqList from "@/components/FaqList";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import Image from "next/image";
import React, { ReactNode } from "react";

export const htmlComponents = {
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
    return <Quote text={props.children} size="large" />;
  },
  img: (props: React.ImgHTMLAttributes<HTMLImageElement> & { "data-text-alignment"?: string }) => {
    const { src, alt, width, height } = props;

    if (!src) return null;

    const isFullWidth = !width || Number(width) >= 760;

    const align = props["data-text-alignment"] || "left";

    return (
      <Image
        src={src as string}
        alt={alt || ""}
        loading="eager"
        width={isFullWidth ? 960 : Math.min(Number(width) || 960, 960)}
        height={isFullWidth ? 640 : Math.min(Number(height) || 640, 640)}
        style={
          isFullWidth
            ? {
                width: "100%",
                height: "auto",
              }
            : {
                display: "block",
                marginLeft: align === "center" || align === "right" ? "auto" : "0",
                marginRight: align === "center" || align === "left" ? "auto" : "0",
                maxWidth: "100%",
                height: "auto",
              }
        }
      />
    );
  },
  "accordion-list": (props: React.HTMLAttributes<HTMLDivElement>) => {
    // Questions are <ul><li>question</li></ul>, answers are all <p> nodes in between
    const faqs = [];
    let question: ReactNode | null = null,
      answer: ReactNode[] = [];
    React.Children.forEach(props.children, (child) => {
      if (React.isValidElement(child) && child.type === "ul") {
        if (question) faqs.push({ question, answer: answer.length === 1 ? answer[0] : answer });
        const li = React.Children.toArray(
          (child.props as React.HTMLAttributes<HTMLUListElement>).children,
        )[0];
        question = React.isValidElement(li)
          ? (li.props as React.HTMLAttributes<HTMLLIElement>).children
          : li;
        answer = [];
      } else if (React.isValidElement(child) && child.type === "p") {
        answer.push(child);
      }
    });
    if (question) faqs.push({ question, answer: answer.length === 1 ? answer[0] : answer });

    return <FaqList faqs={faqs} />;
  },

  // // Add table components that use DSFR classes
  // table: (props: React.HTMLAttributes<HTMLTableElement>) => (
  //   <div className={fr.cx("fr-table")}>
  //     <table {...props} />
  //   </div>
  // ),

  // h1: ({ children, ...props }) => (
  //   <h1 {...props} className={fr.cx("fr-h1")}>
  //     {children}
  //   </h1>
  // ),
  // h2: ({ children, ...props }) => (
  //   <h2 {...props} className={fr.cx("fr-h2", "fr-mt-3w")}>
  //     {children}
  //   </h2>
  // ),
  // h3: ({ children, ...props }) => (
  //   <h3 {...props} className={fr.cx("fr-h3", "fr-mt-3w")}>
  //     {children}
  //   </h3>
  // ),
  // h4: ({ children, ...props }) => (
  //   <h4 {...props} className={fr.cx("fr-h4", "fr-mt-3w")}>
  //     {children}
  //   </h4>
  // ),
  // h5: ({ children, ...props }) => (
  //   <h5 {...props} className={fr.cx("fr-h5", "fr-mt-3w")}>
  //     {children}
  //   </h5>
  // ),
  // h6: ({ children, ...props }) => (
  //   <h6 {...props} className={fr.cx("fr-h6", "fr-mt-3w")}>
  //     {children}
  //   </h6>
  // ),
  // a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  //   const href = props.href || "";

  //   // Skip external links
  //   if (href.match(/^(https?:)?\/\//)) {
  //     return (
  //       <NextLink
  //         {...props}
  //         href={href}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         className={fr.cx("fr-link")}
  //       />
  //     );
  //   }

  //   return <NextLink {...props} href={href} className={fr.cx("fr-link")} />;
  // },

  // CallOut,
};
