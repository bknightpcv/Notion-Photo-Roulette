module.exports = async (req, res) => {
  // 1. Establish permissive CORS policies
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle standard browser preflight checks
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Map Vercel environment variables
  const NOTION_TOKEN = process.env.NOTION_INTEGRATION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const notionUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    // 3. Query Notion API
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
          multi_select: {
            contains: "Hot Chicks" 
          }
        }
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Notion API Error: ${response.statusText}` });
    }

    const data = await response.json();
    const results = data.results || [];

    // 4. Extract Images
    const images = results.map(page => {
      const filesColumn = page.properties["Files & Media"]?.files;
      if (!filesColumn || filesColumn.length === 0) return null;
      
      const fileObj = filesColumn[0];
      return fileObj?.external?.url || fileObj?.file?.url || fileObj?.url;
    }).filter(Boolean);

    // 5. Send URLs to frontend
    return res.status(200).json(images);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
