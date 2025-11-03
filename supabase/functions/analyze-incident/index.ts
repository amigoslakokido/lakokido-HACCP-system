import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface IncidentRequest {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
}

interface AIResponse {
  analysis: string;
  consequences: string;
  solutions: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { title, description, severity }: IncidentRequest = await req.json();

    const analysis = generateAnalysis(title, description, severity);
    const consequences = generateConsequences(title, description, severity);
    const solutions = generateSolutions(title, description, severity);

    const response: AIResponse = {
      analysis,
      consequences,
      solutions,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function generateAnalysis(title: string, description: string, severity: string): string {
  const keywords = {
    temperature: ['درجة حرارة', 'حرارة', 'تبريد', 'تجميد', 'ثلاجة', 'فريزر', 'temperatur', 'kjøl', 'frys', 'kjøleskap'],
    food: ['طعام', 'أكل', 'لحم', 'دجاج', 'سمك', 'منتج', 'mat', 'kjøtt', 'kylling', 'fisk', 'produkt'],
    hygiene: ['نظافة', 'تعقيم', 'غسيل', 'تلوث', 'hygiene', 'rengjør', 'vask', 'forurens', 'søppel'],
    equipment: ['جهاز', 'معدات', 'عطل', 'صيانة', 'utstyr', 'feil', 'vedlikehold', 'maskin'],
    safety: ['سلامة', 'خطر', 'إصابة', 'حريق', 'sikkerhet', 'fare', 'skade', 'brann']
  };

  const descLower = description.toLowerCase();
  let analysis = '';

  if (keywords.temperature.some(k => descLower.includes(k))) {
    analysis = 'Problem med temperaturkontroll identifisert. Krever umiddelbar handling for å sikre matsikkerhet.';
  } else if (keywords.food.some(k => descLower.includes(k))) {
    analysis = 'Matprodukter direkte påvirket. Alle produkter må inspiseres og vurderes.';
  } else if (keywords.hygiene.some(k => descLower.includes(k))) {
    analysis = 'Mangel i hygienepraksis identifisert. Krever gjennomgang av rengjøringsprosedyrer.';
  } else if (keywords.equipment.some(k => descLower.includes(k))) {
    analysis = 'Utstyrsfeil identifisert. Skadet utstyr må tas ut av drift umiddelbart.';
  } else if (keywords.safety.some(k => descLower.includes(k))) {
    analysis = 'Sikkerhetsrisiko identifisert. Krever umiddelbare forebyggende tiltak.';
  } else {
    analysis = 'Hendelsen krever nøye undersøkelse for å identifisere grunnårsaken.';
  }

  return analysis;
}

function generateConsequences(title: string, description: string, severity: string): string {
  let consequences = '';

  if (severity === 'critical') {
    consequences += '• Stor risiko for forbrukerhelse\n';
    consequences += '• Juridiske konsekvenser og bøter\n';
    consequences += '• Omdømmetap\n';
    consequences += '• Økonomiske tap';
  } else if (severity === 'high') {
    consequences += '• Moderat risiko for matsikkerhet\n';
    consequences += '• Advarsler fra tilsynsmyndigheter\n';
    consequences += '• Kundetillitssvikt\n';
    consequences += '• Økonomiske tap';
  } else {
    consequences += '• Begrenset kvalitetspåvirkning\n';
    consequences += '• Merknader fra inspektører\n';
    consequences += '• Behov for praksis forbedring';
  }

  return consequences;
}

function generateSolutions(title: string, description: string, severity: string): string {
  let solutions = '';

  if (severity === 'critical') {
    solutions += '1. Stopp berørte operasjoner\n';
    solutions += '2. Isoler og kasser berørte produkter\n';
    solutions += '3. Varsle ledelsen og tilsynsmyndigheter\n';
    solutions += '4. Rengjør og desinficer området\n';
    solutions += '5. Gjennomgå sikkerhetsprosedyrer\n';
    solutions += '6. Oppdater HACCP-planen';
  } else if (severity === 'high') {
    solutions += '1. Vurder problemets omfang\n';
    solutions += '2. Inspiser og skill ut produkter\n';
    solutions += '3. Iverksett korrigerende tiltak\n';
    solutions += '4. Gjennomgå prosedyrer\n';
    solutions += '5. Øk overvåkingsfrekvens';
  } else {
    solutions += '1. Vurder situasjonen\n';
    solutions += '2. Iverksett tiltak\n';
    solutions += '3. Gjennomgå prosedyrer\n';
    solutions += '4. Dokumenter hendelsen';
  }

  return solutions;
}
