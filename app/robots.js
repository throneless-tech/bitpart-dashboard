export default function robots() {
  return {
    rules: {
      userAgent: "*",
      // allow: "/",
      disallow: ["/", "/create/", "/my-bots/"],
    },
    sitemap: "https://bitp.art/sitemap.xml",
  };
}
