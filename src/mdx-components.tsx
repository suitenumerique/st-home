import { fr } from "@codegouvfr/react-dsfr";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import NextLink from "next/link";
import React, { Fragment } from "react";
import { Step, VerticalStepper } from "./components/VerticalStepper";

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Add table components that use DSFR classes
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <div className={fr.cx("fr-table")}>
        <table {...props} />
      </div>
    ),
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
      const { src, alt, width, height, ...rest } = props;

      if (!src) return null;

      return (
        <Image
          src={src}
          alt={alt || ""}
          width={Number(width) || 800} // Those are only fallback dimensions and will be overridden by the image dimensions in style
          height={Number(height) || 600}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
          {...rest}
        />
      );
    },
    h1: ({ children, ...props }) => (
      <h1 {...props} className={fr.cx("fr-h1")}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 {...props} className={fr.cx("fr-h2", "fr-mt-3w")}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props} className={fr.cx("fr-h3", "fr-mt-3w")}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 {...props} className={fr.cx("fr-h4", "fr-mt-3w")}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 {...props} className={fr.cx("fr-h5", "fr-mt-3w")}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 {...props} className={fr.cx("fr-h6", "fr-mt-3w")}>
        {children}
      </h6>
    ),
    /*p: ({ children }) => (
        <p className={fr.cx("fr-text--md", "fr-mb-2w")}>{children}</p>
    ),*/
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const href = props.href || "";

      // Skip external links
      if (href.match(/^(https?:)?\/\//)) {
        return (
          <NextLink
            {...props}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={fr.cx("fr-link")}
          />
        );
      }

      return <NextLink {...props} href={href} className={fr.cx("fr-link")} />;
    },
    blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
      if (Array.isArray(props.children) && props.children.length === 3) {
        // TODO if blockquote last line starts with "Source:", integrate natively in the Quote component
        return <Quote text={props.children[1]?.props?.children} size="large" />;
      }
      return <blockquote>{props.children}</blockquote>;
    },
    CallOut,
    VerticalStepper,
    Step,
    ...components,
  };
}

/**
 * Avoid unauthorized HTML tags inside p tags. (e.g. no p inside p, no div inside p, etc.)
 */
export const paragraphContentMDXComponents: MDXComponents = {
  p: Fragment,
};
