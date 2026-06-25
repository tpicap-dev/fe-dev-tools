import DevServer from 'external/modules/dev-server/dev-server'

export interface IGitSummary {
  commit: string,
  date: string,
  message: string,
  branch: string,
  branchSwitchTime: string,
  tag: string,
}

export const fetchGitSummary = (varName?: string): Promise<IGitSummary> => {
  return DevServer.get('git/summary', varName)
}