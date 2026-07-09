export default async function handler(req, res) {
  // Set CORS headers immediately so your Notion page can read it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Your secure environment tokens
  const NOTION_TOKEN = process.env.NOTION_INTEGRATION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const notionUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    const response = await fetch(notionUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: {
          property: "Tags", 
          multi_select: { contains: "Hot Chicks" }
        }
      })
    });

    const data = await response.json();
    const results = data.results || [];

    const images = results.map(page => {
      const filesColumn = page.properties["Files & Media"]?.files;
      if (!filesColumn || filesColumn.length === 0) return null;
      return filesColumn[0]?.external?.url || filesColumn[0]?.file?.url || filesColumn[0]?.url;
    }).filter(Boolean);

    return res.status(200).json(images);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}