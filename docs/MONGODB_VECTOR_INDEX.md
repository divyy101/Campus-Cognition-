# MongoDB Atlas Vector Search Configuration

The Campus Cognition V2 application utilizes MongoDB Atlas Vector Search to power the RAG (Retrieval-Augmented Generation) Study Assistant. 

Since Atlas Vector Search indexes must be created via the MongoDB Atlas UI, Atlas CLI, or Atlas Admin API (and cannot be created via standard PyMongo driver commands on the fly), you MUST create the following index manually for semantic search to work.

## Configuration Details

- **Database Name:** `test` (or whatever your default database is named in the URI)
- **Collection Name:** `document_chunks`
- **Index Name:** `default`

### JSON Index Definition

Go to the Atlas UI -> Data Explorer -> Select `document_chunks` -> Go to `Atlas Search` tab -> Create Search Index -> Choose `JSON Editor` -> Paste the following configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "document_id"
    }
  ]
}
```

### Why these values?
- **numDimensions: 1536**: This matches the dimensions of the OpenAI `text-embedding-3-small` model used in `services/embedding_service.py`.
- **similarity: "cosine"**: Standard similarity metric for OpenAI embeddings.
- **filter on `document_id`**: Essential for restricting RAG retrieval to the specific user's documents during a session to maintain privacy and relevance.

Without this index, requests to the `/api/rag/ask` endpoint will return an empty context or fail.
