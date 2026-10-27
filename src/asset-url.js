// Resolve public assets under both localhost and GitHub Pages project paths.
export const assetUrl = path => import.meta.env.BASE_URL + path.replace(/^\//, '');
