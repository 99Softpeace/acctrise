const JUSTANOTHERPANEL_UPDATES_URL =
  "https://app.getbeamer.com/news?app_id=yvoprzVa2931&lastView=&tzOffset=0&url=justanotherpanel.com";

export interface JustAnotherPanelUpdates {
  serviceIds: string[];
  postsScanned: number;
  fetchedAt: string;
}

function textContent(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/g, String.fromCharCode(39))
    .replace(/&quot;/gi, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseJustAnotherPanelUpdates(html: string): JustAnotherPanelUpdates {
  const serviceIds = new Set<string>();
  let postsScanned = 0;
  const postPattern =
    /class="feature[^"]*" id="feature\d+"[\s\S]*?<h3 class="featureTitle">([\s\S]*?)<\/h3>[\s\S]*?<div class="featureContent">([\s\S]*?)<div id="feedback/gi;

  for (const match of html.matchAll(postPattern)) {
    const title = textContent(match[1]);
    if (!/service\s+update/i.test(title)) continue;
    postsScanned += 1;

    const content = textContent(match[2]);
    for (const serviceMatch of content.matchAll(/(?<!\d)(\d{1,8})\s*-\s*(?=[A-Za-z])/g)) {
      serviceIds.add(serviceMatch[1]);
    }
  }

  if (!postsScanned || !serviceIds.size) {
    throw new Error("No JustAnotherPanel service updates could be parsed.");
  }

  return {
    serviceIds: [...serviceIds],
    postsScanned,
    fetchedAt: new Date().toISOString()
  };
}

export async function fetchJustAnotherPanelUpdates(): Promise<JustAnotherPanelUpdates> {
  const response = await fetch(JUSTANOTHERPANEL_UPDATES_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent": "Acctrise-Service-Sync/1.0"
    },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`JustAnotherPanel updates feed returned HTTP ${response.status}.`);
  }

  return parseJustAnotherPanelUpdates(await response.text());
}
