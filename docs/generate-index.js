/*
Generate an index.html file in the docs/ directory that lists all HTML files in that directory.
*/
let files = await Array.fromAsync(await Deno.readDir("./"))

let htmlFiles = files
  .filter((file) =>
    file.isFile && file.name.endsWith(".html") && file.name !== "index.html"
  )

let linkList = htmlFiles
  .reduce(
    (ul, file) => ul + `<li><a href="./${file.name}">${file.name}</a></li>\n`,
    "",
  )

let index = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Index</title>
</head>
<body>
    <h1>Documentation Index</h1>
    <ul>
${linkList}
    </ul>
</body>
</html>
`

await Deno.writeTextFile("./index.html", index)
console.log("Generated index.html with links to HTML files.")
