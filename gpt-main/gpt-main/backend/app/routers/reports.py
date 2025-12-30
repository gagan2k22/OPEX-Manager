"""
backend/app/routers/reports.py
Reporting and Dashboard endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.schemas import FYFinancials, ServiceMaster

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Fetch high-level financial summary
    """
    stats = db.query(
        func.sum(FYFinancials.budget).label("total_budget"),
        func.sum(FYFinancials.actuals).label("total_actuals")
    ).first()
    
    # Tower-wise spend
    tower_stats = db.query(
        ServiceMaster.tower,
        func.sum(FYFinancials.actuals).label("spend")
    ).join(FYFinancials).group_by(ServiceMaster.tower).all()
    
    # Vendor-wise spend
    vendor_stats = db.query(
        ServiceMaster.vendor,
        func.sum(FYFinancials.actuals).label("spend")
    ).join(FYFinancials).group_by(ServiceMaster.vendor).all()

    return {
        "summary": {
            "budget": stats.total_budget or 0,
            "actuals": stats.total_actuals or 0,
            "variance": (stats.total_budget or 0) - (stats.total_actuals or 0),
            "utilization": round(((stats.total_actuals or 0) / (stats.total_budget or 1)) * 100, 1) if stats.total_budget else 0
        },
        "towerWise": [{"tower": ts.tower, "budget": ts.spend} for ts in tower_stats],
        "vendorWise": [{"vendor": vs.vendor, "actuals": vs.spend} for vs in vendor_stats],
        "monthlyTrend": [] # Mocked for now
    }
