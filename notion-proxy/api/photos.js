module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const NOTION_TOKEN = process.env.NOTION_INTEGRATION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  
  // Looks at your URL for a tag, defaults to "Inspirational Quotes" if none is provided
  const tagToFilter = req.query.tag || "Hot Chicks";

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
          multi_select: { contains: tagToFilter } 
        }
      })
    });

    if (!response.ok) return res.status(response.status).json({ error: response.statusText });

    const data = await response.json();
    const results = data.results || [];

    // Extract both Image URL and the Page Title
    const extractedData = results.map(page => {
      const filesColumn = page.properties["Files & Media"]?.files;
      if (!filesColumn || filesColumn.length === 0) return null;
      const fileObj = filesColumn[0];
      const url = fileObj?.external?.url || fileObj?.file?.url || fileObj?.url;
      if (!url) return null;

      const titleColumn = page.properties["Name"]?.title;
      const title = (titleColumn && titleColumn.length > 0) ? titleColumn[0].plain_text : "Untitled";

      return { url: url, title: title }; 
    }).filter(Boolean);

    return res.status(200).json(extractedData);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
