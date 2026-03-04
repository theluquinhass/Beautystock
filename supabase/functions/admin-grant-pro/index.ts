import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "No authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { target_user_id, days = 30 } = await req.json();

        if (!target_user_id) {
            return new Response(JSON.stringify({ error: "Missing target_user_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // Initialize User Client
        const supabaseUser = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
        if (userError || !user) throw new Error("Unauthorized");

        // Check Admin
        const { data: isAdmin, error: adminError } = await supabaseUser.rpc("is_admin");
        if (!isAdmin || adminError) throw new Error("Forbidden: Not an admin");

        // Initialize Service Role Client for Admin Operations
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Calculate Expiry Data
        const now = new Date();
        const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

        // 1. Update Profile
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({ plan: "pro", is_recurring: false, expires_at: expiresAt })
            .eq("id", target_user_id);

        if (updateError) throw updateError;

        // 2. Audit Log
        await supabaseAdmin.from("audit_logs").insert({
            actor_user_id: user.id,
            action: "grant_pro",
            target_user_id: target_user_id,
            meta: { days, expires_at: expiresAt }
        });

        return new Response(
            JSON.stringify({ success: true, message: `Granted PRO for ${days} days` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (error: any) {
        console.error("Error in admin-grant-pro:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
