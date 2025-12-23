import constants from '../../../../shared/constants.json' with { type: "json" }

export const getHead = async () => {
  const command = new Deno.Command('sh', {
    args: ['-c', 'cd "$1" && git show --stat HEAD && git branch --show-current && git reflog show --date=iso | grep -E "checkout:.*$(git branch --show-current)" | head -n 1', 'sh', constants.PROJECT_PATH],
    stdout: 'piped',
    stderr: 'piped'
  })

  const { code, stdout, stderr } = await command.output()

  if (code !== 0) {
    throw new Error(new TextDecoder().decode(stderr).trim())
  }

  const content = new TextDecoder().decode(stdout).trim()
  const rows = content.split('\n')
  console.log(JSON.stringify(rows, null, 2))

  return {
    commit: rows[0].split(' ')[1]?.trim(),
    date: rows.find(e => e.startsWith('Date:'))?.replace('Date:', '')?.trim(),
    message: rows[rows.findIndex(e => e.startsWith('Date:')) + 2]?.trim(),
    branch: rows[rows.length - 2]?.trim(),
    branchSwitchTime: rows[rows.length - 1].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0] || ''
  }
}