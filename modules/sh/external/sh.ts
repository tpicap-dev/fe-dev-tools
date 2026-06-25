import devServer from '../../../external/modules/dev-server/dev-server'

export default async (command: string) => {
  return devServer.get(`sh/${encodeURIComponent(command)}`)
    .then(result => result)
}