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
      case 'create-waste-plan':
        result = await createWastePlan(supabase, body);
        break;
      case 'create-environmental-goal':
        result = await createEnvironmentalGoal(supabase, body);
        break;
      case 'create-grease-trap':
        result = await createGreaseTrap(supabase, body);
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
      equipment_type: data.equipment_type || 'Brannslukker',
      location: data.location || 'Ikke angitt',
      description: data.description || '',
      installation_date: data.installation_date || new Date().toISOString().split('T')[0],
      last_service_date: data.last_service_date || new Date().toISOString().split('T')[0],
      next_service_date: data.next_service_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'OK',
      notes: data.notes || ''
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
      quantity: data.quantity || 1,
      condition: data.condition || 'god',
      last_check_date: data.last_check_date || new Date().toISOString().split('T')[0],
      checked_by: data.checked_by || 'System',
      notes: data.notes || ''
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
      warning_procedure: data.warning_procedure || 'Varslingsprosedyre må angis',
      evacuation_procedure: data.evacuation_procedure || 'Evakueringsprosedyre må angis',
      escape_routes: data.escape_routes || 'Rømningsveier må beskrives',
      assembly_point: data.assembly_point || 'Ikke angitt',
      post_evacuation_instructions: data.post_evacuation_instructions || 'Instruksjoner etter evakuering må angis'
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
      employee_id: data.employee_id || null,
      training_type: data.training_type || 'Generell HMS',
      training_name: data.training_name || 'HMS Opplæring',
      training_date: data.training_date || new Date().toISOString().split('T')[0],
      completion_date: data.completion_date || new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: data.notes || ''
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function createWastePlan(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('hms_environment_waste')
    .insert({
      waste_type: data.waste_type || 'Generelt avfall',
      description: data.description || 'Beskriv avfallstypen',
      collection_frequency: data.collection_frequency || 'Ukentlig',
      supplier: data.supplier || 'Ikke angitt',
      disposal_method: data.disposal_method || 'Henteordning',
      notes: data.notes || ''
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function createEnvironmentalGoal(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('hms_environment_goals')
    .insert({
      goal_category: data.goal_category || 'Avfall',
      goal_description: data.goal_description || 'Beskriv miljømålet',
      target_value: data.target_value || 'Målverdi må angis',
      current_value: data.current_value || 'Nåværende verdi',
      target_date: data.target_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pågår',
      responsible_person: data.responsible_person || 'Ikke tildelt',
      notes: data.notes || ''
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function createGreaseTrap(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('hms_environment_grease_trap')
    .insert({
      location: data.location || 'Ikke angitt',
      capacity: data.capacity || 'Ikke angitt',
      supplier: data.supplier || 'NORVA',
      last_service_date: data.last_service_date || new Date().toISOString().split('T')[0],
      next_service_date: data.next_service_date || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service_interval_months: data.service_interval_months || 6,
      notes: data.notes || ''
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}
