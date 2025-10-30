import { supabase } from '../../lib/supabase';

interface GenerateReportOptions {
  date: string;
  includeViolations?: boolean;
  violationCount?: number;
}

export async function generateIntelligentReport(options: GenerateReportOptions) {
  const { date, includeViolations = true, violationCount = 2 } = options;

  try {
    const { data: zones } = await supabase
      .from('zones')
      .select('*');

    const { data: items } = await supabase
      .from('equipment')
      .select('*, zones(*)')
      .eq('active', true);

    const { data: tasks } = await supabase
      .from('cleaning_tasks')
      .select('*')
      .eq('active', true);

    const { data: profiles } = await supabase
      .from('employees')
      .select('*')
      .eq('active', true);

    if (!items || !tasks || !profiles || profiles.length === 0) {
      throw new Error('Mangler nødvendige data for å generere rapport');
    }

    const timeSlots = ['08:00', '12:30', '16:45', '20:15'];
    const tempLogs = [];
    const cleaningLogs = [];
    const hygieneChecks = [];
    const coolingLogs = [];

    let violationsAdded = 0;
    const maxViolations = Math.min(violationCount, 5); // Max 5 violations to keep reports in safe/warning range

    for (const item of items) {
      const zone = item.zones;
      if (!zone) continue;

      // Single recording per item per day (like dishwasher)
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      let temp: number;
      let status: 'safe' | 'warning' | 'danger';

      const shouldViolate = includeViolations &&
                          violationsAdded < maxViolations &&
                          Math.random() < 0.3;

      if (shouldViolate) {
        const violationType = Math.random() < 0.5 ? 'warning' : 'danger';

        if (violationType === 'danger') {
          // Critical violation - temperature significantly outside safe range
          if (zone.min_temp < 0) {
            // For cold zones (freezer, receiving): too warm is dangerous
            temp = parseFloat((zone.max_temp + 2 + Math.random() * 3).toFixed(1));
          } else {
            // For hot zones (dishwasher, serving): too cool is dangerous
            temp = parseFloat((zone.min_temp - 3 - Math.random() * 4).toFixed(1));
          }
          status = 'danger';
        } else {
          // Minor violation - slightly outside safe range
          if (Math.random() < 0.5) {
            // Slightly below minimum (reasonable deviation)
            temp = parseFloat((zone.min_temp - 1 - Math.random() * 2).toFixed(1));
          } else {
            // Slightly above maximum (reasonable deviation)
            temp = parseFloat((zone.max_temp + 1 + Math.random() * 2).toFixed(1));
          }
          status = 'warning';
        }
        violationsAdded++;
      } else {
        // Safe temperature - well within acceptable range
        const range = zone.max_temp - zone.min_temp;
        const safeRange = range * 0.7;
        const offset = range * 0.15;
        temp = parseFloat((zone.min_temp + offset + Math.random() * safeRange).toFixed(1));
        status = 'safe';
      }

      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];

      tempLogs.push({
        equipment_id: item.id,
        temperature: temp,
        log_date: date,
        log_time: time,
        status: status,
        recorded_by: randomProfile.id,
        notes: '',
      });
    }

    for (const task of tasks) {
      const shouldComplete = Math.random() > 0.1;
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];

      let notes = '';
      if (!shouldComplete) {
        // Task not completed - add reason
        notes = ['Mangler tid', 'Utstyr ikke tilgjengelig', 'Planlagt senere'][Math.floor(Math.random() * 3)];
      } else {
        // Task completed - add simple confirmation comment
        const completedComments = [
          'Utført som planlagt',
          'Gjennomført OK',
          'Fullført uten problemer',
          'Alt i orden',
          'Utført grundig',
          'Gjennomført i henhold til prosedyre'
        ];
        notes = completedComments[Math.floor(Math.random() * completedComments.length)];
      }

      cleaningLogs.push({
        task_id: task.id,
        log_date: date,
        log_time: time,
        status: shouldComplete ? 'completed' : 'incomplete',
        notes: notes,
        completed_by: randomProfile.id,
      });
    }

    // Delete existing logs for this date to prevent duplicates
    await supabase.from('temperature_logs').delete().eq('log_date', date);
    await supabase.from('cleaning_logs').delete().eq('log_date', date);
    await supabase.from('hygiene_checks').delete().eq('check_date', date);
    await supabase.from('cooling_logs').delete().eq('log_date', date);

    if (tempLogs.length > 0) {
      await supabase.from('temperature_logs').insert(tempLogs);
    }

    if (cleaningLogs.length > 0) {
      await supabase.from('cleaning_logs').insert(cleaningLogs);
    }

    // Generate hygiene checks based on day of week
    // Monday-Thursday: 2-3 employees, Friday-Sunday: all employees
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    let selectedEmployees;
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      // Monday-Thursday: 2-3 random employees
      const numEmployees = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const shuffledProfiles = [...profiles].sort(() => Math.random() - 0.5);
      selectedEmployees = shuffledProfiles.slice(0, numEmployees);
    } else {
      // Friday-Sunday: all employees
      selectedEmployees = profiles;
    }

    const hygieneTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];

    for (const employee of selectedEmployees) {
      const allOk = Math.random() > 0.1;
      hygieneChecks.push({
        check_date: date,
        checked_by: employee.id,
        checker_id: profiles[Math.floor(Math.random() * profiles.length)].id,
        uniform_ok: allOk || Math.random() > 0.2,
        gloves_ok: allOk || Math.random() > 0.2,
        handwashing_ok: allOk || Math.random() > 0.1,
        nails_ok: allOk || Math.random() > 0.2,
        hair_ok: allOk || Math.random() > 0.2,
        overall_status: allOk ? 'OK' : 'Ikke OK',
        notes: allOk ? 'Alt i orden' : 'Se merknader'
      });
    }

    if (hygieneChecks.length > 0) {
      await supabase.from('hygiene_checks').insert(hygieneChecks);
    }

    // Generate cooling logs (2-3 items per day)
    const productTypes = [
      { type: 'Kebabkjøtt', name: 'Fersk kebabkjøtt' },
      { type: 'Kyllingkjøtt', name: 'Grillet kylling' },
      { type: 'Kjøttsaus', name: 'Tomatkjøttsaus' }
    ];

    const numCoolingItems = Math.floor(Math.random() * 2) + 2; // 2-3 items
    const shuffledProducts = [...productTypes].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffledProducts.slice(0, numCoolingItems);

    for (const product of selectedProducts) {
      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];

      // Simulate cooling process according to Mattilsynet rules
      const shouldViolate = includeViolations &&
                           violationsAdded < maxViolations &&
                           Math.random() < 0.25;

      let tempInitial: number;
      let temp2h: number;
      let temp6h: number;
      let notes = '';

      if (shouldViolate) {
        // Create violation scenario
        const violationType = Math.random() < 0.5 ? 'stage1' : 'stage2';

        tempInitial = parseFloat((65 + Math.random() * 10).toFixed(1)); // 65-75°C

        if (violationType === 'stage1') {
          // Fail Stage 1: temp after 2h > 20°C
          temp2h = parseFloat((22 + Math.random() * 8).toFixed(1)); // 22-30°C
          temp6h = parseFloat((8 + Math.random() * 4).toFixed(1)); // 8-12°C
          notes = 'Ikke godkjent – Stage 1 mislykket';
        } else {
          // Fail Stage 2: temp after 6h > 10°C
          temp2h = parseFloat((15 + Math.random() * 4).toFixed(1)); // 15-19°C
          temp6h = parseFloat((11 + Math.random() * 5).toFixed(1)); // 11-16°C
          notes = 'Ikke godkjent – Stage 2 mislykket. Mat må kasseres';
        }

        violationsAdded++;
      } else {
        // Safe cooling process
        tempInitial = parseFloat((65 + Math.random() * 15).toFixed(1)); // 65-80°C
        temp2h = parseFloat((12 + Math.random() * 6).toFixed(1)); // 12-18°C
        temp6h = parseFloat((2 + Math.random() * 5).toFixed(1)); // 2-7°C

        if (temp6h <= 4 && temp2h <= 15) {
          notes = 'Utmerket nedkjøling';
        } else {
          notes = 'Godkjent nedkjøling';
        }
      }

      coolingLogs.push({
        log_date: date,
        product_type: product.type,
        product_name: product.name,
        temp_initial: tempInitial,
        temp_2h: temp2h,
        temp_6h: temp6h,
        total_duration_hours: 6,
        recorded_by: randomProfile.id,
        notes: notes
      });
    }

    if (coolingLogs.length > 0) {
      await supabase.from('cooling_logs').insert(coolingLogs);
    }

    // Calculate overall status based on violation count
    // 5+ violations = danger (critical)
    // 3-4 violations = warning (moderate)
    // 0-2 violations = safe (good)
    const totalViolations = tempLogs.filter(l => l.status === 'danger' || l.status === 'warning').length;
    const overallStatus = totalViolations >= 5
      ? 'danger'
      : totalViolations >= 3
      ? 'warning'
      : 'safe';

    const { data: existingReport } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', date)
      .maybeSingle();

    // Get first employee as generator
    const generatorId = profiles[0].id;

    if (existingReport) {
      const { data: report } = await supabase
        .from('daily_reports')
        .update({
          overall_status: overallStatus,
          generated_by: generatorId,
        })
        .eq('id', existingReport.id)
        .select()
        .single();

      return report;
    } else {
      const { data: report } = await supabase
        .from('daily_reports')
        .insert({
          report_date: date,
          overall_status: overallStatus,
          generated_by: generatorId,
          content: {},
        })
        .select()
        .single();

      return report;
    }
  } catch (error) {
    console.error('Error generating intelligent report:', error);
    throw error;
  }
}
