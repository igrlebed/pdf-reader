export type RegistryStatus = 'hidden' | 'visible'

export interface RegistryFunction {
  id: string
  number: number
  module: string
  function: string
  description: string
  subsection: string | null
  dtzPoint: string
  tzPoint: string
  status: RegistryStatus
  hasPdf: boolean
  pdfUrl: string | null
  pdfFileName: string | null
}

export interface RegistryCatalogFunction {
  name: string
  descriptions: string[]
  subsections: string[]
}

export interface RegistryCatalogModule {
  name: string
  functions: RegistryCatalogFunction[]
}

export interface RegistryFormPayload {
  module: string
  function: string
  description: string
  subsection: string | null
  dtzPoint: string
  tzPoint: string
  pdfFile?: File | null
}
