from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    storage_sources = relationship("StorageSource", back_populates="owner")

class StorageSource(Base):
    __tablename__ = "storage_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    webdav_url = Column(String(200))
    original_username = Column(String(100))
    original_password = Column(String(200))
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="storage_sources")
    proxy_credentials = relationship("ProxyCredential", back_populates="storage_source")

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True)
    allow_registration = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProxyCredential(Base):
    __tablename__ = "proxy_credentials"

    id = Column(Integer, primary_key=True, index=True)
    proxy_username = Column(String(100), unique=True)
    proxy_password = Column(String(200))
    storage_source_id = Column(Integer, ForeignKey("storage_sources.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    storage_source = relationship("StorageSource", back_populates="proxy_credentials")