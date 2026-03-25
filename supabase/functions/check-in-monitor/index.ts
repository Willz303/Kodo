import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: members, error } = await supabase
    .from("kodo_members")
    .select("email, full_name, emergency_contact_email, emergency_contact_name, last_check_in, check_in_interval_hours, alert_sent")
    .not("emergency_contact_email", "is", null)
    .not("last_check_in", "is", null);

  if (error) {
    console.error("Failed to fetch members:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const now = Date.now();
  const results = [];

  for (const member of members) {
    const intervalMs = (member.check_in_interval_hours || 72) * 60 * 60 * 1000;
    const lastCheckIn = new Date(member.last_check_in).getTime();
    const deadline = lastCheckIn + intervalMs;
    const isExpired = now > deadline;

    if (!isExpired || member.alert_sent) {
      if (!isExpired && member.alert_sent) {
        await supabase
          .from("kodo_members")
          .update({ alert_sent: false })
          .eq("email", member.email);
      }
      continue;
    }

    const userName = member.full_name || member.email;
    const contactName = member.emergency_contact_name || "there";
    const hoursOverdue = Math.floor((now - deadline) / (1000 * 60 * 60));

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kodo <onboarding@resend.dev>",
        to: member.emergency_contact_email,
        subject: `⚠️ Welfare check needed for ${userName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
            <h2 style="color: #2d6a3f; margin-top: 0;">Kodo — Welfare Alert</h2>
            <p>Hi ${contactName},</p>
            <p>
              This is an automated message from <strong>Kodo</strong>, a personal safety app.
              <strong>${userName}</strong> has not checked in for over 
              <strong>${member.check_in_interval_hours} hours</strong>
              ${hoursOverdue > 0 ? `(now ${hoursOverdue} hour${hoursOverdue > 1 ? "s" : ""} overdue)` : ""}.
            </p>
            <p>
              They listed you as their emergency contact. Please try to get in touch with them 
              or arrange a welfare check if you're unable to reach them.
            </p>
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 4px; margin: 24px 0;">
              <strong>What to do:</strong><br/>
              Try calling or messaging ${userName} first. If you cannot reach them within 
              a reasonable time, consider contacting local authorities to request a welfare check.
            </div>
            <p style="color: #6c757d; font-size: 0.85rem; margin-top: 32px;">
              This alert was sent automatically by Kodo because a scheduled check-in was missed.<br/>
              If this was a mistake, ${userName} can log in and check in at any time to reset the timer.
            </p>
          </div>
        `,
      }),
    });

    if (emailRes.ok) {
      await supabase
        .from("kodo_members")
        .update({ alert_sent: true })
        .eq("email", member.email);

      results.push({ user: member.email, status: "alert_sent" });
      console.log(`Alert sent for ${member.email}`);
    } else {
      const errBody = await emailRes.json();
      results.push({ user: member.email, status: "email_failed", error: errBody });
      console.error(`Email failed for ${member.email}:`, errBody);
    }
  }

  return new Response(JSON.stringify({ checked: members.length, results }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});