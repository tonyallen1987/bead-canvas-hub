import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-69CT71EHDP";

export function initGA() {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

export function trackPageView(path: string) {
  ReactGA.send({ hitType: "pageview", page: path });
}

export function trackGeneratePattern(method: string, gridSize: number) {
  ReactGA.event("generate_pattern", {
    method,
    grid_size: gridSize,
  });
}
