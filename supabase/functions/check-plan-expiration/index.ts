import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase Client (Service Role for Admin operations)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 2. Fetch all PRO users who are NOT recurring and are expiring within 2 days
    // Business logic:
    // - plan = 'pro'
    // - is_recurring = false
    // - expires_at <= NOW() + 2 days OR current_period_end (using expires_at)
    // - last_expiration_notice_at is NULL OR older than 20 hours

    // In JS we can calculate the timestamps:
    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000);

    const { data: expiringProfiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, first_name, email, expires_at, last_expiration_notice_at")
      .eq("plan", "pro")
      .eq("is_recurring", false)
      .not("expires_at", "is", null)
      .lte("expires_at", inTwoDays.toISOString())
      .or(`last_expiration_notice_at.is.null,last_expiration_notice_at.lt.${twentyHoursAgo.toISOString()}`);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${expiringProfiles?.length || 0} users nearing expiration.`);

    let notificationsCreated = 0;

    for (const profile of expiringProfiles || []) {
      // Calculate exactly how many days are left for precision
      const expiryDate = new Date(profile.expires_at!);
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const title = "⚠️ Assinatura PRO Vencendo";
      const message = `Seu plano PRO expira em ${Math.max(0, daysLeft)} dias. Renove agora para não perder o acesso a limites estendidos e recursos premium.`;

      // 3. Insert Notification
      const { error: insertError } = await supabase.from("notifications").insert({
        user_id: profile.id,
        type: "plan_expiring",
        title: title,
        message: message,
        cta_label: "Renovar PRO",
        cta_url: "/conta?renovar=1",
        meta: { days_left: Math.max(0, daysLeft), current_period_end: profile.expires_at }
      });

      if (insertError) {
        console.error(`Failed to create notification for user ${profile.id}:`, insertError);
        continue;
      }

      // 4. Update Profile last_expiration_notice_at
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ last_expiration_notice_at: now.toISOString() })
        .eq("id", profile.id);

      if (updateError) {
        console.error(`Failed to update last_notice for user ${profile.id}:`, updateError);
      } else {
        notificationsCreated++;
      }
    }

    // 5. Process EXPIRED plans (Downgrade and Notify)
    // Any PRO user whose expires_at is strictly in the past (< NOW)
    const { data: expiredProfiles, error: expiredError } = await supabase
      .from("profiles")
      .select("id, first_name")
      .eq("plan", "pro")
      .not("expires_at", "is", null)
      .lt("expires_at", now.toISOString());

    if (expiredError) {
      console.error("Failed to fetch expired profiles:", expiredError);
    } else {
      console.log(`Found ${expiredProfiles?.length || 0} users with expired plans.`);

      for (const expired of expiredProfiles || []) {
        // 1. Downgrade to free
        const { error: downgradeError } = await supabase
          .from("profiles")
          .update({ plan: "free", is_recurring: false })
          .eq("id", expired.id);
        
        if (downgradeError) {
          console.error(`Failed to downgrade user ${expired.id}:`, downgradeError);
          continue;
        }

        // 2. Insert cancellation Notification
        const { error: notifyError } = await supabase.from("notifications").insert({
          user_id: expired.id,
          type: "plan_expired",
          title: "❌ Plano PRO Expirado",
          message: "O seu plano PRO expirou por falta de pagamento. Você voltou ao plano Grátis. Renove agora para recuperar seus recursos e remover os limites restritos.",
          cta_label: "Renovar Agora",
          cta_url: "/conta?renovar=1",
        });

        if (notifyError) {
          console.error(`Failed to send expiration notification to ${expired.id}:`, notifyError);
        } else {
          notificationsCreated++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        users_processed: expiringProfiles?.length || 0,
        notifications_sent: notificationsCreated
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing plan expirations:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
