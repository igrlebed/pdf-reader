export type RegistryStatus = 'hidden' | 'visible'

export interface RegistryFunction {
  id: string
  number: number
  module: string
  function: string
  description: string
  dtzPoint: string
  tzPoint: string
  status: RegistryStatus
  hasPdf: boolean
  pdfUrl: string | null
}
