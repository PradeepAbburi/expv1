export interface CountryOption {
  code: string;
  name: string;
  dial: string;
  center: [number, number];
  zoom: number;
  regions: { name: string; coords: [number, number] }[];
}

export const COUNTRIES: CountryOption[] = [
  {
    code: 'IN',
    name: 'India',
    dial: '+91',
    center: [20.5937, 78.9629],
    zoom: 5,
    regions: [
      { name: 'Visakhapatnam, Andhra Pradesh', coords: [17.6868, 83.2185] },
      { name: 'Hyderabad, Telangana', coords: [17.3850, 78.4867] },
      { name: 'Bengaluru, Karnataka', coords: [12.9716, 77.5946] },
      { name: 'Chennai, Tamil Nadu', coords: [13.0827, 80.2707] },
      { name: 'Mumbai, Maharashtra', coords: [19.0760, 72.8777] },
      { name: 'Delhi NCR', coords: [28.6139, 77.2090] },
      { name: 'Kolkata, West Bengal', coords: [22.5726, 88.3639] },
      { name: 'Pune, Maharashtra', coords: [18.5204, 73.8567] },
      { name: 'Ahmedabad, Gujarat', coords: [23.0225, 72.5714] },
      { name: 'Jaipur, Rajasthan', coords: [26.9124, 75.7873] },
      { name: 'Kochi, Kerala', coords: [9.9312, 76.2673] },
      { name: 'Vijayawada, Andhra Pradesh', coords: [16.5062, 80.6480] },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    dial: '+1',
    center: [37.0902, -95.7129],
    zoom: 4,
    regions: [
      { name: 'New York, NY', coords: [40.7128, -74.0060] },
      { name: 'Los Angeles, CA', coords: [34.0522, -118.2437] },
      { name: 'Chicago, IL', coords: [41.8781, -87.6298] },
      { name: 'Houston, TX', coords: [29.7604, -95.3698] },
      { name: 'San Francisco, CA', coords: [37.7749, -122.4194] },
      { name: 'Seattle, WA', coords: [47.6062, -122.3321] },
      { name: 'Miami, FL', coords: [25.7617, -80.1918] },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dial: '+44',
    center: [55.3781, -3.4360],
    zoom: 6,
    regions: [
      { name: 'London, England', coords: [51.5074, -0.1278] },
      { name: 'Manchester, England', coords: [53.4808, -2.2426] },
      { name: 'Birmingham, England', coords: [52.4862, -1.8904] },
      { name: 'Edinburgh, Scotland', coords: [55.9533, -3.1883] },
      { name: 'Glasgow, Scotland', coords: [55.8642, -4.2518] },
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dial: '+971',
    center: [23.4241, 53.8478],
    zoom: 7,
    regions: [
      { name: 'Dubai', coords: [25.2048, 55.2708] },
      { name: 'Abu Dhabi', coords: [24.4539, 54.3773] },
      { name: 'Sharjah', coords: [25.3463, 55.4209] },
      { name: 'Ajman', coords: [25.4052, 55.5136] },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    dial: '+1',
    center: [56.1304, -106.3468],
    zoom: 4,
    regions: [
      { name: 'Toronto, ON', coords: [43.6532, -79.3832] },
      { name: 'Vancouver, BC', coords: [49.2827, -123.1207] },
      { name: 'Montreal, QC', coords: [45.5017, -73.5673] },
      { name: 'Calgary, AB', coords: [51.0447, -114.0719] },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    dial: '+61',
    center: [-25.2744, 133.7751],
    zoom: 4,
    regions: [
      { name: 'Sydney, NSW', coords: [-33.8688, 151.2093] },
      { name: 'Melbourne, VIC', coords: [-37.8136, 144.9631] },
      { name: 'Brisbane, QLD', coords: [-27.4698, 153.0251] },
      { name: 'Perth, WA', coords: [-31.9505, 115.8605] },
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    dial: '+65',
    center: [1.3521, 103.8198],
    zoom: 11,
    regions: [
      { name: 'Central Area, Singapore', coords: [1.2897, 103.8501] },
      { name: 'Jurong, Singapore', coords: [1.3329, 103.7436] },
      { name: 'Tampines, Singapore', coords: [1.3533, 103.9452] },
      { name: 'Woodlands, Singapore', coords: [1.4382, 103.7891] },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    dial: '+49',
    center: [51.1657, 10.4515],
    zoom: 6,
    regions: [
      { name: 'Berlin', coords: [52.5200, 13.4050] },
      { name: 'Munich', coords: [48.1351, 11.5820] },
      { name: 'Frankfurt', coords: [50.1109, 8.6821] },
      { name: 'Hamburg', coords: [53.5511, 9.9937] },
    ],
  },
];
