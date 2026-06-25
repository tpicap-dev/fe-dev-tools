import constants from '../../../shared/constants.json' with { type: "json" }

export default async (commandStr: string) => {
  let projectFolderExists
  try {
    const stat = await Deno.stat(constants.PROJECT_PATH)
    projectFolderExists = stat.isDirectory;
  } catch (e) {
    projectFolderExists = false
  }
  try {
    let command
    if (projectFolderExists) {
      command = new Deno.Command('sh', {
        args: ['-c', `cd ${constants.PROJECT_PATH} && ${commandStr}`, 'sh', constants.PROJECT_PATH],
        stdout: 'piped',
        stderr: 'piped'
      })
    } else {
      command = new Deno.Command('sh', {
        args: ['-c', `${commandStr}`, 'sh'],
        stdout: 'piped',
        stderr: 'piped'
      })
    }

    const {code, stdout, stderr} = await command.output()

    if (code !== 0) {
      throw new Error(new TextDecoder().decode(stderr).trim())
    }

    const content = new TextDecoder().decode(stdout)

    return content
  } catch (e) {
    console.error(e)
  }
}