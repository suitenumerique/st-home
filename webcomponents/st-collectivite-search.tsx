import ReactDOM from "react-dom/client";
import CommuneSearch from "../src/components/CommuneSearch";
import "../src/styles/communesearch.css";

type CommuneType = "commune" | "epci" | "departement" | "region" | "all";

type Props = {
  placeholder?: string;
  type?: CommuneType;
  smallButton?: boolean;
  apiBaseUrl?: string;
};

type DomRoot = ReturnType<typeof ReactDOM.createRoot>;

class STCommuneSearchElement extends HTMLElement {
  private root: DomRoot | null = null;

  static get observedAttributes() {
    return ["placeholder", "type", "small-button", "api-url"];
  }

  connectedCallback() {
    if (!this.root) {
      this.root = ReactDOM.createRoot(this);
    }
    this.renderReact();
  }

  attributeChangedCallback() {
    if (this.root) {
      this.renderReact();
    }
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private getPropsFromAttributes(): Props {
    const placeholder = this.getAttribute("placeholder") ?? undefined;
    const typeAttr = (this.getAttribute("type") as CommuneType | null) ?? undefined;
    const smallButton = this.hasAttribute("small-button")
      ? this.getAttribute("small-button") !== "false"
      : false;
    const apiBaseUrl = this.getAttribute("api-url") ?? undefined;

    return {
      placeholder,
      type: typeAttr,
      smallButton,
      apiBaseUrl,
    };
  }

  private renderReact() {
    if (!this.root) return;

    const props = this.getPropsFromAttributes();

    const onSelect = (commune: unknown) => {
      this.dispatchEvent(
        new CustomEvent("select", {
          detail: commune,
          bubbles: true,
          composed: true,
        }),
      );
    };

    this.root.render(
      <>
        <CommuneSearch
          onSelect={onSelect as any}
          placeholder={props.placeholder}
          type={props.type}
          smallButton={props.smallButton}
          apiBaseUrl={props.apiBaseUrl}
          style={{ width: "100%" }}
        />
      </>,
    );
  }
}

if (!customElements.get("st-collectivite-search")) {
  customElements.define("st-collectivite-search", STCommuneSearchElement);
}
