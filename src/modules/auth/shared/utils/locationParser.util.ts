export async function LocationParser(
  ip: string,
): Promise<{ city: string; country: string }> {
  try {
    if (!ip || ip === '127.0.0.1' || ip.startsWith('::1'))
      return {
        city: 'localhost',
        country: '',
      };
    const res = await fetch(`https://ipwho.is/${ip}/json/`);
    const data = await res.json();
    if (!data)
      return {
        city: 'Unknown',
        country: 'Unknown',
      };
    return {
      city: data.city || '',
      country: data.country || '',
    };
  } catch {
    return {
      city: 'Unknown',
      country: 'Unknown',
    };
  }
}
