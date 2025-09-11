"""
通用工具函数
"""

from typing import Optional, Dict, Any
from fastapi import Request, Header

def get_language_from_request(
    request: Request, 
    accept_language: Optional[str] = Header(None)
) -> str:
    """从请求中获取语言设置"""
    # 首先检查查询参数
    lang = request.query_params.get("lang")
    if lang in ["en", "zh"]:
        return lang
    
    # 然后检查Accept-Language头
    if accept_language:
        if "en" in accept_language.lower():
            return "en"
    
    # 默认返回中文
    return "zh"

def get_localized_field(obj: Any, field_name: str, lang: str = "zh") -> str:
    """根据语言获取本地化字段"""
    if lang == "en":
        en_field = getattr(obj, f"{field_name}_en", None)
        return en_field if en_field else getattr(obj, field_name, "")
    else:
        zh_field = getattr(obj, f"{field_name}_zh", None)
        return zh_field if zh_field else getattr(obj, field_name, "")

def build_response(
    success: bool = True, 
    message: str = "操作成功", 
    data: Any = None
) -> Dict[str, Any]:
    """构建统一的响应格式"""
    response = {
        "success": success,
        "message": message
    }
    
    if data is not None:
        response["data"] = data
    
    return response

def calculate_pagination(total: int, page: int, size: int) -> Dict[str, int]:
    """计算分页信息"""
    pages = (total + size - 1) // size
    return {
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }
