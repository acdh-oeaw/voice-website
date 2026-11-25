export function createAssetPaths(segment: `/${string}/`) {
	return {
		directory: `./public/assets${segment}`,
		publicPath: `/assets${segment}`,
	};
}

export function createPreviewUrl(previewUrl: string) {
	return previewUrl;
}
