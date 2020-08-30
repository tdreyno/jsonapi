/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from "express"
import {
  IFields,
  IFilters,
  IItemDetails,
  IListDetails,
  INewResource,
  IPagingParams,
  IParams,
  IResource,
  IResourceComplete,
  IResourceID,
  IResourceIdentifier,
  IStatusError,
} from "./types"

export function toIdentifier(resource: IResource): IResourceIdentifier {
  return { id: resource.id.toString(), type: resource.type }
}

export type IGetHandlerFunction = (
  req: express.Request,
  paging: IPagingParams,
  include: Array<string>,
  filters: IFilters,
  sort: Array<string>,
  fields: IFields,
) => Promise<IItemDetails | IListDetails | IStatusError | void>

export type IPostHandlerFunction = (
  req: express.Request,
) => Promise<IItemDetails | IStatusError | void>

export type IDeleteHandlerFunction = (
  req: express.Request,
) => Promise<IItemDetails | IStatusError | void>

export interface IModelHandler {
  list<T>(
    type: string,
    params: IParams,
    getter?: (params: any) => Promise<Array<T>>,
    counter?: (params: any) => Promise<number>,
  ): Promise<IListDetails>

  search(
    type: string,
    attribute: string,
    value: string,
    params: IParams,
  ): Promise<IListDetails | void>

  get(
    type: string,
    id: IResourceID,
    params: Pick<IParams, "include" | "fields">,
  ): Promise<IItemDetails | IStatusError | void>

  listRelationships(
    type: string,
    id: IResourceID,
    relationship: string,
    params: IParams,
  ): Promise<IListDetails | IItemDetails | IStatusError | void>

  create(type: string, data: INewResource): Promise<IItemDetails>

  addRelationships(
    type: string,
    id: IResourceID,
    relationship: string,
    items: Array<IResourceIdentifier>,
  ): Promise<void>

  destroy(type: string, id: IResourceID): Promise<void>

  destroyRelationships(
    type: string,
    id: IResourceID,
    relationship: string,
    items: Array<IResourceIdentifier>,
  ): Promise<void>

  update(
    type: string,
    id: IResourceID,
    data: IResourceComplete,
  ): Promise<IItemDetails | IStatusError | void>

  updateRelationships(
    type: string,
    id: IResourceID,
    relationship: string,
    data: IResourceIdentifier | Array<IResourceIdentifier>,
  ): Promise<void>
}
