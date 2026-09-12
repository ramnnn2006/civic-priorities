// server/index.ts
import express from "express";
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

// src/data.ts
var categoryMeta = {
  water: { label: "Drinking water", icon: "Water", keywords: ["water", "tap", "drinking", "\u092A\u093E\u0928\u0940", "\u091C\u0932", "\u0BA4\u0BA3\u0BCD\u0BA3\u0BC0\u0BB0\u0BCD", "\u0B95\u0BC1\u0B9F\u0BBF\u0BA8\u0BC0\u0BB0\u0BCD", "\xE1gua"] },
  roads: { label: "Primary roads", icon: "Route", keywords: ["road", "street", "pothole", "\u0938\u0921\u093C\u0915", "\u0930\u093E\u0938\u094D\u0924\u093E", "\u0B9A\u0BBE\u0BB2\u0BC8", "\u0BAA\u0BBE\u0BA4\u0BC8", "rua", "estrada"] },
  lighting: { label: "Public lighting", icon: "Lightbulb", keywords: ["light", "lamp", "dark", "\u092C\u0924\u094D\u0924\u0940", "\u0930\u094B\u0936\u0928\u0940", "\u0BB5\u0BBF\u0BB3\u0B95\u0BCD\u0B95\u0BC1", "\u0B87\u0BB0\u0BC1\u0BB3\u0BCD", "luz", "ilumina\xE7\xE3o"] }
};
var configs = [
  {
    id: "IN-TN",
    country: "India",
    state: "Tamil Nadu",
    locale: "ta-IN",
    language: "Tamil",
    currency: "INR",
    taxonomy: { water: "\u0B95\u0BC1\u0B9F\u0BBF\u0BA8\u0BC0\u0BB0\u0BCD \u0B85\u0BA3\u0BC1\u0B95\u0BB2\u0BCD", roads: "\u0BAE\u0BC1\u0BA4\u0BA9\u0BCD\u0BAE\u0BC8 \u0B9A\u0BBE\u0BB2\u0BC8 \u0B85\u0BA3\u0BC1\u0B95\u0BB2\u0BCD", lighting: "\u0BAA\u0BCA\u0BA4\u0BC1 \u0BB5\u0BBF\u0BB3\u0B95\u0BCD\u0B95\u0BC1 \u0BAA\u0BBE\u0BA4\u0BC1\u0B95\u0BBE\u0BAA\u0BCD\u0BAA\u0BC1" },
    regions: [
      { id: "TN-KOV-N", label: "Kovilpatti North", population: 1e4, category: "water", coverage: 0.2, targetCoverage: 1, seededRequests: 30, costMinor: 6e6, budgetMinor: 1e7, currency: "INR", project: "Extend piped-water network", description: "Synthetic planning fixture \xB7 FY 2026" },
      { id: "TN-SAN-E", label: "Sankarankovil East", population: 1e4, category: "water", coverage: 0.7, targetCoverage: 1, seededRequests: 60, costMinor: 6e6, budgetMinor: 1e7, currency: "INR", project: "Repair community water points", description: "Synthetic planning fixture \xB7 FY 2026" },
      { id: "TN-TIR-W", label: "Tirunelveli West", population: 8e3, category: "lighting", coverage: 0.46, targetCoverage: 0.9, seededRequests: 36, costMinor: 35e5, budgetMinor: 1e7, currency: "INR", project: "Install safe-route lighting", description: "Synthetic planning fixture \xB7 FY 2026" }
    ]
  },
  {
    id: "IN-UP",
    country: "India",
    state: "Uttar Pradesh",
    locale: "hi-IN",
    language: "Hindi",
    currency: "INR",
    taxonomy: { water: "\u092A\u0947\u092F\u091C\u0932 \u092A\u0939\u0941\u0901\u091A", roads: "\u092E\u0941\u0916\u094D\u092F \u0938\u0921\u093C\u0915 \u092A\u0939\u0941\u0901\u091A", lighting: "\u0938\u093E\u0930\u094D\u0935\u091C\u0928\u093F\u0915 \u092A\u094D\u0930\u0915\u093E\u0936 \u0938\u0941\u0930\u0915\u094D\u0937\u093E" },
    regions: [
      { id: "UP-MAH-N", label: "Mahoba North", population: 12e3, category: "water", coverage: 0.38, targetCoverage: 1, seededRequests: 68, costMinor: 58e5, budgetMinor: 105e5, currency: "INR", project: "Rehabilitate village water line", description: "Synthetic planning fixture \xB7 FY 2026" },
      { id: "UP-CHA-E", label: "Chitrakoot East", population: 9e3, category: "roads", coverage: 0.41, targetCoverage: 0.85, seededRequests: 54, costMinor: 62e5, budgetMinor: 105e5, currency: "INR", project: "Upgrade all-weather access road", description: "Synthetic planning fixture \xB7 FY 2026" },
      { id: "UP-HAM-S", label: "Hamirpur South", population: 11e3, category: "lighting", coverage: 0.58, targetCoverage: 0.9, seededRequests: 28, costMinor: 29e5, budgetMinor: 105e5, currency: "INR", project: "Light school-to-market route", description: "Synthetic planning fixture \xB7 FY 2026" }
    ]
  },
  {
    id: "BR-PE",
    country: "Brazil",
    state: "Pernambuco",
    locale: "pt-BR",
    language: "Portuguese",
    currency: "BRL",
    taxonomy: { water: "acesso \xE0 \xE1gua pot\xE1vel", roads: "acesso vi\xE1rio prim\xE1rio", lighting: "ilumina\xE7\xE3o p\xFAblica segura" },
    regions: [
      { id: "BR-REC-N", label: "Recife Norte", population: 1e4, category: "water", coverage: 0.28, targetCoverage: 1, seededRequests: 42, costMinor: 61e4, budgetMinor: 1e6, currency: "BRL", project: "Expandir rede de \xE1gua", description: "Synthetic planning fixture \xB7 FY 2026" },
      { id: "BR-OLI-E", label: "Olinda Leste", population: 9e3, category: "roads", coverage: 0.5, targetCoverage: 0.85, seededRequests: 45, costMinor: 64e4, budgetMinor: 1e6, currency: "BRL", project: "Requalificar via de acesso", description: "Synthetic planning fixture \xB7 FY 2026" },
      { id: "BR-JAB-S", label: "Jaboat\xE3o Sul", population: 11e3, category: "lighting", coverage: 0.44, targetCoverage: 0.9, seededRequests: 55, costMinor: 33e4, budgetMinor: 1e6, currency: "BRL", project: "Iluminar rota comunit\xE1ria", description: "Synthetic planning fixture \xB7 FY 2026" }
    ]
  }
];

// src/engine.ts
var findCategory = (text) => {
  const normalized = text.toLocaleLowerCase();
  return Object.keys(categoryMeta).find(
    (category) => categoryMeta[category].keywords.some((keyword) => normalized.includes(keyword))
  ) ?? "water";
};
var makeDraft = (text, regionId, locale, channel) => {
  const category = findCategory(text);
  const match = categoryMeta[category].keywords.find((keyword) => text.toLocaleLowerCase().includes(keyword));
  const codeUnitStart = match ? text.toLocaleLowerCase().indexOf(match.toLocaleLowerCase()) : 0;
  const start = Array.from(text.slice(0, codeUnitStart)).length;
  const end = start + Array.from(match ?? text.slice(0, 1)).length;
  const quote = Array.from(text).slice(start, end).join("");
  return {
    id: crypto.randomUUID(),
    text,
    regionId,
    locale,
    channel,
    category,
    status: "draft",
    spans: [{ start, end, quote, field: "need" }]
  };
};
function scoreCandidates(regions, drafts, weight, missingPlan) {
  if (new Set(regions.map((region) => region.category)).size > 1) {
    throw new Error("Candidates must share one category and comparable metric definition before they can be ranked.");
  }
  const available = [...regions];
  const results = available.map((region) => {
    const added = drafts.filter((draft) => draft.status === "confirmed" && draft.regionId === region.id && draft.category === region.category).length;
    const requestUnits = region.seededRequests + added;
    const rate = 1e3 * requestUnits / region.population;
    const demand = Math.min(1, rate / 10);
    const gap = Math.max(0, (region.targetCoverage - region.coverage) / region.targetCoverage);
    const planMissing = missingPlan && region.id === available[1]?.id;
    const score = 100 * (weight * demand + (1 - weight) * gap);
    return { ...region, requestUnits, rate, demand, gap, score: planMissing ? null : score, eligibility: planMissing ? "BLOCKED" : "ELIGIBLE", reason: planMissing ? "Investment inventory removed for this scenario." : void 0, selected: false };
  });
  const budget = results[0]?.budgetMinor ?? 0;
  let remaining = budget;
  return [...results].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)).map((candidate) => {
    if (candidate.eligibility !== "ELIGIBLE") return candidate;
    if (candidate.costMinor > remaining) return { ...candidate, eligibility: "BUDGET_EXCLUDED", reason: "Does not fit the remaining local budget." };
    remaining -= candidate.costMinor;
    return { ...candidate, selected: true };
  });
}

// server/index.ts
var dirname = path.dirname(fileURLToPath(import.meta.url));
var root = path.resolve(dirname, "..");
var configId = z.enum(["IN-TN", "IN-UP", "BR-PE"]);
var uuid = z.string().uuid();
var sessionTtlMs = 24 * 60 * 60 * 1e3;
var getConfig = (id) => configs.find((config) => config.id === id);
var apiError = (res, status, error) => res.status(status).json({ error });
var getSession = (sessions, id) => {
  const now = Date.now();
  for (const [key, value] of sessions) if (now - value.touchedAt > sessionTtlMs) sessions.delete(key);
  let session = sessions.get(id);
  if (!session) {
    if (sessions.size >= 100) throw new Error("capacity");
    session = { touchedAt: now, drafts: /* @__PURE__ */ new Map(), confirmed: [], plans: /* @__PURE__ */ new Map() };
    sessions.set(id, session);
  }
  session.touchedAt = now;
  return session;
};
async function getPlanRationale(plan, config) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `You are an AI civic planning auditor for an evidence-gated municipal prioritization system.
Region: ${config.country}, ${config.state} (${config.language})
Infrastructure Category: ${plan.category}
Candidates evaluated:
${JSON.stringify(plan.candidates, null, 2)}

Provide an audit rationale in JSON format with:
"summary": A clear 1-2 sentence executive explanation of the ranking and top candidate.
"reasons": An array of 2-3 specific evidence-backed observations (referencing request counts, rates per 1,000, infrastructure gap, and investment-block status).
"caveats": An array of 2 essential civic caveats (e.g. digital submission disparity, synthetic fixtures, requirement for human verification).
Respond ONLY with a valid JSON object matching { "summary": "...", "reasons": [...], "caveats": [...] }.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
        signal: AbortSignal.timeout(8e3)
      });
      if (response.ok) {
        const json = await response.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed && typeof parsed.summary === "string") {
            return {
              provider: "gemini-2.5-flash",
              rationale: {
                summary: parsed.summary,
                reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
                caveats: Array.isArray(parsed.caveats) ? parsed.caveats.map(String) : []
              }
            };
          }
        }
      }
    } catch {
    }
  }
  const top = plan.candidates.find((c) => c.selected);
  const blocked = plan.candidates.filter((c) => c.eligibility !== "ELIGIBLE");
  return {
    provider: "deterministic-rules",
    rationale: {
      summary: top ? `${top.project} in ${top.label} is ranked highest based on ${top.requestUnits} verified community requests (${top.rate.toFixed(1)}/1k residents) and a ${(top.gap * 100).toFixed(0)}% infrastructure deficit.` : "No project candidate was shortlisted under the current constraints.",
      reasons: [
        `The formula combines normalized demand D (${top ? top.demand.toFixed(2) : "0"}) and infrastructure gap G (${top ? top.gap.toFixed(2) : "0"}).`,
        blocked.length > 0 ? `${blocked.map((b) => b.project).join(", ")} is blocked from scoring due to missing investment inventory evidence.` : "All evaluated candidates possess verified baseline investment evidence.",
        "Selection respects the budgetary envelope without cross-category confounding."
      ],
      caveats: [
        apiKey ? "Live Gemini call timed out or failed; deterministic explanation used." : "No Gemini API key configured in server environment; deterministic audit rationale returned.",
        "This calculation is an evidence-gated decision support prototype, not a binding government allocation."
      ]
    }
  };
}
function createApp() {
  const app2 = express();
  const sessions = /* @__PURE__ */ new Map();
  app2.use(express.json({ limit: "1mb" }));
  app2.get("/health", (_req, res) => res.json({
    status: "ok",
    aiMode: process.env.GEMINI_API_KEY ? "gemini-live" : "local-fallback",
    provider: process.env.GEMINI_API_KEY ? "google-gemini" : "deterministic-engine",
    persistence: "ephemeral-demo",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }));
  app2.get("/api/v1/config", (_req, res) => res.json(configs.map(({ regions, ...config }) => ({ ...config, regions: regions.map(({ population, coverage, seededRequests, costMinor, budgetMinor, ...region }) => region), limitations: ["Synthetic planning fixtures", "Local extraction fallback until a server-side Gemini adapter is configured"] }))));
  app2.post("/api/v1/intake/analyze", (req, res) => {
    const body = z.object({ sessionId: uuid, configId, regionId: z.string().min(1), text: z.string().min(1).max(5e3), channel: z.enum(["text", "voice", "message_import"]).default("text") }).safeParse(req.body);
    if (!body.success) return apiError(res, 422, "Invalid intake request");
    const config = getConfig(body.data.configId);
    const region = config.regions.find((item) => item.id === body.data.regionId);
    if (!region) return apiError(res, 422, "Region is not supported by this configuration");
    if (findCategory(body.data.text) !== region.category) return res.status(422).json({ error: "Clarification required: choose a planning region that supports the extracted need." });
    try {
      const session = getSession(sessions, body.data.sessionId);
      if (session.drafts.size >= 100) return apiError(res, 429, "Demo draft limit reached");
      const draft = makeDraft(body.data.text, region.id, config.locale, body.data.channel);
      session.drafts.set(draft.id, { draft, configId: config.id, expiresAt: Date.now() + 15 * 60 * 1e3 });
      return res.status(201).json({ draft, execution: { mode: "local-fallback", provider: null, warning: "No Gemini call was made." } });
    } catch {
      return apiError(res, 503, "Demo session capacity reached");
    }
  });
  app2.post("/api/v1/requests/confirm", (req, res) => {
    const body = z.object({ sessionId: uuid, draftId: uuid }).safeParse(req.body);
    if (!body.success) return apiError(res, 422, "Invalid confirmation request");
    const session = sessions.get(body.data.sessionId);
    const stored = session?.drafts.get(body.data.draftId);
    if (!session || !stored || stored.expiresAt < Date.now()) return apiError(res, 404, "Draft not found or expired");
    const { draft } = stored;
    const validSpans = draft.spans.length > 0 && draft.spans.every((span) => span.end > span.start && span.quote.length > 0 && Array.from(draft.text).slice(span.start, span.end).join("") === span.quote);
    const config = getConfig(stored.configId);
    const region = config.regions.find((item) => item.id === draft.regionId);
    if (!validSpans || !region || region.category !== draft.category || config.locale !== draft.locale) return apiError(res, 422, "Draft evidence or configuration is invalid");
    const confirmed = { ...draft, status: "confirmed" };
    session.drafts.delete(draft.id);
    if (!session.confirmed.some((item) => item.id === confirmed.id)) session.confirmed.push(confirmed);
    return res.status(201).json({ request: confirmed, idempotent: false });
  });
  app2.post("/api/v1/intake/import", (req, res) => {
    const body = z.object({ sessionId: uuid, configId, regionId: z.string().min(1), records: z.array(z.object({ externalRecordId: z.string().max(120).optional(), text: z.string().min(1).max(5e3) })).min(1).max(100) }).safeParse(req.body);
    if (!body.success) return apiError(res, 422, "Invalid message import");
    const config = getConfig(body.data.configId);
    const region = config.regions.find((item) => item.id === body.data.regionId);
    if (!region) return apiError(res, 422, "Region is not supported by this configuration");
    try {
      const session = getSession(sessions, body.data.sessionId);
      const drafts = [];
      const errors = [];
      body.data.records.forEach((record, index) => {
        if (findCategory(record.text) !== region.category) {
          errors.push({ index, error: "Need does not match selected planning region category" });
          return;
        }
        if (session.drafts.size + drafts.length >= 100) {
          errors.push({ index, error: "Demo draft limit reached" });
          return;
        }
        const draft = makeDraft(record.text, region.id, config.locale, "message_import");
        session.drafts.set(draft.id, { draft, configId: config.id, expiresAt: Date.now() + 15 * 60 * 1e3 });
        drafts.push(draft);
      });
      return res.status(201).json({ drafts, errors, execution: { mode: "local-fallback", provider: null } });
    } catch {
      return apiError(res, 503, "Demo session capacity reached");
    }
  });
  app2.get("/api/v1/clusters", (req, res) => {
    const sessionId = uuid.safeParse(req.query.sessionId);
    const activeConfigId = configId.safeParse(req.query.configId);
    if (!sessionId.success || !activeConfigId.success) return apiError(res, 422, "Valid sessionId and configId are required");
    const session = sessions.get(sessionId.data);
    const config = getConfig(activeConfigId.data);
    return res.json(config.regions.map((region) => ({ regionId: region.id, label: region.label, category: region.category, seededRequests: region.seededRequests, confirmedSessionRequests: session?.confirmed.filter((draft) => draft.regionId === region.id && draft.category === region.category).length ?? 0, population: region.population, coverageDeclared: true, sourceMode: "synthetic" })));
  });
  app2.post("/api/v1/plans/compute", (req, res) => {
    const body = z.object({ sessionId: uuid, configId, category: z.enum(["water", "roads", "lighting"]).default("water"), demandWeight: z.number().min(0).max(1), simulateMissingInvestment: z.boolean().default(false) }).safeParse(req.body);
    if (!body.success) return apiError(res, 422, "Invalid planning request");
    try {
      const session = getSession(sessions, body.data.sessionId);
      if (session.plans.size >= 50) return apiError(res, 429, "Demo planning-run limit reached");
      const config = getConfig(body.data.configId);
      const candidates = scoreCandidates(config.regions.filter((region) => region.category === body.data.category), session.confirmed, body.data.demandWeight, body.data.simulateMissingInvestment);
      const plan = { id: randomUUID(), revision: 1, configId: config.id, category: body.data.category, candidates, createdAt: (/* @__PURE__ */ new Date()).toISOString(), evidenceHash: createHash("sha256").update(JSON.stringify({ config: config.id, candidates, policy: body.data.demandWeight })).digest("hex") };
      session.plans.set(plan.id, plan);
      return res.status(201).json({ ...plan, sourceMode: "synthetic", policyVersion: "demo-v1", disclaimer: "A reviewed prototype calculation, not a government allocation." });
    } catch {
      return apiError(res, 503, "Demo session capacity reached");
    }
  });
  const loadPlan = (req, res) => {
    const sessionId = uuid.safeParse(req.body?.sessionId ?? req.query.sessionId);
    const planId = uuid.safeParse(req.params.id);
    if (!sessionId.success || !planId.success) {
      apiError(res, 422, "Valid sessionId and plan ID are required");
      return null;
    }
    const plan = sessions.get(sessionId.data)?.plans.get(planId.data);
    if (!plan) {
      apiError(res, 404, "Planning run not found");
      return null;
    }
    return plan;
  };
  app2.get("/api/v1/plans/:id", (req, res) => {
    const plan = loadPlan(req, res);
    if (plan) res.json(plan);
  });
  app2.get("/api/v1/plans/:id/explain", async (req, res) => {
    const plan = loadPlan(req, res);
    if (!plan) return;
    const config = getConfig(plan.configId);
    const { provider, rationale } = await getPlanRationale(plan, config);
    res.json({ planId: plan.id, revision: plan.revision, evidenceHash: plan.evidenceHash, provider, rationale });
  });
  app2.post("/api/v1/plans/:id/explain", async (req, res) => {
    const plan = loadPlan(req, res);
    if (!plan) return;
    const config = getConfig(plan.configId);
    const { provider, rationale } = await getPlanRationale(plan, config);
    res.json({ planId: plan.id, revision: plan.revision, evidenceHash: plan.evidenceHash, provider, rationale });
  });
  app2.post("/api/v1/plans/:id/review", (req, res) => {
    const body = z.object({ sessionId: uuid, decision: z.enum(["reviewed", "rejected"]), note: z.string().max(1e3).default(""), expectedRevision: z.number().int().positive() }).safeParse(req.body);
    if (!body.success) return apiError(res, 422, "Invalid review");
    const plan = loadPlan(req, res);
    if (!plan) return;
    if (plan.revision !== body.data.expectedRevision) return apiError(res, 409, "Planning run was updated; reload before reviewing");
    plan.reviewed = { decision: body.data.decision, note: body.data.note, savedAt: (/* @__PURE__ */ new Date()).toISOString() };
    plan.revision += 1;
    return res.status(201).json({ id: plan.id, revision: plan.revision, ...plan.reviewed });
  });
  app2.use("/api", (_req, res) => apiError(res, 404, "API route not found"));
  const dist = path.join(root, "dist");
  if (existsSync(dist)) {
    app2.use(express.static(dist));
    app2.use((req, res) => req.accepts("html") ? res.sendFile(path.join(dist, "index.html")) : res.status(404).end());
  }
  return app2;
}
if (process.env.RUN_SERVER === "true") {
  const port = Number(process.env.PORT ?? 4173);
  createApp().listen(port, "0.0.0.0", () => console.log(`CivicPriorities API listening on :${port}`));
}

// server/vercel.ts
var app = createApp();
var vercel_default = app;
export {
  vercel_default as default
};
