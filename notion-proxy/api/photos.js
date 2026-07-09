export default async function handler(req, res) {
  // 1. Establish permissive CORS policies so your HTML widget can fetch data across domains safely
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle standard browser preflight safety handshakes
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Map the structural reference identifiers pointing to your hidden Vercel panel environment variables
  const NOTION_TOKEN = process.env.NOTION_INTEGRATION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const notionUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    // 3. Issue a POST query out to the official Notion API specifying your space-inclusive tag rule
    const response = await fetch(notionUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28", // Target compliance API version lock
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: {
          property: "Tags", // Column header name inside your Notion collection (case-sensitive)
          multi_select: {
            contains: "Hot Chicks" // Hardcoded multi-select criteria containing spaces
          }
        }
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Notion API Error: ${response.statusText}` });
    }

    const data = await response.json();
    const results = data.results || [];

    // 4. Map the matching document array entries and safely isolate attachment links from "Files & Media"
    const images = results.map(page => {
      const filesColumn = page.properties["Files & Media"]?.files;
      if (!filesColumn || filesColumn.length === 0) return null;
      
      const fileObj = filesColumn[0];
      // Checks standard nested JSON properties where Notion updates direct attachments vs external links
      return fileObj?.external?.url || fileObj?.file?.url || fileObj?.url;
    }).filter(Boolean);

    // 5. Send clean JSON string list of valid URLs right back to the waiting frontend
    return res.status(200).json(images);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}