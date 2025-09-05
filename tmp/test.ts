const process = Deno.run({
  cmd: ["deno2", 'task', 'build-external'],
  stdout: 'piped'
})

const output = await process.output()
console.log(new TextDecoder().decode(output))

process.close()