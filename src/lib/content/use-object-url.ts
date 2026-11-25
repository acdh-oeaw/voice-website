/* oxlint-disable react/set-state-in-effect -- Synchronize state with browser object URLs and revoke them on cleanup. */

import { useEffect, useState } from "react";

/** @see https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/form/fields/image/ui.tsx#L48-L63 */
export function useObjectUrl(data: Uint8Array | null, contentType: string | undefined) {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (data) {
			const url = URL.createObjectURL(new Blob([Uint8Array.from(data)], { type: contentType }));
			setUrl(url);
			return () => {
				URL.revokeObjectURL(url);
			};
		} else {
			setUrl(null);
			return undefined;
		}
	}, [contentType, data]);

	return url;
}
