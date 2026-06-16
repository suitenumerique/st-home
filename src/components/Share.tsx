import { useRouter } from "next/router";

interface ShareProps {
  title: string;
}

export default function Share({ title }: ShareProps) {
  const { asPath } = useRouter();
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${asPath}`;

  const open = (url: string, label: string, w: number, h: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, label, `toolbar=no,location=yes,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h}`);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src="/images/interest-share.svg"
        alt=""
        style={{ maxWidth: "600px", width: "100%" }}
      />
      <div className="fr-share">
        <p className="fr-share__title">Partager la page</p>
        <ul className="fr-btns-group" style={{ justifyContent: "center" }}>
          <li>
            <a
              href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(pageUrl)}`}
              onClick={open(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(pageUrl)}`, "Partager sur Facebook", 600, 450)}
              target="_blank"
              rel="noopener external"
              className="fr-btn--facebook fr-btn"
            >
              Partager sur Facebook
            </a>
          </li>
          <li>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`}
              onClick={open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`, "Partager sur X (anciennement Twitter)", 600, 420)}
              target="_blank"
              rel="noopener external"
              className="fr-btn--twitter-x fr-btn"
            >
              Partager sur X (anciennement Twitter)
            </a>
          </li>
          <li>
            <a
              href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}`}
              onClick={open(`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}`, "Partager sur LinkedIn", 550, 550)}
              target="_blank"
              rel="noopener external"
              className="fr-btn--linkedin fr-btn"
            >
              Partager sur LinkedIn
            </a>
          </li>
          <li>
            <a
              href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(title + " " + pageUrl)}`}
              target="_blank"
              rel="noopener external"
              className="fr-btn--mail fr-btn"
            >
              Partager par email
            </a>
          </li>
          <li>
            <button
              type="button"
              className="fr-btn--copy fr-btn"
              onClick={() => navigator.clipboard.writeText(pageUrl).then(() => alert("Adresse copiée dans le presse papier."))}
            >
              Copier dans le presse-papier
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
