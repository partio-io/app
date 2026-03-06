# Go Backend: Table-Driven Endpoint Tests with Snapshot (Golden File) Testing

## Context

The backend has 19 HTTP endpoints, 0 test files, and no test infrastructure. All handlers follow the same pattern: extract session → create GitHub client → call GitHub function → return JSON. We need a test suite that:

1. Uses **table-driven tests** for every endpoint
2. Uses **golden file snapshots** (`testdata/*.golden`) for expected JSON responses
3. Runs with `go test ./...` and supports `-update` flag to regenerate snapshots

---

## Architecture: How to Mock the GitHub API

**Problem:** Handlers create GitHub clients inline via `github.NewClient(ctx, token)`, which builds an `oauth2` HTTP client pointing at `api.github.com`. There's no dependency injection.

**Solution:** Add a `BaseURL` package variable to `internal/github/client.go`. Tests set it to point at an `httptest.Server`. The real code leaves it empty (no behavior change).

```go
// client.go — add BaseURL support
var BaseURL string

func NewClient(ctx context.Context, token string) *gh.Client {
    ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
    tc := oauth2.NewClient(ctx, ts)
    client := gh.NewClient(tc)
    if BaseURL != "" {
        client.BaseURL, _ = url.Parse(BaseURL)
    }
    return client
}
```

**Session injection:** Add `ContextWithSession` to `internal/auth/middleware.go` so tests can inject a session into the request context without needing real cookies.

---

## Files to Create

### 1. `internal/handlers/handlers_test.go` — Main endpoint test suite

Table-driven tests covering all 19 endpoints. Each test case:
- Name, HTTP method, path, query params
- Expected status code
- Golden file name for snapshot comparison

Structure:
```go
var update = flag.Bool("update", false, "update golden files")

func TestEndpoints(t *testing.T) {
    mock := newMockGitHub(t)      // start mock server
    github.BaseURL = mock.URL + "/"
    defer func() { github.BaseURL = "" }()

    router := buildTestRouter()    // chi router with all routes registered

    tests := []struct {
        name   string
        method string
        path   string
        status int
        golden string
    }{
        {"health check",       "GET", "/api/v1/health", 200, "health.golden"},
        {"list branches",      "GET", "/api/v1/cache/repos/octocat/hello/branches", 200, "list_branches.golden"},
        {"list commits",       "GET", "/api/v1/cache/repos/octocat/hello/commits", 200, "list_commits.golden"},
        {"get commit",         "GET", "/api/v1/cache/repos/octocat/hello/commits/abc123", 200, "get_commit.golden"},
        {"repo detail",        "GET", "/api/v1/cache/repos/octocat/hello", 200, "repo_detail.golden"},
        {"get contents dir",   "GET", "/api/v1/cache/repos/octocat/hello/contents", 200, "get_contents_dir.golden"},
        {"get contents file",  "GET", "/api/v1/cache/repos/octocat/hello/contents/README.md", 200, "get_contents_file.golden"},
        {"list contributors",  "GET", "/api/v1/cache/repos/octocat/hello/contributors", 200, "list_contributors.golden"},
        {"list pulls",         "GET", "/api/v1/cache/repos/octocat/hello/pulls", 200, "list_pulls.golden"},
        {"get pull",           "GET", "/api/v1/cache/repos/octocat/hello/pulls/1", 200, "get_pull.golden"},
        {"list issues",        "GET", "/api/v1/cache/repos/octocat/hello/issues", 200, "list_issues.golden"},
        {"get issue",          "GET", "/api/v1/cache/repos/octocat/hello/issues/42", 200, "get_issue.golden"},
        {"get activity",       "GET", "/api/v1/cache/repos/octocat/hello/activity", 200, "get_activity.golden"},
        {"list checkpoints",   "GET", "/api/v1/cache/repos/octocat/hello/checkpoints", 200, "list_checkpoints.golden"},
        {"get checkpoint",     "GET", "/api/v1/cache/repos/octocat/hello/checkpoints/ab1234567890", 200, "get_checkpoint.golden"},
        {"get diff",           "GET", "/api/v1/cache/repos/octocat/hello/checkpoints/ab1234567890/diff", 200, "get_diff.golden"},
        {"get session",        "GET", "/api/v1/cache/repos/octocat/hello/checkpoints/ab1234567890/session", 200, "get_session.golden"},
        {"get plan",           "GET", "/api/v1/cache/repos/octocat/hello/checkpoints/ab1234567890/plan", 200, "get_plan.golden"},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Build request with session in context
            // Record response
            // Compare against golden file (or update if -update flag)
        })
    }
}
```

Additional test functions:
- `TestEndpoints_Unauthorized` — requests without session → 401
- `TestEndpoints_GitHubError` — mock returns 500 → handler returns error JSON
- `TestEndpoints_CacheHit` — pre-populate cache, verify cached response is served

### 2. `internal/handlers/mock_github_test.go` — Mock GitHub API server

Sets up an `httptest.Server` with `http.ServeMux` handlers for all GitHub API routes the handlers call:

| Mock Route | Returns |
|---|---|
| `GET /user/repos` | 2 repos (octocat/hello, octocat/world) |
| `GET /repos/octocat/hello` | repo detail fixture |
| `GET /repos/octocat/hello/git/ref/heads/partio/checkpoints/v1` | ref → SHA |
| `GET /repos/octocat/hello/git/commits/{sha}` | commit → tree SHA |
| `GET /repos/octocat/hello/git/trees/{sha}` | tree with metadata.json + blob entries |
| `GET /repos/octocat/hello/git/blobs/{sha}` | base64-encoded blob content |
| `GET /repos/octocat/hello/commits` | list of commits |
| `GET /repos/octocat/hello/commits/{sha}` | single commit with files/stats |
| `GET /repos/octocat/hello/contents/` | directory listing |
| `GET /repos/octocat/hello/contents/README.md` | file content |
| `GET /repos/octocat/hello/stats/commit_activity` | weekly stats array |
| `GET /repos/octocat/hello/branches` | branch list |
| `GET /repos/octocat/hello/contributors` | contributor list |
| `GET /repos/octocat/hello/pulls` | PR list |
| `GET /repos/octocat/hello/pulls/1` | PR detail |
| `GET /repos/octocat/hello/issues` | issue list (mix of issues + PRs) |
| `GET /repos/octocat/hello/issues/42` | issue detail |

All fixtures use deterministic data (fixed dates, SHAs, names) so golden files are stable.

### 3. `internal/handlers/testdata/*.golden` — Snapshot files (18 files)

One per endpoint. Generated on first run with `go test -update ./internal/handlers/...`.

### 4. `internal/github/session_test.go` — ParseSession unit tests

Table-driven tests for the pure `ParseSession` function (no mocking needed):
- Empty input
- Single user message
- Multiple messages with tool use blocks
- System tags stripped
- Invalid JSON lines skipped
- Messages with contentBlocks

### 5. `internal/cache/cache_test.go` — Cache unit tests

- Set/Get round-trip
- TTL expiration
- Delete by prefix
- Concurrent access safety

---

## Files to Modify

### `internal/github/client.go`
Add `BaseURL` variable and conditional `client.BaseURL` override (5 lines).

### `internal/auth/middleware.go`
Add `ContextWithSession` function (3 lines):
```go
func ContextWithSession(ctx context.Context, sess *Session) context.Context {
    return context.WithValue(ctx, sessionKey, sess)
}
```

---

## Golden File Workflow

```bash
# Generate/update all snapshots:
go test -update ./internal/handlers/...

# Run tests (compare against saved snapshots):
go test ./internal/handlers/...

# Run all tests:
go test ./...
```

---

## Verification

1. `go test ./...` — all tests pass
2. `make lint` — no new lint issues
3. `make all` — full pipeline still clean
