from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_schema():
    with engine.begin() as conn:
        inspector = inspect(conn)
        if "users" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("users")}
        column_definitions = {
            "bio": "VARCHAR(500)",
            "top_platform_name": "VARCHAR(100)",
            "top_platform_handle": "VARCHAR(100)",
            "top_platform_url": "VARCHAR(500)",
            "skills": "VARCHAR(500)",
            "is_admin": "BOOLEAN DEFAULT FALSE",
        }

        for column_name, column_definition in column_definitions.items():
            if column_name not in existing_columns:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_definition}"))


ensure_schema()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()