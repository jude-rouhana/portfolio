// Utility function to properly encode asset URLs
export const getAssetUrl = (path) => {
  // Remove leading slash if present and encode the path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `/${encodeURIComponent(cleanPath).replace(/%2F/g, '/')}`
}

// Alternative function for paths that might already be partially encoded
export const getSafeAssetUrl = (path) => {
  // Split the path and encode each part separately
  const parts = path.split('/')
  const encodedParts = parts.map(part => encodeURIComponent(part))
  return `/${encodedParts.join('/')}`
}
