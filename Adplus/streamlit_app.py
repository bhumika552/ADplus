import streamlit as st
import pandas as pd

from app import CHANNELS, get_summary, funnel, intelligence, analyst, simulate, SimulationRequest


st.set_page_config(page_title="AdPulse / Marketing Intelligence", page_icon="📈", layout="wide")

st.markdown("""
<style>
    [data-testid="stAppViewContainer"] { background: #101211; color: #f5f5ee; }
    [data-testid="stSidebar"] { background: #171a18; }
    .block-container { max-width: 1400px; padding-top: 2rem; }
    .metric-card { background: #1a1e1b; border: 1px solid #2b302c; border-radius: 8px; padding: 1rem; }
    h1, h2, h3 { letter-spacing: -0.04em; }
</style>
""", unsafe_allow_html=True)


def rupees(value: float) -> str:
    return f"₹{value:,.0f}"


summary = get_summary()
totals = summary["totals"]

with st.sidebar:
    st.title("adpulse")
    st.caption("Marketing ROI intelligence")
    page = st.radio("Workspace", ["Overview", "Channel mix", "Customer funnel", "Budget simulator", "AI analyst", "Campaign intelligence"])
    st.divider()
    st.success("Analytics engine online")
    st.caption("FastAPI-compatible deterministic model")

st.title(f"{page}.")
st.caption("Northstar Labs / August 2024 · Model estimates are not guarantees")

if page == "Overview":
    columns = st.columns(4)
    columns[0].metric("Total spend", rupees(totals["spend"]))
    columns[1].metric("Attributed revenue", rupees(totals["revenue"]), "+18.1%")
    columns[2].metric("Blended ROAS", f"{totals['roas']}x", "+0.31x")
    columns[3].metric("New customers", f"{totals['customers']:,}")
    st.subheader("Channel performance")
    st.dataframe(pd.DataFrame(summary["channels"])[["channel", "spend", "revenue", "roas", "cac", "roi"]], use_container_width=True, hide_index=True)
    st.info(f"Recommendation: {summary['recommendation']['action']}. {summary['recommendation']['reason']}")

elif page == "Channel mix":
    rows = pd.DataFrame(summary["channels"])
    st.subheader("Channel economics")
    st.dataframe(rows[["channel", "spend", "revenue", "profit", "roas", "ctr", "cac", "conversion_rate", "roi"]], use_container_width=True, hide_index=True)
    st.bar_chart(rows.set_index("channel")["roas"], color="#d7ff62")

elif page == "Customer funnel":
    funnel_data = funnel()
    rows = pd.DataFrame(funnel_data["stages"])
    st.subheader("August conversion flow")
    st.dataframe(rows, use_container_width=True, hide_index=True)
    st.bar_chart(rows.set_index("stage")["value"], color="#d7ff62")
    st.warning(f"Largest drop-off: {funnel_data['largest_drop']} ({funnel_data['largest_drop_rate']}%).")

elif page == "Campaign intelligence":
    st.subheader("Signals to act on")
    for item in intelligence()["items"]:
        label = f"{item['severity'].upper()} · {item['campaign']} · {item['platform']} · {item['metric']}"
        with st.expander(label):
            st.write(item["title"])
            st.caption(item["detail"])

elif page == "Budget simulator":
    st.subheader("Build a scenario")
    budget = st.number_input("Total budget", min_value=10_000, value=1_000_000, step=10_000)
    allocation = {}
    columns = st.columns(2)
    for index, channel in enumerate(CHANNELS):
        allocation[channel] = columns[index % 2].number_input(channel, min_value=0, value=CHANNELS[channel]["spend"], step=10_000)
    allocated = sum(allocation.values())
    st.caption(f"Allocated: {rupees(allocated)} / {rupees(budget)}")
    if st.button("Run simulation", type="primary"):
        if allocated != budget:
            st.error("Allocation must equal the total budget.")
        else:
            result = simulate(SimulationRequest(budget=budget, allocation=allocation))
            metrics = st.columns(4)
            metrics[0].metric("Expected revenue", rupees(result["revenue"]))
            metrics[1].metric("Expected profit", rupees(result["profit"]))
            metrics[2].metric("Expected ROAS", f"{result['roas']}x")
            metrics[3].metric("Expected CAC", rupees(result["cac"]))
            st.caption(result["disclaimer"])

else:
    st.subheader("Ask about your data")
    question = st.text_input("Business question", "Which channels should we scale?")
    if st.button("Ask analyst", type="primary"):
        result = analyst(question)
        st.success(result["answer"])
        st.write("Evidence")
        st.dataframe(pd.DataFrame({"Signal": result["evidence"]}), use_container_width=True, hide_index=True)
        st.caption(result["disclaimer"])