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
      .from("profiles")
      .select("id, name, role")
      .not("role", "is", null);

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
      .select("id, task_name");

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

    const targetViolations = Math.floor(Math.random() * 3) + 1;
    let criticalAdded = 0;
    let warningAdded = 0;

    for (let i = 0; i < numMeasurements; i++) {
      const equip = equipment[Math.floor(Math.random() * equipment.length)];
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const slotKey = `${equip.id}-${time}`;

      if (usedEquipmentSlots.has(slotKey)) continue;
      usedEquipmentSlots.add(slotKey);

      const employee =
        profiles[Math.floor(Math.random() * profiles.length)];

      const shouldHaveViolation =
        criticalAdded + warningAdded < targetViolations &&
        Math.random() < 0.3;

      let temperature: number;
      let status: string;

      if (shouldHaveViolation) {
        const isCritical = Math.random() < 0.5;

        if (isCritical) {
          const range = equip.max_temp - equip.min_temp;
          const offset = Math.random() < 0.5 ? -1 : 1;
          const deviation = 2 + Math.random() * 2;
          temperature =
            offset > 0
              ? equip.max_temp + deviation
              : equip.min_temp - deviation;
          status = "danger";
          criticalAdded++;
        } else {
          const offset = Math.random() < 0.5 ? -1 : 1;
          const deviation = 0.5 + Math.random() * 1.5;
          temperature =
            offset > 0
              ? equip.max_temp + deviation
              : equip.min_temp - deviation;
          status = "warning";
          warningAdded++;
        }
      } else {
        const range = equip.max_temp - equip.min_temp;
        const safeMargin = range * 0.3;
        temperature =
          equip.min_temp + safeMargin + Math.random() * (range - 2 * safeMargin);
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
    const numCleaningTasks = Math.min(
      cleaningTasks.length,
      Math.floor(Math.random() * 3) + Math.floor(cleaningTasks.length * 0.6)
    );

    const shuffledTasks = [...cleaningTasks].sort(() => Math.random() - 0.5);
    const selectedTasks = shuffledTasks.slice(0, numCleaningTasks);

    for (const task of selectedTasks) {
      const employee =
        profiles[Math.floor(Math.random() * profiles.length)];
      const completed = Math.random() > 0.15;
      const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];

      cleaningLogs.push({
        task_id: task.id,
        performed_by: employee.id,
        status: completed ? "completed" : "pending",
        log_date: today,
        log_time: completed ? time : null,
        notes: completed ? "" : "Ikke utført",
      });
    }

    if (cleaningLogs.length > 0) {
      await supabase.from("cleaning_logs").insert(cleaningLogs);
    }

    const hygieneChecks: any[] = [];
    const managers = profiles.filter(
      (e: any) => e.role === "daglig_leder" || e.role === "kontrollor"
    );
    const allStaff = profiles;

    let selectedEmployees: any[] = [];
    if (isWeekend) {
      const numEmployees = Math.floor(Math.random() * 3) + 2;
      const shuffled = managers.length > 0
          ? [...managers].sort(() => Math.random() - 0.5)
          : [...allStaff].sort(() => Math.random() - 0.5);
      selectedEmployees = shuffled.slice(0, numEmployees);
    } else {
      const numEmployees = Math.floor(Math.random() * 2) + 3;
      const shuffled = [...allStaff].sort(() => Math.random() - 0.5);
      selectedEmployees = shuffled.slice(0, numEmployees);
    }

    const hygieneEmployees = selectedEmployees.filter(
      (e: any) => e.role === "daglig_leder" || e.role === "kontrollor"
    );

    for (const employee of hygieneEmployees) {
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
    const maxCoolingViolations = criticalAdded > 0 || warningAdded > 0 ? 1 : 0;

    for (const product of selectedProducts) {
      const shouldViolate =
        coolingViolationsAdded < maxCoolingViolations && Math.random() < 0.1;

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