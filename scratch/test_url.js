function extractNameFromLink(urlStr) {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return null;
    
    let parsedUrlStr = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      parsedUrlStr = 'https://' + trimmed;
    }
    
    const url = new URL(parsedUrlStr);
    const hostname = url.hostname.toLowerCase();
    
    // 1. Instagram
    if (hostname.includes('instagram.com')) {
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        if (!['p', 'reel', 'stories', 'explore', 'direct'].includes(username.toLowerCase())) {
          return decodeURIComponent(username);
        }
      }
    }
    
    // 2. Facebook
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        if (!['groups', 'pages', 'people', 'profile.php', 'share', 'sharer'].includes(username.toLowerCase())) {
          return decodeURIComponent(username);
        }
        if (username.toLowerCase() === 'profile.php') {
          const id = url.searchParams.get('id');
          if (id) return id;
        }
      }
    }

    // 3. TikTok
    if (hostname.includes('tiktok.com')) {
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const username = segments[0];
        if (username.startsWith('@')) {
          return decodeURIComponent(username.substring(1));
        }
        return decodeURIComponent(username);
      }
    }

    // 4. Fallback for other URLs
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const firstSegment = segments[0];
      if (firstSegment.length > 2 && !firstSegment.includes('.')) {
        return decodeURIComponent(firstSegment);
      }
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

const testUrl = "https://www.instagram.com/lana_fashion.store?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
console.log(`${testUrl} -> ${extractNameFromLink(testUrl)}`);
