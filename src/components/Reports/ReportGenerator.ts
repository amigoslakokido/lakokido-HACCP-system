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
    const maxViolations = Math.min(violationCount, 5);

    for (const item of items) {
      const minTemp = parseFloat(item.min_temp);
      const maxTemp = parseFloat(item.max_temp);

      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      let temp: number;
      let status: 'safe' | 'warning' | 'danger';

      const shouldViolate = includeViolations &&
                          violationsAdded < maxViolations &&
                          Math.random() < 0.3;

      if (shouldViolate) {
        const violationType = Math.random() < 0.5 ? 'warning' : 'danger';

        if (violationType === 'danger') {
          if (minTemp < 0) {
            temp = parseFloat((maxTemp + 2 + Math.random() * 3).toFixed(1));
          } else {
            temp = parseFloat((minTemp - 3 - Math.random() * 4).toFixed(1));
          }
          status = 'danger';
        } else {
          if (Math.random() < 0.5) {
            temp = parseFloat((minTemp - 1 - Math.random() * 2).toFixed(1));
          } else {
            temp = parseFloat((maxTemp + 1 + Math.random() * 2).toFixed(1));
          }
          status = 'warning';
        }
        violationsAdded++;
      } else {
        const range = maxTemp - minTemp;
        const safeRange = range * 0.7;
        const offset = range * 0.15;
        temp = parseFloat((minTemp + offset + Math.random() * safeRange).toFixed(1));
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
        notes = ['Mangler tid', 'Utstyr ikke tilgjengelig', 'Planlagt senere'][Math.floor(Math.random() * 3)];
      } else {
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

    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    let selectedEmployees;
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      const numEmployees = Math.floor(Math.random() * 2) + 2;
      const shuffledProfiles = [...profiles].sort(() => Math.random() - 0.5);
      selectedEmployees = shuffledProfiles.slice(0, numEmployees);
    } else {
      selectedEmployees = profiles;
    }

    for (const employee of selectedEmployees) {
      const allOk = Math.random() > 0.1;
      hygieneChecks.push({
        check_date: date,
        staff_name: employee.name,
        uniform_clean: allOk || Math.random() > 0.2,
        hands_washed: allOk || Math.random() > 0.1,
        jewelry_removed: allOk || Math.random() > 0.2,
        illness_free: allOk || Math.random() > 0.1,
        notes: allOk ? 'Alt i orden' : 'Se merknader'
      });
    }

    if (hygieneChecks.length > 0) {
      await supabase.from('hygiene_checks').insert(hygieneChecks);
    }

    const productTypes = [
      { type: 'Kebabkjøtt', name: 'Fersk kebabkjøtt' },
      { type: 'Kyllingkjøtt', name: 'Grillet kylling' },
      { type: 'Kjøttsaus', name: 'Tomatkjøttsaus' }
    ];

    const numCoolingItems = Math.floor(Math.random() * 2) + 2;
    const shuffledProducts = [...productTypes].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffledProducts.slice(0, numCoolingItems);

    for (const product of selectedProducts) {
      const shouldViolate = includeViolations &&
                           violationsAdded < maxViolations &&
                           Math.random() < 0.25;

      let initialTemp: number;
      let finalTemp: number;
      let withinLimits: boolean;
      let notes = '';

      if (shouldViolate) {
        initialTemp = parseFloat((65 + Math.random() * 10).toFixed(1));

        if (Math.random() < 0.5) {
          finalTemp = parseFloat((22 + Math.random() * 8).toFixed(1));
          notes = 'Ikke godkjent – For langsom nedkjøling';
          withinLimits = false;
        } else {
          finalTemp = parseFloat((11 + Math.random() * 5).toFixed(1));
          notes = 'Ikke godkjent – Må kasseres';
          withinLimits = false;
        }

        violationsAdded++;
      } else {
        initialTemp = parseFloat((65 + Math.random() * 15).toFixed(1));
        finalTemp = parseFloat((2 + Math.random() * 5).toFixed(1));
        withinLimits = true;

        if (finalTemp <= 4) {
          notes = 'Utmerket nedkjøling';
        } else {
          notes = 'Godkjent nedkjøling';
        }
      }

      const startTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = (startHour + 6) % 24;
      const endTime = `${endHour.toString().padStart(2, '0')}:${startTime.split(':')[1]}`;

      coolingLogs.push({
        log_date: date,
        product_type: product.type,
        product_name: product.name,
        initial_temp: initialTemp,
        final_temp: finalTemp,
        start_time: startTime,
        end_time: endTime,
        within_limits: withinLimits,
        notes: notes
      });
    }

    if (coolingLogs.length > 0) {
      await supabase.from('cooling_logs').insert(coolingLogs);
    }

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
