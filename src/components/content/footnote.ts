export function createFootnoteReferenceId(count: number): string {
	return `fn-ref-${String(count)}`;
}

export function createFootnoteContentId(count: number): string {
	return `fn-${String(count)}`;
}
