import constants from '../../../../shared/constants.json' with { type: "json" }

export const getHead = async () => {
  let command = new Deno.Command('sh', {
    args: ['-c', 'cd "$1" && git show -s HEAD && echo "Branch: $(git branch --show-current)" && git reflog show --date=iso | grep -E "checkout:.*$(git branch --show-current)" | head -n 1 && echo "Tag: $(git tag --points-at HEAD)"', 'sh', constants.PROJECT_PATH],
    stdout: 'piped',
    stderr: 'piped'
  })

  let res = await command.output()

  if (res.code !== 0) {
    command = new Deno.Command('sh', {
      args: ['-c', 'git show -s HEAD && echo "Branch: $(git branch --show-current)" && git reflog show --date=iso | grep -E "checkout:.*$(git branch --show-current)" | head -n 1 && echo "Tag: $(git tag --points-at HEAD)"', 'sh'],
      stdout: 'piped',
      stderr: 'piped'
    })

    res = await command.output()

    if (res.code !== 0) {
      throw new Error(new TextDecoder().decode(res.stderr).trim())
    }
  }

  const content = new TextDecoder().decode(res.stdout)
  const rows = content.split('\n')

  return {
    commit: rows[0].split(' ')[1]?.trim(),
    date: rows.find(e => e.startsWith('Date:'))?.replace('Date:', '')?.trim(),
    message: rows[rows.findIndex(e => e.startsWith('Date:')) + 2]?.trim(),
    branch: rows.find(e => e.startsWith('Branch:'))?.replace('Branch:', '')?.trim(),
    branchSwitchTime: rows[rows.length - 3].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0] || '',
    tag: rows.find(e => e.startsWith('Tag:'))?.replace('Tag:', '')?.trim(),
  }
}