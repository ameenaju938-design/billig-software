from sqlalchemy import create_engine, MetaData
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
postgres_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/abaya_store')

engine = create_engine(postgres_url)
meta = MetaData()
meta.reflect(bind=engine)
meta.drop_all(bind=engine)
print("All tables dropped successfully.")
