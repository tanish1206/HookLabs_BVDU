import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testPexels() {
  const key = process.env.PEXELS_API_KEY || "JfWftZ3rtdrUktiz4vjUJrED5EYA2JtnNcIJ6ZsVKZoe2xDH7toSotOg";
  if (!key) {
    console.log("No API Key found");
    return;
  }
  
  const query = "science";
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=12`;
  
  const res = await fetch(url, {
    headers: { Authorization: key }
  });
  
  if (!res.ok) {
    console.log("Pexels error:", res.status, await res.text());
    return;
  }
  
  const data = await res.json();
  console.log(`Total results: ${data.total_results}`);
  console.log(`Returned videos length: ${data.videos?.length}`);
  
  if (data.videos) {
    let truePortraitCount = 0;
    data.videos.forEach((v: any, i: number) => {
      const portraitFiles = (v.video_files || []).filter((f: any) => f.height > f.width);
      console.log(`Video ${i} (${v.id}): Base ${v.width}x${v.height}, Portrait files: ${portraitFiles.length}/${v.video_files?.length}`);
      if (portraitFiles.length > 0) truePortraitCount++;
    });
    console.log(`Videos with at least 1 portrait file: ${truePortraitCount} out of ${data.videos.length}`);
  }
}

testPexels().catch(console.error);
