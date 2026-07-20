<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { 
            width: 100%; height: 100%; overflow: hidden; 
            background-color: #f5f5f5; display: flex; 
            justify-content: center; align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #status-box {
            padding: 20px; background: white; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;
            max-width: 80%; color: #333; font-size: 14px;
        }
        img { 
            max-width: 100%; max-height: 100%; object-fit: cover; 
            border-radius: 8px; display: none; /* Hidden until loaded */
        }
    </style>
</head>
<body>
    
    <div id="status-box">⏳ 1. Connecting to Vercel API...</div>
    <img id="random-image" alt="">

    <script>
        const API_ENDPOINT = "/api/photos?tag=Inspirational+Quotes"; 
        const statusBox = document.getElementById('status-box');
        const img = document.getElementById('random-image');

        async function loadImg() {
            try {
                statusBox.innerHTML = "⏳ 2. Fetching photos from Notion API...";
                const res = await fetch(API_ENDPOINT);
                
                if (!res.ok) {
                    statusBox.innerHTML = `❌ <b>API Error:</b> Server returned HTTP ${res.status}. Check your Vercel Environment Variables!`;
                    return;
                }
                
                const items = await res.json();
                
                if (!items || items.length === 0) {
                    statusBox.innerHTML = `⚠️ <b>0 Photos Found!</b><br>The API works, but Notion returned an empty list <code>[]</code>.<br><br><b>Fix:</b> Check that your tag in Notion is spelled exactly <code>Inspirational Quotes</code> and that your image column is named <code>Files & Media</code>.`;
                    return;
                }
                
                statusBox.innerHTML = `✅ Found ${items.length} photos! Selecting one...`;
                const selectedItem = items[Math.floor(Math.random() * items.length)];
                
                // Broadcast title to name.html
                localStorage.setItem('shared_photo_name', selectedItem.title);
                
                statusBox.innerHTML = `⏳ 3. Downloading image from:<br><code style="font-size:11px;word-break:break-all;">${selectedItem.url}</code>`;
                
                img.src = selectedItem.url;
                
                img.onload = () => {
                    statusBox.style.display = 'none'; // Hide status text
                    img.style.display = 'block';      // Reveal photo!
                };
                
                img.onerror = () => {
                    statusBox.innerHTML = `❌ <b>Image Load Failed!</b><br>The image URL was found, but your browser refused to draw it.<br><br><b>Why:</b> If this is a direct Notion upload, AWS S3 is blocking the iframe embed.<br><b>Fix:</b> Try pasting a direct external image URL (like from Unsplash or Imgur) into your Notion database row instead!`;
                };

            } catch (e) { 
                statusBox.innerHTML = `❌ <b>Network Error:</b> ${e.message}`;
            }
        }
        
        window.onload = loadImg;
    </script>
</body>
</html>
