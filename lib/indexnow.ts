export const DEFAULT_INDEXNOW_KEY = '4a5e6f8b9c0d1e2f3a4b5c6d7e8f9a0b';
export const SITE_HOST = 'quanternity.kr';

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * Sends a batch of updated URLs to IndexNow (Naver / Bing / Seznam).
 * https://api.indexnow.org/indexnow
 */
export async function sendIndexNow(urls: string[]): Promise<{ success: boolean; status: number; message: string }> {
  if (!urls || urls.length === 0) {
    return { success: false, status: 400, message: 'No URLs provided' };
  }

  const key = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
  const payload: IndexNowPayload = {
    host: SITE_HOST,
    key: key,
    keyLocation: `https://${SITE_HOST}/${key}.txt`,
    urlList: urls,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const isOk = response.ok || response.status === 200 || response.status === 202;
    return {
      success: isOk,
      status: response.status,
      message: isOk ? `Successfully submitted ${urls.length} URLs to IndexNow` : `IndexNow API returned status ${response.status}`,
    };
  } catch (error: any) {
    console.error('Error sending IndexNow notification:', error);
    return {
      success: false,
      status: 500,
      message: error?.message || 'Failed to connect to IndexNow API',
    };
  }
}
