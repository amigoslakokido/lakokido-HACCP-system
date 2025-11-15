import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1];
    const body = await req.json();

    let result;

    switch (action) {
      case 'create-fire-equipment':
        result = await createFireEquipment(supabase, body);
        break;
      case 'create-first-aid-equipment':
        result = await createFirstAidEquipment(supabase, body);
        break;
      case 'create-evacuation-plan':
        result = await createEvacuationPlan(supabase, body);
        break;
      case 'create-risk-assessment':
        result = await createRiskAssessment(supabase, body);
        break;
      case 'create-training-log':
        result = await createTrainingLog(supabase, body);
        break;
      default:
        throw new Error('Ukjent handling');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: 'Opprettet. Du kan nå redigere dataene etter behov.'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function createFireEquipment(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('hms_fire_equipment')
    .insert({
      equipment_type: data.equipment_type || 'brannslokker',
      location: data.location || 'Ikke angitt',
      last_inspection_date: data.last_inspection_date || new Date().toISOString().split('T')[0],
      next_inspection_date: data.next_inspection_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ok'
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function createFirstAidEquipment(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('hms_first_aid_equipment')
    .insert({
      equipment_name: data.equipment_name || 'Førstehjelpsskap',
      location: data.location || 'Ikke angitt',
      last_inspection_date: data.last_inspection_date || new Date().toISOString().split('T')[0],
      next_inspection_date: data.next_inspection_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ok'
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function createEvacuationPlan(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('hms_evacuation_plan')
    .insert({
      plan_name: data.plan_name || 'Evakueringsplan',
      description: data.description || 'Beskrivelse må legges til',
      meeting_point: data.meeting_point || 'Ikke angitt',
      evacuation_leader: data.evacuation_leader || 'Ikke angitt',
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function createRiskAssessment(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('hms_risk_assessments')
    .insert({
      hazard_type: data.hazard_type || 'Faremoment',
      hazard_description: data.hazard_description || 'Beskrivelse må legges til',
      likelihood: data.likelihood || 3,
      consequence: data.consequence || 3,
      preventive_measures: data.preventive_measures || 'Tiltak må defineres',
      responsible_person: data.responsible_person || 'Ikke tildelt',
      deadline: data.deadline || null,
      status: data.status || 'Åpen',
      notes: data.notes || ''
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function createTrainingLog(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('training_log')
    .insert({
      employee_name: data.employee_name || 'Navn må angis',
      training_type: data.training_type || 'Generell HMS',
      training_date: data.training_date || new Date().toISOString().split('T')[0],
      instructor: data.instructor || 'Ikke angitt',
      duration_hours: data.duration_hours || 1,
      completion_status: 'completed',
      notes: data.notes || ''
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}
