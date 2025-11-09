import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().split("T")[0];

    const { data: existingReport } = await supabase
      .from("daily_reports")
      .select("id")
      .eq("report_date", today)
      .maybeSingle();

    if (existingReport) {
      return new Response(
        JSON.stringify({
          message: "تقرير اليوم موجود بالفعل",
          reportId: existingReport.id,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: profiles } = await supabase
      .from("employees")
      .select("id, name, role")
      .eq("status", "active");

    if (!profiles || profiles.length === 0) {
      throw new Error("No employees found");
    }

    const { data: equipment } = await supabase
      .from("equipment")
      .select("id, name, min_temp, max_temp, zones(id, name)")
      .not("zones", "is", null);

    if (!equipment || equipment.length === 0) {
      throw new Error("No equipment found");
    }

    const { data: cleaningTasks } = await supabase
      .from("cleaning_tasks")
      .select("id, task_name, frequency")
      .eq("active", true);

    if (!cleaningTasks || cleaningTasks.length === 0) {
      throw new Error("No cleaning tasks found");
    }

    const timeSlots = [
      "11:00",
      "13:00",
      "15:00",
      "17:00",
      "19:00",
      "21:00",
    ];

    const dayOfWeek = new Date(today).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const numMeasurements = isWeekend
      ? Math.floor(Math.random() * 4) + 8
      : Math.floor(Math.random() * 3) + 12;

    const tempLogs: any[] = [];
    const usedEquipmentSlots = new Set<string>();

    const { count: totalReports } = await supabase
      .from("daily_reports")
      .select("*", { count: "exact", head: true });

    const reportNumber = (totalReports || 0) + 1;
    const shouldHaveCriticalViolation = reportNumber % 10 === 0;
    const shouldHaveWarningViolation = reportNumber % 8 === 0 || reportNumber % 8 === 4;

    let criticalAdded = 0;
    let warningAdded = 0;
    const maxCriticalViolations = shouldHaveCriticalViolation ? 1 : 0;
    const maxWarningViolations = shouldHaveWarningViolation ? 1 : 0;

    for (let i = 0; i < numMeasurements; i++) {
      const equip = equipment[Math.floor(Math.random() * equipment.length)];
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const slotKey = `${equip.id}-${time}`;

      if (usedEquipmentSlots.has(slotKey)) continue;
      usedEquipmentSlots.add(slotKey);

      const employee =
        profiles[Math.floor(Math.random() * profiles.length)];

      const shouldHaveCritical =
        criticalAdded < maxCriticalViolations && Math.random() < 0.2;
      const shouldHaveWarning =
        !shouldHaveCritical &&
        warningAdded < maxWarningViolations &&
        Math.random() < 0.25;

      let temperature: number;
      let status: string;

      if (shouldHaveCritical) {
        if (Math.random() < 0.5) {
          temperature = parseFloat((equip.max_temp + 2 + Math.random() * 2).toFixed(1));
        } else {
          temperature = parseFloat((equip.min_temp - 2 - Math.random() * 2).toFixed(1));
        }
        status = "danger";
        criticalAdded++;
      } else if (shouldHaveWarning) {
        if (Math.random() < 0.5) {
          temperature = parseFloat((equip.min_temp - 0.5 - Math.random() * 1.5).toFixed(1));
        } else {
          temperature = parseFloat((equip.max_temp + 0.5 + Math.random() * 1.5).toFixed(1));
        }
        status = "warning";
        warningAdded++;
      } else {
        const range = equip.max_temp - equip.min_temp;
        const safeRange = range * 0.7;
        const offset = range * 0.15;
        temperature = parseFloat((equip.min_temp + offset + Math.random() * safeRange).toFixed(1));
        status = "safe";
      }

      tempLogs.push({
        equipment_id: equip.id,
        temperature: parseFloat(temperature.toFixed(2)),
        status,
        recorded_by: employee.id,
        log_date: today,
        log_time: time,
        notes: "",
      });
    }

    if (tempLogs.length > 0) {
      await supabase.from("temperature_logs").insert(tempLogs);
    }

    const cleaningLogs: any[] = [];
    const todayDate = new Date(today);
    const todayDayOfWeek = todayDate.getDay();
    const todayDayOfMonth = todayDate.getDate();
    const isFirstDayOfMonth = todayDayOfMonth === 1;
    const isMonday = todayDayOfWeek === 1;

    const tasksForToday = cleaningTasks.filter((task: any) => {
      if (task.frequency === 'daily') {
        return true;
      } else if (task.frequency === 'weekly') {
        return isMonday;
      } else if (task.frequency === 'monthly') {
        return isFirstDayOfMonth;
      }
      return true;
    });

    for (const task of tasksForToday) {
      const employee =
        profiles[Math.floor(Math.random() * profiles.length)];
      const completed = Math.random() > 0.15;
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];

      cleaningLogs.push({
        task_id: task.id,
        completed_by: employee.id,
        status: completed ? "completed" : "incomplete",
        log_date: today,
        log_time: time,
        notes: completed ? "Utført som planlagt" : "Ikke utført",
      });
    }

    if (cleaningLogs.length > 0) {
      await supabase.from("cleaning_logs").insert(cleaningLogs);
    }

    const hygieneChecks: any[] = [];
    const allStaff = profiles;

    let numEmployeesForDay: number;
    if (isWeekend) {
      numEmployeesForDay = Math.floor(Math.random() * 2) + 3;
    } else {
      numEmployeesForDay = Math.random() < 0.5 ? 2 : 3;
    }

    const shuffledEmployees = [...allStaff].sort(() => Math.random() - 0.5);
    const selectedEmployees = shuffledEmployees.slice(0, Math.min(numEmployeesForDay, allStaff.length));

    for (const employee of selectedEmployees) {
      const allOk = Math.random() > 0.1;
      hygieneChecks.push({
        check_date: today,
        staff_name: employee.name,
        uniform_clean: allOk || Math.random() > 0.2,
        hands_washed: allOk || Math.random() > 0.1,
        jewelry_removed: allOk || Math.random() > 0.2,
        illness_free: allOk || Math.random() > 0.1,
        notes: allOk ? "Alt i orden" : "Se merknader",
      });
    }

    const productTypes = [
      { type: "kebab", name: "Fersk kebabkjøtt" },
      { type: "chicken", name: "Grillet kylling" },
      { type: "kjottsaus", name: "Tomatkjøttsaus" },
      { type: "kjottdeig", name: "Kjøttdeig" },
      { type: "bacon", name: "Bacon" },
    ];

    const numCoolingItems = Math.floor(Math.random() * 2) + 2;
    const shuffledProducts = [...productTypes].sort(() => Math.random() - 0.5);
    const selectedProducts = shuffledProducts.slice(0, numCoolingItems);

    const coolingLogs: any[] = [];
    let coolingViolationsAdded = 0;
    const maxCoolingViolations = shouldHaveCriticalViolation || shouldHaveWarningViolation ? 1 : 0;

    for (const product of selectedProducts) {
      const shouldViolate =
        coolingViolationsAdded < maxCoolingViolations && Math.random() < 0.05;

      let initialTemp: number;
      let finalTemp: number;
      let withinLimits: boolean;
      let notes = "";

      if (shouldViolate) {
        initialTemp = parseFloat((65 + Math.random() * 10).toFixed(1));
        finalTemp = parseFloat((5 + Math.random() * 15).toFixed(1));
        notes = "Ikke godkjent – For langsom nedkjøling";
        withinLimits = false;
        coolingViolationsAdded++;
      } else {
        initialTemp = parseFloat((65 + Math.random() * 10).toFixed(1));
        finalTemp = Math.random() < 0.5 ? 3 : 4;
        withinLimits = true;
        notes = "Utmerket nedkjøling";
      }

      const coolingStartSlots = ["11:00", "12:00", "13:00", "14:00", "15:00"];
      const startTime = coolingStartSlots[Math.floor(Math.random() * coolingStartSlots.length)];
      const startHour = parseInt(startTime.split(":")[0]);
      const endHour = startHour + 6;
      const endTimeStr = `${endHour.toString().padStart(2, "0")}:00`;

      coolingLogs.push({
        log_date: today,
        product_type: product.type,
        product_name: product.name,
        initial_temp: initialTemp,
        final_temp: finalTemp,
        start_time: `${today}T${startTime}:00`,
        end_time: `${today}T${endTimeStr}:00`,
        within_limits: withinLimits,
        notes: notes,
      });
    }

    if (hygieneChecks.length > 0) {
      await supabase.from("hygiene_checks").insert(hygieneChecks);
    }
    if (coolingLogs.length > 0) {
      await supabase.from("cooling_logs").insert(coolingLogs);
    }

    const totalViolations = tempLogs.filter(
      (l: any) => l.status === "danger" || l.status === "warning"
    ).length;
    const overallStatus =
      totalViolations >= 5 ? "danger" : totalViolations >= 3 ? "warning" : "safe";

    const generatorId = profiles[0].id;
    const { data: report } = await supabase
      .from("daily_reports")
      .insert({
        report_date: today,
        overall_status: overallStatus,
        generated_by: generatorId,
        content: {},
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: "تم إنشاء التقرير اليومي بنجاح",
        reportId: report.id,
        date: today,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});