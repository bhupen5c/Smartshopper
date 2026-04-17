/**
 * Top Australian postcodes → { suburb, lat, lng }.
 * Covers major metro areas in NSW, VIC, QLD, SA, WA, ACT, TAS.
 */
export interface PostcodeEntry {
  postcode: string;
  suburb: string;
  lat: number;
  lng: number;
}

export const POSTCODES: Record<string, PostcodeEntry> = {
  // --- NSW ---
  '2000': { postcode: '2000', suburb: 'Sydney CBD', lat: -33.8688, lng: 151.2093 },
  '2010': { postcode: '2010', suburb: 'Surry Hills', lat: -33.8833, lng: 151.2111 },
  '2017': { postcode: '2017', suburb: 'Waterloo', lat: -33.9006, lng: 151.2093 },
  '2020': { postcode: '2020', suburb: 'Mascot', lat: -33.9260, lng: 151.1935 },
  '2026': { postcode: '2026', suburb: 'Bondi', lat: -33.8915, lng: 151.2767 },
  '2031': { postcode: '2031', suburb: 'Randwick', lat: -33.9145, lng: 151.2416 },
  '2040': { postcode: '2040', suburb: 'Leichhardt', lat: -33.8837, lng: 151.1573 },
  '2042': { postcode: '2042', suburb: 'Newtown', lat: -33.8976, lng: 151.1795 },
  '2060': { postcode: '2060', suburb: 'North Sydney', lat: -33.8382, lng: 151.2073 },
  '2065': { postcode: '2065', suburb: 'Crows Nest', lat: -33.8260, lng: 151.2052 },
  '2067': { postcode: '2067', suburb: 'Chatswood', lat: -33.7963, lng: 151.1832 },
  '2077': { postcode: '2077', suburb: 'Hornsby', lat: -33.7028, lng: 151.0993 },
  '2100': { postcode: '2100', suburb: 'Brookvale', lat: -33.7688, lng: 151.2700 },
  '2113': { postcode: '2113', suburb: 'Macquarie Park', lat: -33.7766, lng: 151.1233 },
  '2140': { postcode: '2140', suburb: 'Homebush', lat: -33.8659, lng: 151.0875 },
  '2145': { postcode: '2145', suburb: 'Westmead', lat: -33.8026, lng: 150.9873 },
  '2150': { postcode: '2150', suburb: 'Parramatta', lat: -33.8151, lng: 151.0011 },
  '2170': { postcode: '2170', suburb: 'Liverpool', lat: -33.9200, lng: 150.9238 },
  '2200': { postcode: '2200', suburb: 'Bankstown', lat: -33.9176, lng: 151.0352 },
  '2220': { postcode: '2220', suburb: 'Hurstville', lat: -33.9674, lng: 151.1003 },
  '2230': { postcode: '2230', suburb: 'Cronulla', lat: -34.0555, lng: 151.1534 },
  // --- VIC ---
  '3000': { postcode: '3000', suburb: 'Melbourne CBD', lat: -37.8136, lng: 144.9631 },
  '3003': { postcode: '3003', suburb: 'West Melbourne', lat: -37.8068, lng: 144.9431 },
  '3008': { postcode: '3008', suburb: 'Docklands', lat: -37.8143, lng: 144.9468 },
  '3053': { postcode: '3053', suburb: 'Carlton', lat: -37.7996, lng: 144.9669 },
  '3056': { postcode: '3056', suburb: 'Brunswick', lat: -37.7665, lng: 144.9596 },
  '3065': { postcode: '3065', suburb: 'Fitzroy', lat: -37.7989, lng: 144.9780 },
  '3108': { postcode: '3108', suburb: 'Doncaster', lat: -37.7836, lng: 145.1267 },
  '3121': { postcode: '3121', suburb: 'Richmond', lat: -37.8218, lng: 144.9995 },
  '3141': { postcode: '3141', suburb: 'South Yarra', lat: -37.8387, lng: 144.9920 },
  '3145': { postcode: '3145', suburb: 'Caulfield', lat: -37.8773, lng: 145.0228 },
  '3168': { postcode: '3168', suburb: 'Clayton', lat: -37.9213, lng: 145.1192 },
  '3199': { postcode: '3199', suburb: 'Frankston', lat: -38.1431, lng: 145.1261 },
  // --- QLD ---
  '4000': { postcode: '4000', suburb: 'Brisbane CBD', lat: -27.4698, lng: 153.0251 },
  '4006': { postcode: '4006', suburb: 'Fortitude Valley', lat: -27.4560, lng: 153.0360 },
  '4051': { postcode: '4051', suburb: 'Alderley', lat: -27.4248, lng: 153.0053 },
  '4059': { postcode: '4059', suburb: 'Kelvin Grove', lat: -27.4498, lng: 153.0108 },
  '4101': { postcode: '4101', suburb: 'South Brisbane', lat: -27.4809, lng: 153.0175 },
  '4120': { postcode: '4120', suburb: 'Greenslopes', lat: -27.5056, lng: 153.0474 },
  '4152': { postcode: '4152', suburb: 'Camp Hill', lat: -27.4908, lng: 153.0744 },
  '4170': { postcode: '4170', suburb: 'Cannon Hill', lat: -27.4697, lng: 153.0882 },
  '4215': { postcode: '4215', suburb: 'Southport', lat: -27.9667, lng: 153.3993 },
  '4217': { postcode: '4217', suburb: 'Surfers Paradise', lat: -28.0027, lng: 153.4300 },
  // --- SA ---
  '5000': { postcode: '5000', suburb: 'Adelaide CBD', lat: -34.9285, lng: 138.6007 },
  '5006': { postcode: '5006', suburb: 'North Adelaide', lat: -34.9059, lng: 138.5930 },
  '5031': { postcode: '5031', suburb: 'Mile End', lat: -34.9262, lng: 138.5690 },
  '5067': { postcode: '5067', suburb: 'Norwood', lat: -34.9218, lng: 138.6340 },
  // --- WA ---
  '6000': { postcode: '6000', suburb: 'Perth CBD', lat: -31.9505, lng: 115.8605 },
  '6005': { postcode: '6005', suburb: 'West Perth', lat: -31.9480, lng: 115.8417 },
  '6050': { postcode: '6050', suburb: 'Mount Lawley', lat: -31.9326, lng: 115.8711 },
  '6100': { postcode: '6100', suburb: 'Victoria Park', lat: -31.9754, lng: 115.8944 },
  '6160': { postcode: '6160', suburb: 'Fremantle', lat: -32.0569, lng: 115.7439 },
  // --- ACT ---
  '2600': { postcode: '2600', suburb: 'Canberra', lat: -35.2809, lng: 149.1300 },
  '2601': { postcode: '2601', suburb: 'Civic', lat: -35.2802, lng: 149.1310 },
  '2602': { postcode: '2602', suburb: 'Braddon', lat: -35.2677, lng: 149.1350 },
  '2612': { postcode: '2612', suburb: 'Campbell', lat: -35.2874, lng: 149.1530 },
  '2614': { postcode: '2614', suburb: 'Aranda', lat: -35.2560, lng: 149.0810 },
  '2615': { postcode: '2615', suburb: 'Holt', lat: -35.2290, lng: 149.0130 },
  '2617': { postcode: '2617', suburb: 'Bruce', lat: -35.2440, lng: 149.0890 },
  '2900': { postcode: '2900', suburb: 'Greenway', lat: -35.4160, lng: 149.0660 },
  '2903': { postcode: '2903', suburb: 'Wanniassa', lat: -35.3910, lng: 149.0870 },
  '2904': { postcode: '2904', suburb: 'Gordon', lat: -35.4130, lng: 149.0870 },
  '2905': { postcode: '2905', suburb: 'Bonython', lat: -35.4330, lng: 149.0780 },
  '2906': { postcode: '2906', suburb: 'Banks', lat: -35.4720, lng: 149.1000 },
  '2611': { postcode: '2611', suburb: 'Weston Creek', lat: -35.3400, lng: 149.0530 },
  '2607': { postcode: '2607', suburb: 'Deakin', lat: -35.3160, lng: 149.1040 },
  '2913': { postcode: '2913', suburb: 'Gungahlin', lat: -35.1850, lng: 149.1340 },
  '2914': { postcode: '2914', suburb: 'Amaroo', lat: -35.1700, lng: 149.1260 },
  // --- TAS ---
  '7000': { postcode: '7000', suburb: 'Hobart', lat: -42.8821, lng: 147.3272 },
  '7250': { postcode: '7250', suburb: 'Launceston', lat: -41.4332, lng: 147.1441 },
};

/**
 * Fallback: estimate location from postcode range for any valid AU postcode.
 * Maps the first digit to a state capital as a rough approximation.
 */
const STATE_FALLBACKS: Record<string, PostcodeEntry> = {
  '1': { postcode: '', suburb: 'Sydney region', lat: -33.8688, lng: 151.2093 },
  '2': { postcode: '', suburb: 'NSW / ACT', lat: -33.8688, lng: 151.2093 },
  '3': { postcode: '', suburb: 'Victoria', lat: -37.8136, lng: 144.9631 },
  '4': { postcode: '', suburb: 'Queensland', lat: -27.4698, lng: 153.0251 },
  '5': { postcode: '', suburb: 'South Australia', lat: -34.9285, lng: 138.6007 },
  '6': { postcode: '', suburb: 'Western Australia', lat: -31.9505, lng: 115.8605 },
  '7': { postcode: '', suburb: 'Tasmania', lat: -42.8821, lng: 147.3272 },
  '0': { postcode: '', suburb: 'Northern Territory', lat: -12.4634, lng: 130.8456 },
};

/**
 * Look up a postcode. Falls back to state-capital estimate for any valid
 * 4-digit AU postcode not in the hardcoded list.
 */
export function lookupPostcode(postcode: string): PostcodeEntry | undefined {
  const trimmed = postcode.trim();

  // Exact match
  if (POSTCODES[trimmed]) return POSTCODES[trimmed];

  // Valid AU postcode format but not in list → approximate
  if (/^\d{4}$/.test(trimmed)) {
    const firstDigit = trimmed[0]!;
    const fallback = STATE_FALLBACKS[firstDigit];
    if (fallback) {
      return { ...fallback, postcode: trimmed, suburb: `${fallback.suburb} (${trimmed})` };
    }
  }

  return undefined;
}
