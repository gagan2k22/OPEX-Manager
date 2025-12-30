from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, engine
from app.models.schemas import ServiceMaster, BOARow, BudgetHeadMaster

SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("--- Database Stats ---")
try:
    services = db.query(ServiceMaster).count()
    print(f"ServiceMaster Rows (Tracker): {services}")

    boa = db.query(BOARow).count()
    print(f"BOARow Rows (Allocation Base): {boa}")

    heads = db.query(BudgetHeadMaster).count()
    print(f"BudgetHeadMaster Rows: {heads}")

    # Check for recent data
    if services > 0:
        last = db.query(ServiceMaster).order_by(ServiceMaster.id.desc()).first()
        print(f"Last Service Entry: {last.uid} - {last.service}")

except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
