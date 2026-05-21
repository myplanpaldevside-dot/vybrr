import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!profile) throw new Error("Profile not found");

    const { amount, bank_code, account_number, account_name, bank_name } = await req.json();

    if (!amount || !bank_code || !account_number || !account_name) {
      throw new Error("Missing required fields");
    }

    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET) throw new Error("Paystack secret key not configured");

    // Step 1: Create transfer recipient
    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: account_name,
        account_number,
        bank_code,
        currency: "NGN",
      }),
    });
    const recipientData = await recipientRes.json();
    if (!recipientData.status) throw new Error(recipientData.message || "Failed to create transfer recipient");

    const recipient_code = recipientData.data.recipient_code;

    // Step 2: Initiate transfer
    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(amount * 100),
        recipient: recipient_code,
        reason: "Vybrr creator withdrawal",
      }),
    });
    const transferData = await transferRes.json();
    if (!transferData.status) throw new Error(transferData.message || "Failed to initiate transfer");

    const transfer_code = transferData.data.transfer_code;

    // Step 3: Record withdrawal
    const { error: dbError } = await supabase.from("withdrawals").insert({
      creator_id: profile.id,
      amount,
      bank_name: bank_name || account_name,
      bank_code,
      account_number,
      account_name,
      transfer_code,
      paystack_recipient_code: recipient_code,
      status: "processing",
    });
    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true, transfer_code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
