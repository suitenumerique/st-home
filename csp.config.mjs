const ContentSecurityPolicy = `
  default-src 'self' *.gouv.fr;
  img-src 'self' data: *.gouv.fr *.cartocdn.com;
  script-src 'self' *.gouv.fr ${process.env.NODE_ENV !== "production" && "'unsafe-eval' 'unsafe-inline'"};
  connect-src 'self' *.gouv.fr *.maplibre.org *.cartocdn.com *.arcgis.com;
  frame-src 'self' *.gouv.fr;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data: blob:;
  worker-src 'self' blob:;
`;

export default ContentSecurityPolicy;
