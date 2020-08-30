/* eslint-disable @typescript-eslint/no-explicit-any */
import { toIdentifier } from "./shared"
import {
  IData,
  IItemDetails,
  IListDetails,
  IPagingParams,
  IResourceComplete,
} from "./types"

export interface IError {
  status: string
  title: string
}

export interface IPagingMeta {
  offset: number
  limit: number
  total: number
  links: {
    first: string
    last: string
    prev: string
    next: string
  }
}

export interface IMeta {
  page?: IPagingMeta
  [key: string]: any
}

export interface IDocumentExtras {
  errors?: Array<IError>
  meta?: IMeta
  included?: Array<IResourceComplete>
}

export interface IDocument extends IDocumentExtras {
  jsonapi: {
    version: "1.0"
  }
  data: IData
}

export interface IRendererResponse {
  data: IData
  extra?: IDocumentExtras
}

export type IRendererFunction = (
  data: any,
  paging?: IPagingParams,
  prefix?: string,
) => IRendererResponse

export function renderDocument({ data, extra }: IRendererResponse): IDocument {
  return {
    jsonapi: {
      version: "1.0",
    },
    data,
    ...(extra || {}),
  } as IDocument
}

export function renderItemResult(itemDetails: IItemDetails): IRendererResponse {
  return {
    data: itemDetails.item,
    extra: {
      ...(itemDetails.includes ? { included: itemDetails.includes } : {}),
    },
  }
}

export function renderListResults(
  listDetails: IListDetails,
  additionalMeta?: { [key: string]: any },
): IRendererResponse {
  return {
    data: listDetails.pageItems,
    extra: {
      ...(listDetails.includes ? { included: listDetails.includes } : {}),
      ...(additionalMeta || {}),
    },
  }
}

export function renderRelationshipResult(
  details: IItemDetails | IListDetails,
): IRendererResponse {
  if ((details as any).item) {
    return renderItemResult(details as IItemDetails)
  } else {
    return renderListResults(details as IListDetails)
  }
}

export function renderListResultsAsIdentifiers(
  listDetails: IListDetails,
): IRendererResponse {
  return renderListResults({
    totalItems: listDetails.totalItems,
    pageItems: listDetails.pageItems.map(toIdentifier),
    includes: listDetails.includes,
  })
}
