The issue is very clear from the logs: `node: bad option: --project`.

When I optimized the memory usage, I combined `node` command arguments with `ts-node` arguments incorrectly. `node` itself doesn't understand `--project` (that's a `ts-node` flag), but I passed it directly to `node`.

### The Plan
I need to fix the `start` script in `package.json` to correctly pass the project config to `ts-node` via environment variables or by using the `ts-node` executable directly, while still keeping the memory limit.

1.  **Fix `package.json`:**
    *   Change the start command to use `TS_NODE_PROJECT` environment variable.
    *   Correct the command structure so `node` gets the memory flags and `ts-node/register` gets the project config properly.

2.  **Push Fix:**
    *   Commit and push the change to GitHub.

This will resolve the `bad option` error, allowing the server to actually start, which fixes the 502 Bad Gateway and brings the bot online. The "vulnerabilities" warning is just a warning and not stopping the deploy.