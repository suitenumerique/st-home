// Client-side safe exports from docs2dsfr
import { Fragment, createElement, useEffect, useState } from "react";
import production from "react/jsx-runtime";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import { unified } from "unified";
import { htmlComponents } from "./components";

export interface DocsDocument {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  excerpt?: string;
}

export interface DocsChild {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  excerpt?: string;
  numchild: number;
  document?: DocsContentResponse;
  children: DocsChild[];
  path?: string;
}

export interface DocsChildrenResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocsChild[];
}

export interface DocsContentResponse {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  frontmatter: Record<string, string>;
}

export function DocumentContent({ document }: { document: DocsContentResponse | undefined }) {
  return useProcessor(document?.content || "");
}

function useProcessor(text: string) {
  const [Content, setContent] = useState(createElement(Fragment));

  useEffect(
    function () {
      (async function () {
        const file = await unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeReact, {
            ...production,
            passNode: true,
            components: htmlComponents,
          })
          .process(text);

        setContent(file.result);
      })();
    },
    [text],
  );

  return Content;
}
