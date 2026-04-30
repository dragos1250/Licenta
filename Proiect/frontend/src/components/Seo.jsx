import { Helmet } from "react-helmet-async";

const SITE_NAME = "ConfigEXP";

const DEFAULT_DESCRIPTION =
  "ConfigEXP te ajută să alegi componente PC compatibile, să creezi configurații personalizate și să comanzi rapid piesele potrivite pentru build-ul tău.";

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = "/configexp-favicon.svg",
  type = "website",
  noIndex = false,
}) {
  const pageTitle = title ? `${SITE_NAME} - ${title}` : SITE_NAME;

  const canonicalUrl =
    typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  return (
    <Helmet>
      <title>{pageTitle}</title>

      <meta name="description" content={description} />
      <meta name="theme-color" content="#020617" />

      {noIndex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
