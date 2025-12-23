import DevServer from 'external/modules/dev-server/dev-server'

export const fetchGitSummary = (varName?: string) => {
  return DevServer.get('git/summary', varName)
}