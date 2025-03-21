import { visit } from "unist-util-visit";

const ALERT_TYPES = {
  NOTE: undefined,
  TIP: "green-menthe",
  IMPORTANT: "orange-terre-battue",
  WARNING: "yellow-tournesol",
  CAUTION: "pink-macaron",
};

export default function remarkAlerts() {
  return (tree) => {
    visit(tree, "blockquote", (node) => {
      // Get the text content of the first paragraph to match the alert type with GitHub syntax.
      // https://github.com/orgs/community/discussions/16925
      const firstParagraph = node.children[0];
      if (
        !firstParagraph ||
        firstParagraph.type !== "paragraph" ||
        firstParagraph.children.length === 0
      )
        return;

      const text = firstParagraph.children[0].value;
      if (!text) return;

      const match = text.match(/^\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);
      if (!match) return;

      // Clean the text
      firstParagraph.children[0].value = text.replace(
        /^\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/,
        "",
      );

      // Transform the node into a DSFR <CallOut />
      node.type = "mdxJsxFlowElement";
      node.name = "CallOut";
      node.attributes = [
        {
          type: "mdxJsxAttribute",
          name: "colorVariant",
          value: ALERT_TYPES[match[1]] || "undefined",
        },
      ];

      node.children = firstParagraph.children;
    });
  };
}
