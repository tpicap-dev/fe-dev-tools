import constants from '../../shared/constants.json' with { type: "json" };
import { resolve} from 'node:path'
import { init } from 'ramda'

export const runSh = async (commandArg: string, path = constants.PROJECT_PATH) => {
  const command = new Deno.Command('sh', {
    args: ['-c', 'cd "$1" && eval "$2"', 'sh', path, String(commandArg)],
    stdout: 'piped',
    stderr: 'piped'
  })

  const { code, stdout, stderr } = await command.output()

  if (code !== 0) {
    console.log(new TextDecoder().decode(stdout))
    throw new Error(new TextDecoder().decode(stderr).trim())
  }

  return new TextDecoder().decode(stdout)
}

export const fileExistsSync = (path: string): boolean => {
  try {
    Deno.statSync(path);
    return true;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return false;
    }
    throw e;
  }
}

export const pathToFilename = (path: string) => {
  return path.replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/[-]+/g, '-')
    .replace(/^[-]+/, '')
    .replace(/[-]+$/, '')
}

export const patchFile = async (path, newContent, initialContent) => {
  const uxPath = path.replace(/\\/g, '/')
  const initialContentFile = `${uxPath}.prev`
  const newContentFile = `${uxPath}.new`
  Deno.writeTextFileSync(resolve(initialContentFile), initialContent, {create: true})
  Deno.writeTextFileSync(resolve(newContentFile), newContent, {create: true})

  try {
    await runSh(`git merge-file ${uxPath} ${initialContentFile} ${newContentFile}`)
  } catch (e) {
    console.log(e)
  } finally {
    Deno.removeSync(resolve(initialContentFile))
    Deno.removeSync(resolve(newContentFile))
  }
}