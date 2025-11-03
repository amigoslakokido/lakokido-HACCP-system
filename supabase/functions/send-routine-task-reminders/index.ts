import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TaskReminder {
  employee_email: string;
  employee_name: string;
  incomplete_tasks: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tasks_list: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();

    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let emailSubject = '';

    if (currentHour >= 15) {
      urgencyLevel = 'critical';
      emailSubject = '🔴 عاجل جداً: مهام HACCP لم تكتمل!';
    } else if (currentHour >= 12) {
      urgencyLevel = 'high';
      emailSubject = '⚠️ تذكير مهم: مهام HACCP متأخرة';
    } else if (currentHour >= 9) {
      urgencyLevel = 'medium';
      emailSubject = '📋 تذكير: مهام HACCP اليومية';
    } else {
      emailSubject = 'ℹ️ مهامك اليومية - HACCP';
    }

    const data = {
      status: 'Email reminders sent',
      urgency: urgencyLevel,
      subject: emailSubject,
      timestamp: now.toISOString(),
      message: 'This is a demo response. In production, this would send actual emails using SendGrid, AWS SES, or similar service.',
      example_email_content: {
        to: 'employee@example.com',
        subject: emailSubject,
        body_ar: `
          مرحباً [اسم الموظف],

          ${urgencyLevel === 'critical' ? '🔴 **تحذير عاجل**: لديك مهام HACCP لم تكتمل!' :
            urgencyLevel === 'high' ? '⚠️ **تنبيه مهم**: يرجى إكمال مهامك اليومية' :
            urgencyLevel === 'medium' ? '📋 **تذكير**: لديك مهام يومية معلقة' :
            'ℹ️ مهامك اليومية في انتظارك'}

          عدد المهام غير المكتملة: [X]

          المهام المعلقة:
          - [المهمة 1]
          - [المهمة 2]
          - [المهمة 3]

          ${urgencyLevel === 'critical' ? 'يرجى إكمال هذه المهام فوراً لضمان سلامة الغذاء والامتثال لمعايير HACCP.' :
            urgencyLevel === 'high' ? 'يرجى إكمال هذه المهام قبل نهاية الوردية.' :
            'يرجى إكمال هذه المهام في أقرب وقت ممكن.'}

          رابط التطبيق: [URL]

          شكراً لالتزامك بمعايير السلامة الغذائية.

          نظام HACCP
          Lakokido Restaurant
        `,
        body_no: `
          Hei [Ansattnavn],

          ${urgencyLevel === 'critical' ? '🔴 **Kritisk varsel**: Du har ufullførte HACCP-oppgaver!' :
            urgencyLevel === 'high' ? '⚠️ **Viktig påminnelse**: Vennligst fullfør dine daglige oppgaver' :
            urgencyLevel === 'medium' ? '📋 **Påminnelse**: Du har ventende daglige oppgaver' :
            'ℹ️ Dine daglige oppgaver venter på deg'}

          Antall ufullførte oppgaver: [X]

          Ventende oppgaver:
          - [Oppgave 1]
          - [Oppgave 2]
          - [Oppgave 3]

          ${urgencyLevel === 'critical' ? 'Vennligst fullfør disse oppgavene umiddelbart for å sikre matsikkerhet og overholdelse av HACCP-standarder.' :
            urgencyLevel === 'high' ? 'Vennligst fullfør disse oppgavene før skiftet slutter.' :
            'Vennligst fullfør disse oppgavene så snart som mulig.'}

          Applikasjonslenke: [URL]

          Takk for din forpliktelse til mattrygghetsstandarder.

          HACCP System
          Lakokido Restaurant
        `
      },
      implementation_notes: {
        email_service: 'To implement actual email sending, integrate with:',
        options: [
          'SendGrid (https://sendgrid.com)',
          'AWS SES (https://aws.amazon.com/ses/)',
          'Mailgun (https://www.mailgun.com)',
          'Resend (https://resend.com)'
        ],
        steps: [
          '1. Sign up for an email service provider',
          '2. Get API key and add to Supabase Secrets',
          '3. Import the email service SDK in this function',
          '4. Query Supabase for employee emails and incomplete tasks',
          '5. Loop through employees and send personalized emails',
          '6. Log the sent emails in a notifications table'
        ]
      }
    };

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error('Error in send-routine-task-reminders:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to process reminder requests'
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
