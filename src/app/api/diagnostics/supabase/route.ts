import { getSupabaseServerClient } from "../../../../lib/supabase-server";

type DiagnosticCategory =
  | "credentials_rejected"
  | "network_error"
  | "rpc_error";

type ProbeResult =
  | { ok: true }
  | { ok: false; category: DiagnosticCategory };

type DiagnosticOptions = {
  supabaseUrl: string | undefined;
  supabaseSecretKey: string | undefined;
  probe: () => Promise<ProbeResult>;
};

function classifyKey(key: string | undefined) {
  if (!key) return "missing" as const;
  if (key.startsWith("sb_secret_")) return "secret" as const;
  if (key.startsWith("sb_publishable_")) return "publishable" as const;
  if (key.startsWith("eyJ")) return "legacy_jwt" as const;
  return "other" as const;
}

function classifyProbeError(message: string): DiagnosticCategory {
  if (
    /permission denied|invalid api key|invalid.*jwt|jwt.*invalid|not authorized|unauthorized|apikey/i.test(
      message,
    )
  ) {
    return "credentials_rejected";
  }

  if (/fetch failed|network|timeout|timed out|enotfound|econn/i.test(message)) {
    return "network_error";
  }

  return "rpc_error";
}

async function probeSupabase(): Promise<ProbeResult> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_preorder_availability");

    if (error) {
      return { ok: false, category: classifyProbeError(error.message) };
    }

    if (!data?.[0]) {
      return { ok: false, category: "rpc_error" };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      category: classifyProbeError(
        error instanceof Error ? error.message : "unknown diagnostic error",
      ),
    };
  }
}

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
    },
  });
}

export async function handleSupabaseDiagnosticRequest({
  supabaseUrl,
  supabaseSecretKey,
  probe,
}: DiagnosticOptions): Promise<Response> {
  const environment = {
    supabaseUrl: supabaseUrl ? ("present" as const) : ("missing" as const),
    supabaseSecretKey: supabaseSecretKey
      ? ("present" as const)
      : ("missing" as const),
    keyType: classifyKey(supabaseSecretKey),
  };

  if (!supabaseUrl || !supabaseSecretKey) {
    return json(
      {
        diagnostic: "brick-buddy-supabase",
        environment,
        connection: {
          status: "not_checked",
          availabilityRpc: "not_checked",
        },
      },
      503,
    );
  }

  const result = await probe();

  if (!result.ok) {
    return json(
      {
        diagnostic: "brick-buddy-supabase",
        environment,
        connection: {
          status: "rejected",
          availabilityRpc: "failed",
          category: result.category,
        },
      },
      503,
    );
  }

  return json(
    {
      diagnostic: "brick-buddy-supabase",
      environment,
      connection: {
        status: "accepted",
        availabilityRpc: "ok",
      },
    },
    200,
  );
}

export async function GET() {
  return handleSupabaseDiagnosticRequest({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    probe: probeSupabase,
  });
}
