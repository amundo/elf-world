import { serveDir } from "jsr:@std/http"

Deno.serve({ port: 1111 }, async (req) => {
  const url = new URL(req.url)
  const pathname = url.pathname
  const method = req.method

  if (method === "GET" && pathname === "/list") {
    await Deno.mkdir(DATA_DIR, { recursive: true })
    const entries = []

    for await (const dirEntry of Deno.readDir(DATA_DIR)) {
      const filePath = `${DATA_DIR}/${dirEntry.name}`
      const stat = await Deno.stat(filePath)
      const entry = {
        name: dirEntry.name,
        size: stat.size,
        type: dirEntry.isFile ? "file" : "dir",
        modified: stat.mtime?.toISOString() ?? null,
      }

      if (dirEntry.name.endsWith(".json")) {
        try {
          const json = JSON.parse(await Deno.readTextFile(filePath))
          entry.metadata = json.metadata ?? null
        } catch {
          entry.metadata = null
        }
      }

      entries.push(entry)
    }

    logger.info(`Listed ${entries.length} files`)
    return new Response(JSON.stringify(entries, null, 2), {
      headers: { "content-type": "application/json" },
    })
  }

  return await serveDir(req, {
    fsRoot: "/Users/patrickhall/Sites/",
    quiet: false,
    showDirListing: true,
  })
})
