"""
backend/seed.py
Database Seeder for initial roles and admin user
"""
import bcrypt
from app.database import SessionLocal, engine, Base
from app.models.schemas import Role, User, UserRole

def seed():
    print("Seeding database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Seed Roles
        roles = ["Admin", "User", "Viewer"]
        for role_name in roles:
            if not db.query(Role).filter_by(name=role_name).first():
                db.add(Role(name=role_name))
        db.commit()
        
        # 2. Seed Admin User
        admin_email = "admin@example.com"
        if not db.query(User).filter_by(email=admin_email).first():
            password = "password123"  # Fixed: Changed from admin123 to match UI demo credentials
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user = User(name="Global Admin", email=admin_email, password_hash=hashed)
            db.add(user)
            db.commit()
            
            # Assign Role
            admin_role = db.query(Role).filter_by(name="Admin").first()
            user.roles.append(admin_role)
            db.commit()
            print(f"Created admin user: {admin_email} / {password}")
        
        print("Seeding complete successfully.")
    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()

