from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import string

from . import models, auth
from .database import engine, get_db
from pydantic import BaseModel

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    username: str
    password: str
    email: str

class StorageSourceCreate(BaseModel):
    name: str
    webdav_url: str
    original_username: str
    original_password: str

class ProxyCredentialCreate(BaseModel):
    storage_source_id: int
    expires_days: int = 30

def generate_proxy_credentials():
    alphabet = string.ascii_letters + string.digits
    username = ''.join(secrets.choice(alphabet) for _ in range(12))
    password = ''.join(secrets.choice(alphabet + string.punctuation) for _ in range(16))
    return username, password

@app.post("/users/")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 检查是否允许注册
    system_config = db.query(models.SystemConfig).first()
    if system_config is None:
        system_config = models.SystemConfig()
        db.add(system_config)
        db.commit()
    
    # 如果不是第一个用户且注册功能已关闭，则拒绝注册
    user_count = db.query(models.User).count()
    if user_count > 0 and not system_config.allow_registration:
        raise HTTPException(status_code=403, detail="Registration is currently disabled")
    
    # 检查用户名是否已存在
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        email=user.email,
        is_admin=(user_count == 0)  # 第一个注册的用户自动成为管理员
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"username": db_user.username, "email": db_user.email, "is_admin": db_user.is_admin}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/storage-sources/")
async def create_storage_source(
    source: StorageSourceCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_source = models.StorageSource(
        name=source.name,
        webdav_url=source.webdav_url,
        original_username=source.original_username,
        original_password=source.original_password,
        owner_id=current_user.id
    )
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@app.get("/storage-sources/")
async def list_storage_sources(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.StorageSource).filter(models.StorageSource.owner_id == current_user.id).all()

@app.post("/proxy-credentials/")
async def create_proxy_credential(
    credential: ProxyCredentialCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    storage_source = db.query(models.StorageSource).filter(
        models.StorageSource.id == credential.storage_source_id,
        models.StorageSource.owner_id == current_user.id
    ).first()
    
    if not storage_source:
        raise HTTPException(status_code=404, detail="Storage source not found")
    
    proxy_username, proxy_password = generate_proxy_credentials()
    expires_at = datetime.utcnow() + timedelta(days=credential.expires_days)
    
    db_credential = models.ProxyCredential(
        proxy_username=proxy_username,
        proxy_password=proxy_password,
        storage_source_id=storage_source.id,
        expires_at=expires_at
    )
    db.add(db_credential)
    db.commit()
    db.refresh(db_credential)
    return db_credential

@app.get("/proxy-credentials/")
async def list_proxy_credentials(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.ProxyCredential).join(
        models.StorageSource
    ).filter(
        models.StorageSource.owner_id == current_user.id
    ).all()

# 管理员接口
def admin_required(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@app.put("/admin/system-config/registration")
async def update_registration_status(
    allow_registration: bool,
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    system_config = db.query(models.SystemConfig).first()
    if system_config is None:
        system_config = models.SystemConfig()
        db.add(system_config)
    system_config.allow_registration = allow_registration
    db.commit()
    db.refresh(system_config)
    return {"allow_registration": system_config.allow_registration}

@app.get("/admin/users")
async def list_users(
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()

@app.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}