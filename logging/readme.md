PUT log-000001
```json
{
  "aliases": {
    "log-write-alias": {
      "is_write_index": true
    }
  }
}
```

PUT _index_template/logs_template
```json
{
  "index_patterns": ["log-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "data-retention-policy",
      "index.lifecycle.rollover_alias": "log-write-alias"
    }
  }
}
```
