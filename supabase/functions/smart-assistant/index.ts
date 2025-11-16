import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { text, section } = await req.json();

    let analysis;

    switch (section) {
      case 'deviation':
        analysis = analyzeDeviation(text);
        break;
      case 'incident':
        analysis = analyzeIncident(text);
        break;
      case 'first-aid':
        analysis = analyzeFirstAid(text);
        break;
      case 'fire':
        analysis = analyzeFire(text);
        break;
      case 'maintenance':
        analysis = analyzeMaintenance(text);
        break;
      case 'environment':
        analysis = analyzeEnvironment(text);
        break;
      default:
        analysis = analyzeGeneral(text);
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeDeviation(text: string) {
  const lowerText = text.toLowerCase();

  let category = 'Annet';
  let severity = 'Lav';
  let suggestions = [];
  let detectedIssues = [];

  if (lowerText.includes('f\u00f8rste') || lowerText.includes('hjelp') || lowerText.includes('plaster') || lowerText.includes('bandasje')) {
    category = 'F\u00f8rstehjelp';
    detectedIssues.push('F\u00f8rstehjelpssutstyr');
    suggestions.push('Bestill manglende f\u00f8rstehjelpsmateriell umiddelbart');
    suggestions.push('Kontroller f\u00f8rstehjelpsskap ukentlig');
  }

  if (lowerText.includes('brann') || lowerText.includes('slukk') || lowerText.includes('alarm')) {
    category = 'Brannsikkerhet';
    severity = 'H\u00f8y';
    detectedIssues.push('Brannsikkerhet');
    suggestions.push('Kontakt brannservice for \u00f8yeblikkelig inspeksjon');
    suggestions.push('Dokumenter og f\u00f8lg opp med en gang');
  }

  if (lowerText.includes('rent') || lowerText.includes('hygiene') || lowerText.includes('skitten')) {
    category = 'Hygiene/Renhold';
    detectedIssues.push('Renhold');
    suggestions.push('\u00d8k frekvensen p\u00e5 renhold i dette omr\u00e5det');
    suggestions.push('Gjennomf\u00f8r ekstra oppl\u00e6ring for ansatte');
  }

  if (lowerText.includes('utstyr') || lowerText.includes('\u00f8delagt') || lowerText.includes('defekt')) {
    category = 'Utstyr/Vedlikehold';
    detectedIssues.push('Teknisk utstyr');
    suggestions.push('Ta utstyret ut av bruk til det er reparert');
    suggestions.push('Kontakt leverand\u00f8r for service');
  }

  if (lowerText.includes('fare') || lowerText.includes('risiko') || lowerText.includes('farlig')) {
    severity = 'H\u00f8y';
    suggestions.push('Vurder om omr\u00e5det m\u00e5 sperres av');
  }

  if (lowerText.includes('mat') || lowerText.includes('temp') || lowerText.includes('kj\u00f8le')) {
    category = 'Mattrygghet';
    severity = 'Middels';
    detectedIssues.push('Temperaturkontroll');
    suggestions.push('Kontroller temperatur umiddelbart');
  }

  return {
    category,
    severity,
    description: text,
    detectedIssues,
    suggestions,
    recommendedActions: [
      'Registrer avviket formelt i systemet',
      'Informer ansvarlig leder',
      'Sett en frist for utbedring',
      'F\u00f8lg opp at tiltak gjennomf\u00f8res'
    ],
    autoFillData: {
      deviation_type: category,
      severity,
      description: text,
      status: '\u00c5pen'
    }
  };
}

function analyzeIncident(text: string) {
  const lowerText = text.toLowerCase();

  let incidentType = 'Annet';
  let severity = 'Lav';
  let suggestions = [];

  if (lowerText.includes('kutt') || lowerText.includes('skade') || lowerText.includes('blod')) {
    incidentType = 'Skade/ulykke';
    severity = 'H\u00f8y';
    suggestions.push('Gi f\u00f8rstehjelp umiddelbart');
    suggestions.push('Vurder om 113 m\u00e5 varsles');
    suggestions.push('Dokumenter hendelsen n\u00f8ye');
  }

  if (lowerText.includes('fall') || lowerText.includes('snubl') || lowerText.includes('gli')) {
    incidentType = 'Fall/snubling';
    suggestions.push('Inspiser omr\u00e5det for farlige forhold');
    suggestions.push('Sett opp varselskilter hvis n\u00f8dvendig');
  }

  if (lowerText.includes('brann') || lowerText.includes('r\u00f8yk') || lowerText.includes('ild')) {
    incidentType = 'Brann';
    severity = 'Kritisk';
    suggestions.push('Varsle brannvesenet (110) hvis ikke allerede gjort');
    suggestions.push('Evakuer omr\u00e5det');
    suggestions.push('Varsle alle ber\u00f8rte parter');
  }

  if (lowerText.includes('mat') || lowerText.includes('forgiftning') || lowerText.includes('kvalme')) {
    incidentType = 'Matb\u00e5ren sykdom';
    severity = 'H\u00f8y';
    suggestions.push('Isoler mistenkt mat');
    suggestions.push('Kontakt Mattilsynet');
    suggestions.push('Gjennomg\u00e5 hele produksjonskjeden');
  }

  return {
    incidentType,
    severity,
    description: text,
    suggestions,
    immediateActions: severity === 'Kritisk' || severity === 'H\u00f8y'
      ? ['Ta umiddelbar handling', 'Varsle n\u00f8detater hvis n\u00f8dvendig', 'Sikre omr\u00e5det']
      : ['Dokumenter hendelsen', 'Informer ansvarlig'],
    autoFillData: {
      incident_type: incidentType,
      severity,
      description: text,
      status: 'Under behandling'
    }
  };
}

function analyzeFirstAid(text: string) {
  const lowerText = text.toLowerCase();
  const missingItems = [];
  const suggestions = [];

  if (lowerText.includes('plaster') || lowerText.includes('bandasje')) {
    missingItems.push('Plaster og bandasjer');
  }
  if (lowerText.includes('kompress')) {
    missingItems.push('Kompresser');
  }
  if (lowerText.includes('hansker')) {
    missingItems.push('Engangs hansker');
  }
  if (lowerText.includes('saks')) {
    missingItems.push('Saks');
  }

  suggestions.push('Bestill manglende materiell snarest');
  suggestions.push('Kontroller alt f\u00f8rstehjelpssutstyr');
  suggestions.push('Sett p\u00e5minnelse for neste kontroll');

  return {
    missingItems,
    description: text,
    suggestions,
    priority: 'H\u00f8y',
    autoFillData: {
      issue: text,
      items_needed: missingItems.join(', '),
      action: 'Bestilling p\u00e5krevd'
    }
  };
}

function analyzeFire(text: string) {
  const lowerText = text.toLowerCase();
  const suggestions = [];
  let issue = 'Generell brannsikkerhet';

  if (lowerText.includes('slukk') || lowerText.includes('apparat')) {
    issue = 'Brannslukker';
    suggestions.push('Bestill nytt brannslukningsapparat');
    suggestions.push('Kontakt godkjent leverand\u00f8r');
  }

  if (lowerText.includes('kontroll') || lowerText.includes('service')) {
    issue = 'Service/kontroll';
    suggestions.push('Bestill serviceavtale');
    suggestions.push('Sett dato for neste kontroll');
  }

  return {
    issue,
    description: text,
    suggestions,
    priority: 'Kritisk',
    autoFillData: {
      issue_type: issue,
      description: text,
      status: 'Krever handling'
    }
  };
}

function analyzeMaintenance(text: string) {
  const lowerText = text.toLowerCase();
  let maintenanceType = 'Generelt vedlikehold';
  const suggestions = [];

  if (lowerText.includes('kj\u00f8l') || lowerText.includes('frys')) {
    maintenanceType = 'Kj\u00f8le-/fryseutstyr';
    suggestions.push('Kontakt kj\u00f8letekniker');
    suggestions.push('Kontroller temperatur hver time inntil reparert');
  }

  if (lowerText.includes('ovn') || lowerText.includes('komfyr')) {
    maintenanceType = 'Kokkeutstyr';
    suggestions.push('Ta utstyret ut av bruk');
    suggestions.push('Kontakt leverand\u00f8r');
  }

  if (lowerText.includes('vann') || lowerText.includes('lekkasje')) {
    maintenanceType = 'VVS';
    suggestions.push('Steng vannet hvis mulig');
    suggestions.push('Kontakt r\u00f8rlegger akutt');
  }

  return {
    maintenanceType,
    description: text,
    suggestions,
    urgency: 'Middels',
    autoFillData: {
      maintenance_type: maintenanceType,
      description: text,
      priority: 'Middels'
    }
  };
}

function analyzeEnvironment(text: string) {
  const lowerText = text.toLowerCase();
  const suggestions = [];
  let category = 'Milj\u00f8 generelt';

  if (lowerText.includes('avfall') || lowerText.includes('s\u00f8ppel')) {
    category = 'Avfallsh\u00e5ndtering';
    suggestions.push('Gjennomg\u00e5 avfallsrutiner');
    suggestions.push('\u00d8k frekvens p\u00e5 t\u00f8mming');
  }

  if (lowerText.includes('olje') || lowerText.includes('fett')) {
    category = 'Olje/fett';
    suggestions.push('Kontakt NORVA eller tilsvarende');
    suggestions.push('Dokumenter h\u00e5ndtering');
  }

  return {
    category,
    description: text,
    suggestions,
    autoFillData: {
      issue_category: category,
      description: text
    }
  };
}

function analyzeGeneral(text: string) {
  return {
    description: text,
    suggestions: [
      'Velg riktig kategori for bedre forslag',
      'Gi mer detaljer for automatisk utfylling',
      'Bruk n\u00f8kkelord som "brann", "f\u00f8rstehjelp", "avvik" osv.'
    ],
    autoFillData: {
      description: text
    }
  };
}
