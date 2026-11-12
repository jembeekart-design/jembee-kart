import "server-only";
import sanitizeHtml from "sanitize-html";

const RICH_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2",
    "h3",
    "h4",
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "title"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
};

export function sanitizeRichHtml(dirtyHtml: string): string {
  return sanitizeHtml(dirtyHtml, RICH_HTML_OPTIONS);
}
