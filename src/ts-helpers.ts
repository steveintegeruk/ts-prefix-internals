import ts from 'typescript';

/**
 * Returns true if the node has a leading `@__KEY__` block-comment annotation
 * (Terser key annotation), indicating that the caller is intentionally using a
 * dynamic key and renaming / warning suppression should apply.
 *
 * Note: `ts.getLeadingCommentRanges` only finds comments preceded by a newline,
 * so we inspect the raw leading-trivia text instead.
 */
export function hasTerserKeyAnnotation(sf: ts.SourceFile, node: ts.Node): boolean {
  const text = sf.getFullText();
  const leadingTrivia = text.slice(node.getFullStart(), node.getStart(sf));
  return /\/\*\s*@__KEY__\s*\*\//.test(leadingTrivia);
}
