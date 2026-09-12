import type { Category, CountryConfig } from './types'

export const categoryMeta: Record<Category, { label: string; icon: string; keywords: string[] }> = {
  water: { label: 'Drinking water', icon: 'Water', keywords: ['water', 'tap', 'drinking', 'पानी', 'जल', 'தண்ணீர்', 'குடிநீர்', 'água'] },
  roads: { label: 'Primary roads', icon: 'Route', keywords: ['road', 'street', 'pothole', 'सड़क', 'रास्ता', 'சாலை', 'பாதை', 'rua', 'estrada'] },
  lighting: { label: 'Public lighting', icon: 'Lightbulb', keywords: ['light', 'lamp', 'dark', 'बत्ती', 'रोशनी', 'விளக்கு', 'இருள்', 'luz', 'iluminação'] },
}

export const configs: CountryConfig[] = [
  {
    id: 'IN-TN', country: 'India', state: 'Tamil Nadu', locale: 'ta-IN', language: 'Tamil', currency: 'INR',
    taxonomy: { water: 'குடிநீர் அணுகல்', roads: 'முதன்மை சாலை அணுகல்', lighting: 'பொது விளக்கு பாதுகாப்பு' },
    regions: [
      { id: 'TN-KOV-N', label: 'Kovilpatti North', population: 10_000, category: 'water', coverage: .2, targetCoverage: 1, seededRequests: 30, costMinor: 6_000_000, budgetMinor: 10_000_000, currency: 'INR', project: 'Extend piped-water network', description: 'Synthetic planning fixture · FY 2026' },
      { id: 'TN-SAN-E', label: 'Sankarankovil East', population: 10_000, category: 'water', coverage: .7, targetCoverage: 1, seededRequests: 60, costMinor: 6_000_000, budgetMinor: 10_000_000, currency: 'INR', project: 'Repair community water points', description: 'Synthetic planning fixture · FY 2026' },
      { id: 'TN-TIR-W', label: 'Tirunelveli West', population: 8_000, category: 'lighting', coverage: .46, targetCoverage: .9, seededRequests: 36, costMinor: 3_500_000, budgetMinor: 10_000_000, currency: 'INR', project: 'Install safe-route lighting', description: 'Synthetic planning fixture · FY 2026' },
    ],
  },
  {
    id: 'IN-UP', country: 'India', state: 'Uttar Pradesh', locale: 'hi-IN', language: 'Hindi', currency: 'INR',
    taxonomy: { water: 'पेयजल पहुँच', roads: 'मुख्य सड़क पहुँच', lighting: 'सार्वजनिक प्रकाश सुरक्षा' },
    regions: [
      { id: 'UP-MAH-N', label: 'Mahoba North', population: 12_000, category: 'water', coverage: .38, targetCoverage: 1, seededRequests: 68, costMinor: 5_800_000, budgetMinor: 10_500_000, currency: 'INR', project: 'Rehabilitate village water line', description: 'Synthetic planning fixture · FY 2026' },
      { id: 'UP-CHA-E', label: 'Chitrakoot East', population: 9_000, category: 'roads', coverage: .41, targetCoverage: .85, seededRequests: 54, costMinor: 6_200_000, budgetMinor: 10_500_000, currency: 'INR', project: 'Upgrade all-weather access road', description: 'Synthetic planning fixture · FY 2026' },
      { id: 'UP-HAM-S', label: 'Hamirpur South', population: 11_000, category: 'lighting', coverage: .58, targetCoverage: .9, seededRequests: 28, costMinor: 2_900_000, budgetMinor: 10_500_000, currency: 'INR', project: 'Light school-to-market route', description: 'Synthetic planning fixture · FY 2026' },
    ],
  },
  {
    id: 'BR-PE', country: 'Brazil', state: 'Pernambuco', locale: 'pt-BR', language: 'Portuguese', currency: 'BRL',
    taxonomy: { water: 'acesso à água potável', roads: 'acesso viário primário', lighting: 'iluminação pública segura' },
    regions: [
      { id: 'BR-REC-N', label: 'Recife Norte', population: 10_000, category: 'water', coverage: .28, targetCoverage: 1, seededRequests: 42, costMinor: 610_000, budgetMinor: 1_000_000, currency: 'BRL', project: 'Expandir rede de água', description: 'Synthetic planning fixture · FY 2026' },
      { id: 'BR-OLI-E', label: 'Olinda Leste', population: 9_000, category: 'roads', coverage: .5, targetCoverage: .85, seededRequests: 45, costMinor: 640_000, budgetMinor: 1_000_000, currency: 'BRL', project: 'Requalificar via de acesso', description: 'Synthetic planning fixture · FY 2026' },
      { id: 'BR-JAB-S', label: 'Jaboatão Sul', population: 11_000, category: 'lighting', coverage: .44, targetCoverage: .9, seededRequests: 55, costMinor: 330_000, budgetMinor: 1_000_000, currency: 'BRL', project: 'Iluminar rota comunitária', description: 'Synthetic planning fixture · FY 2026' },
    ],
  },
]
