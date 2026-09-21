from __future__ import annotations

from datetime import date, timedelta
from random import Random
from typing import Annotated

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


CHANNELS = {
    "Google Ads": {"spend": 400_000, "roas": 2.75, "cvr": 0.092, "cpc": 84},
    "Meta Ads": {"spend": 300_000, "roas": 2.00, "cvr": 0.071, "cpc": 63},
    "YouTube": {"spend": 100_000, "roas": 3.50, "cvr": 0.054, "cpc": 42},
    "LinkedIn": {"spend": 200_000, "roas": 1.40, "cvr": 0.038, "cpc": 156},
}

app = FastAPI(title="AdPulse Analytics API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def money(value: float) -> int:
    return round(value)


def channel_metrics(name: str, spend: float) -> dict:
    profile = CHANNELS[name]
    revenue = spend * profile["roas"]
    clicks = max(1, round(spend / profile["cpc"]))
    impressions = round(clicks / 0.032)
    leads = round(clicks * profile["cvr"])
    customers = max(1, round(leads * 0.19))
    profit = revenue - spend
    return {
        "channel": name,
        "spend": money(spend),
        "revenue": money(revenue),
        "profit": money(profit),
        "impressions": impressions,
        "clicks": clicks,
        "leads": leads,
        "customers": customers,
        "ctr": round(clicks / impressions * 100, 2),
        "cpc": round(spend / clicks, 2),
        "conversion_rate": round(customers / clicks * 100, 2),
        "cac": round(spend / customers),
        "roas": round(revenue / spend, 2),
        "roi": round(profit / spend * 100, 1),
    }


def get_channel_rows() -> list[dict]:
    return [channel_metrics(name, profile["spend"]) for name, profile in CHANNELS.items()]


def get_summary() -> dict:
    rows = get_channel_rows()
    totals = {key: sum(row[key] for row in rows) for key in ("spend", "revenue", "profit", "impressions", "clicks", "leads", "customers")}
    totals["roas"] = round(totals["revenue"] / totals["spend"], 2)
    totals["cac"] = round(totals["spend"] / totals["customers"])
    totals["conversion_rate"] = round(totals["customers"] / totals["clicks"] * 100, 2)
    return {
        "period": {"start": "2024-08-01", "end": "2024-08-31"},
        "totals": totals,
        "channels": rows,
        "recommendation": {
            "action": "Shift ₹60k to YouTube",
            "reason": "YouTube has the highest marginal return in the current mix.",
            "incremental_revenue": 115_000,
            "projected_roas": 2.71,
        },
    }


class SimulationRequest(BaseModel):
    budget: Annotated[float, Field(gt=0, le=100_000_000)]
    allocation: dict[str, Annotated[float, Field(ge=0)]]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "adpulse-analytics"}


@app.get("/api/summary")
def summary() -> dict:
    return get_summary()


@app.get("/api/campaigns")
def campaigns(limit: Annotated[int, Query(ge=1, le=100)] = 20) -> dict:
    rng = Random(27)
    rows = []
    for index in range(1, limit + 1):
        channel = list(CHANNELS)[(index - 1) % len(CHANNELS)]
        base = CHANNELS[channel]
        spend = base["spend"] / 8 * (0.75 + rng.random() * 0.55)
        metrics = channel_metrics(channel, spend)
        rows.append({"campaign": f"Campaign {index:02d}", "platform": channel, **metrics})
    return {"items": rows}


@app.get("/api/intelligence")
def intelligence() -> dict:
    rows = campaigns(12)["items"]
    summary_data = get_summary()
    account_cvr = summary_data["totals"]["conversion_rate"]
    account_roas = summary_data["totals"]["roas"]
    signals = []
    for row in rows:
        if row["campaign"] == "Campaign 03":
            signals.append({
                "campaign": row["campaign"],
                "platform": row["platform"],
                "severity": "scale",
                "title": "High-conviction winner",
                "detail": f"ROAS is {round(row['roas'] / account_roas * 100 - 100)}% above blended return with enough volume to scale carefully.",
                "metric": f"{row['roas']}x ROAS",
            })
        elif row["platform"] == "LinkedIn":
            signals.append({
                "campaign": row["campaign"],
                "platform": row["platform"],
                "severity": "watch",
                "title": "Efficiency drag",
                "detail": f"CAC is ₹{row['cac']:,}, {round(row['cac'] / get_summary()['totals']['cac'] * 100 - 100)}% above blended CAC.",
                "metric": f"{row['roas']}x ROAS",
            })
        elif row["campaign"] in {"Campaign 02", "Campaign 06"}:
            signals.append({
                "campaign": row["campaign"],
                "platform": row["platform"],
                "severity": "stable",
                "title": "Consistent performer",
                "detail": "Performance is within the expected range with enough volume to keep testing.",
                "metric": f"{row['roas']}x ROAS",
            })
    return {"account_average_cvr": account_cvr, "items": signals}


@app.get("/api/funnel")
def funnel() -> dict:
    totals = get_summary()["totals"]
    stages = [
        {"stage": "Impressions", "value": totals["impressions"], "rate": 100.0},
        {"stage": "Clicks", "value": totals["clicks"], "rate": round(totals["clicks"] / totals["impressions"] * 100, 2)},
        {"stage": "Leads", "value": totals["leads"], "rate": round(totals["leads"] / totals["clicks"] * 100, 2)},
        {"stage": "Customers", "value": totals["customers"], "rate": round(totals["customers"] / totals["leads"] * 100, 2)},
    ]
    for index, stage in enumerate(stages):
        stage["drop_off"] = None if index == 0 else round(100 - stage["value"] / stages[index - 1]["value"] * 100, 1)
    return {"stages": stages, "largest_drop": "Impressions → Clicks", "largest_drop_rate": stages[1]["drop_off"]}


@app.get("/api/analyst")
def analyst(question: Annotated[str, Query(min_length=1, max_length=240)] = "Why did ROI change?") -> dict:
    summary_data = get_summary()
    totals = summary_data["totals"]
    lower_question = question.lower()
    if "scale" in lower_question or "budget" in lower_question:
        answer = "Scale YouTube first, then Google Ads. YouTube has the highest observed ROAS at 3.50x, while LinkedIn is the weakest at 1.40x."
        evidence = ["YouTube ROAS: 3.50x", "LinkedIn ROAS: 1.40x", "Recommended shift: ₹60k"]
    elif "funnel" in lower_question or "drop" in lower_question:
        answer = "The largest volume loss happens between impressions and clicks. Improve creative relevance and audience targeting before increasing spend."
        evidence = [f"CTR: {totals['clicks'] / totals['impressions'] * 100:.2f}%", f"Leads: {totals['leads']:,}", f"Customers: {totals['customers']:,}"]
    else:
        answer = "Blended ROAS is healthy at 2.33x, but the mix is carrying a wide efficiency gap. YouTube is pulling performance up while LinkedIn is diluting return."
        evidence = [f"Revenue: ₹{totals['revenue']:,}", f"Profit: ₹{totals['profit']:,}", f"Blended CAC: ₹{totals['cac']:,}"]
    return {"question": question, "answer": answer, "evidence": evidence, "disclaimer": "Analysis is based on the selected period and modelled attribution."}


@app.post("/api/simulate")
def simulate(request: SimulationRequest) -> dict:
    allocation_total = sum(request.allocation.values())
    if abs(allocation_total - request.budget) > 1:
        return {"error": "allocation_total_must_match_budget", "allocation_total": money(allocation_total), "budget": money(request.budget)}

    results = []
    for channel, spend in request.allocation.items():
        if channel not in CHANNELS or spend == 0:
            continue
        results.append(channel_metrics(channel, spend))
    revenue = sum(row["revenue"] for row in results)
    customers = sum(row["customers"] for row in results)
    spend = sum(row["spend"] for row in results)
    return {
        "estimated": True,
        "disclaimer": "Model estimate based on historical channel efficiency, not a guarantee.",
        "budget": money(spend),
        "revenue": money(revenue),
        "profit": money(revenue - spend),
        "roas": round(revenue / spend, 2) if spend else 0,
        "cac": round(spend / customers) if customers else 0,
        "customers": customers,
        "channels": results,
    }


@app.get("/api/trend")
def trend() -> dict:
    rng = Random(31)
    start = date(2024, 8, 1)
    points = []
    for offset in range(31):
        day = start + timedelta(days=offset)
        spend = 29_000 + rng.randint(-4_000, 5_000)
        revenue = round(spend * (2.05 + offset * 0.012 + rng.random() * 0.35))
        points.append({"date": day.isoformat(), "spend": spend, "revenue": revenue})
    return {"items": points}


app.mount("/", StaticFiles(directory=".", html=True), name="frontend")