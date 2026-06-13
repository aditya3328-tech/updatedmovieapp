const CDN_HOSTS = new Set(["pbcdnw.aoneroom.com"]);

const IMAGE_TYPES = {
  poster: {
    width: 360,
    quality: 80,
    intrinsicWidth: 360,
    intrinsicHeight: 540,
  },
  banner: {
    width: 1200,
    quality: 76,
    intrinsicWidth: 1200,
    intrinsicHeight: 675,
  },
  thumbnail: {
    width: 300,
    quality: 78,
    intrinsicWidth: 300,
    intrinsicHeight: 169,
  },
  avatar: {
    width: 220,
    quality: 78,
    intrinsicWidth: 220,
    intrinsicHeight: 220,
  },
};

const loggedOptimizations = new Set();

function getImageConfig(type) {
  return IMAGE_TYPES[type] || IMAGE_TYPES.poster;
}

function isSupportedCdn(hostname) {
  return CDN_HOSTS.has(hostname);
}

function logOptimization(originalUrl, optimizedUrl) {
  if (!import.meta.env.DEV || originalUrl === optimizedUrl) return;

  const key = `${originalUrl}|${optimizedUrl}`;
  if (loggedOptimizations.has(key)) return;

  loggedOptimizations.add(key);
  console.debug("[imageOptimizer]", {
    originalUrl,
    optimizedUrl,
  });
}

export function optimizeImage(url, type = "poster") {
  if (!url || typeof url !== "string") return url;

  try {
    const parsed = new URL(url);

    if (!isSupportedCdn(parsed.hostname)) {
      return url;
    }

    const config = getImageConfig(type);
    parsed.searchParams.delete("x-oss-process");

    const query = parsed.search ? `${parsed.search}&` : "?";
    const transform = `x-oss-process=image/resize,w_${config.width}/format,webp/quality,Q_${config.quality}`;
    const optimizedUrl = `${parsed.origin}${parsed.pathname}${query}${transform}`;

    logOptimization(url, optimizedUrl);
    return optimizedUrl;
  } catch {
    return url;
  }
}

export function getOptimizedImageProps(url, type = "poster") {
  const config = getImageConfig(type);

  return {
    src: optimizeImage(url, type),
    width: config.intrinsicWidth,
    height: config.intrinsicHeight,
  };
}

export function fallbackToOriginalImage(event, originalUrl) {
  if (!originalUrl || event.currentTarget.dataset.fallbackApplied === "true") {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = originalUrl;
}
