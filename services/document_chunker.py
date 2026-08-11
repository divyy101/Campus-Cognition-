"""
Campus Cognition V2 — Document Chunker
Handles semantic chunking of extracted document text.
"""
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

def chunk_document(document_id: str, text: str, max_chunk_size: int = 1000) -> List[Dict]:
    """
    Split document text into semantic chunks based on paragraphs/headings.
    """
    if not text:
        return []
        
    chunks = []
    # Split by double newline to roughly get paragraphs/sections
    raw_paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    current_chunk_content = []
    current_length = 0
    chunk_index = 0
    current_section = "General"
    
    for para in raw_paragraphs:
        # Very naive heuristic for detecting a heading (short, title-cased)
        if len(para) < 100 and (para.istitle() or para.isupper()):
            current_section = para
            
        para_len = len(para)
        
        if current_length + para_len > max_chunk_size and current_chunk_content:
            # Save the current chunk
            chunks.append({
                "document_id": document_id,
                "chunk_index": chunk_index,
                "section": current_section,
                "content": "\n\n".join(current_chunk_content)
            })
            chunk_index += 1
            current_chunk_content = [para]
            current_length = para_len
        else:
            current_chunk_content.append(para)
            current_length += para_len
            
    # Add the last chunk
    if current_chunk_content:
        chunks.append({
            "document_id": document_id,
            "chunk_index": chunk_index,
            "section": current_section,
            "content": "\n\n".join(current_chunk_content)
        })
        
    return chunks
