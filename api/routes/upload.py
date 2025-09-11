"""
文件上传相关API路由
"""

import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from api.models import get_db, Admin
from api.utils import get_current_admin
from config.config import Config

router = APIRouter(prefix="/upload", tags=["文件上传"])

# 支持的图片格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename: str) -> bool:
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename: str) -> str:
    """生成唯一的文件名"""
    ext = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return unique_filename

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """上传图片文件（需要管理员权限）"""
    
    # 检查文件是否存在
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未选择文件"
        )
    
    # 检查文件格式
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件格式，支持的格式: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 检查文件大小
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超出限制，最大允许 {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # 确保上传目录存在
    config = Config()
    upload_dir = config.get_upload_dir()
    os.makedirs(upload_dir, exist_ok=True)
    
    # 生成唯一文件名
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(upload_dir, unique_filename)
    
    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件保存失败: {str(e)}"
        )
    
    # 构建文件URL
    file_url = f"{config.get_base_url()}/uploads/{unique_filename}"
    
    return {
        "message": "文件上传成功",
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_url": file_url,
        "file_size": len(file_content)
    }

@router.post("/images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """批量上传图片文件（需要管理员权限）"""
    
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未选择文件"
        )
    
    if len(files) > 10:  # 限制最多同时上传10个文件
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="一次最多上传10个文件"
        )
    
    config = Config()
    upload_dir = config.get_upload_dir()
    os.makedirs(upload_dir, exist_ok=True)
    
    results = []
    errors = []
    
    for file in files:
        try:
            # 检查文件名
            if not file.filename:
                errors.append({"filename": "unknown", "error": "文件名为空"})
                continue
            
            # 检查文件格式
            if not allowed_file(file.filename):
                errors.append({
                    "filename": file.filename,
                    "error": f"不支持的文件格式，支持的格式: {', '.join(ALLOWED_EXTENSIONS)}"
                })
                continue
            
            # 检查文件大小
            file_content = await file.read()
            if len(file_content) > MAX_FILE_SIZE:
                errors.append({
                    "filename": file.filename,
                    "error": f"文件大小超出限制，最大允许 {MAX_FILE_SIZE // (1024*1024)}MB"
                })
                continue
            
            # 生成唯一文件名并保存
            unique_filename = generate_unique_filename(file.filename)
            file_path = os.path.join(upload_dir, unique_filename)
            
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
            
            # 构建文件URL
            file_url = f"{config.get_base_url()}/uploads/{unique_filename}"
            
            results.append({
                "filename": unique_filename,
                "original_filename": file.filename,
                "file_url": file_url,
                "file_size": len(file_content)
            })
            
        except Exception as e:
            errors.append({
                "filename": file.filename if file.filename else "unknown",
                "error": f"上传失败: {str(e)}"
            })
    
    return {
        "message": f"批量上传完成，成功 {len(results)} 个，失败 {len(errors)} 个",
        "successful_uploads": results,
        "failed_uploads": errors
    }

@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    current_admin: Admin = Depends(get_current_admin)
):
    """删除上传的图片文件（需要管理员权限）"""
    
    config = Config()
    upload_dir = config.get_upload_dir()
    file_path = os.path.join(upload_dir, filename)
    
    # 检查文件是否存在
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在"
        )
    
    # 安全检查，确保文件在上传目录内
    if not os.path.abspath(file_path).startswith(os.path.abspath(upload_dir)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="非法的文件路径"
        )
    
    try:
        os.remove(file_path)
        return {"message": "文件删除成功", "filename": filename}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件删除失败: {str(e)}"
        )
