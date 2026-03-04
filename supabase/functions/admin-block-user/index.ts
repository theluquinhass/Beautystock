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

        const { target_user_id, block = true } = await req.json();

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

        // 1. Update User ban status at Auth level
        const banDuration = block ? "87600h" : "none"; // 10 years or unban
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            target_user_id,
            { ban_duration: banDuration }
        );

        if (authError) throw authError;

        // 2. Audit Log
        await supabaseAdmin.from("audit_logs").insert({
            actor_user_id: user.id,
            action: block ? "block_user" : "unblock_user",
            target_user_id: target_user_id,
            meta: { block }
        });

        return new Response(
            JSON.stringify({ success: true, message: `User ${block ? 'blocked' : 'unblocked'} successfully` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (error: any) {
        console.error("Error in admin-block-user:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
