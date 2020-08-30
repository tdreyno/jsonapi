/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNumber, isString, mapValues, omit } from "lodash"
import { toIdentifier } from "./shared"
import { IAttributes, IRelationships, IResourceComplete } from "./types"

function isSourceIdReference(key: string): boolean {
  // Matches sourceId or SourceId... seemed more readable than
  // the regex version.
  return key.endsWith("ourceId")
}

function isInternalIdReference(key: string): boolean {
  return key.endsWith("Id") && !isSourceIdReference(key)
}

export class Serializer {
  name: string
  prefix: string
  attributes: Array<string>
  relationships: Array<string>
  ignoredKeys: Array<string>

  constructor(
    name: string,
    prefix: string,
    attributes?: Array<string> | null,
    relationships?: Array<string> | null,
    ignoredKeys?: Array<string> | null,
  ) {
    this.name = name
    this.prefix = prefix
    this.attributes = attributes || []
    this.relationships = relationships || []
    this.ignoredKeys = ["extra", "createdAt"].concat(ignoredKeys || [])
  }

  deserialize(resource: IResourceComplete): any {
    const modelAttributesWithStringIds = resource.attributes
    const modelAttributes = mapValues(
      modelAttributesWithStringIds,
      (value, key) => {
        return key && isInternalIdReference(key) && isString(value)
          ? parseInt(value, 10)
          : value
      },
    )

    return {
      ...omit(resource, ["relationships", "attributes", "links"]),
      ...modelAttributes,
      ...(resource.relationships
        ? Object.keys(resource.relationships).reduce((sum, key) => {
            sum[key] = (resource.relationships as IRelationships)[key].data

            return sum
          }, {} as any)
        : {}),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  serialize(model: any, _?: any): IResourceComplete {
    const removeKeys = ["id", "type"].concat(this.relationships)
    const modelAttributesWithIntIds = omit(
      model,
      removeKeys,
      this.ignoredKeys,
    ) as IAttributes
    const modelAttributes = mapValues(
      modelAttributesWithIntIds,
      (value, key) => {
        return key && isInternalIdReference(key) && isNumber(value)
          ? value.toString()
          : value
      },
    )

    const relationships = this.relationships.map(name => {
      const data = model[name]

      if (typeof data === "number") {
        return { name, data }
      }

      const asIdentifiers =
        data &&
        (Array.isArray(data) ? data.map(toIdentifier) : toIdentifier(data))

      return { name, data: asIdentifiers }
    })

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const selfLink = `${this.prefix}/${model.id}`

    let resource = {
      id: model.id && model.id.toString(),
      type: this.name,
      // attributes: fields && fields[this.name] ? pick(modelAttributes, fields[this.name]) : modelAttributes,
      attributes: modelAttributes,
      links: {
        self: selfLink,
      },
    }

    if (relationships.length) {
      const rels = relationships.reduce((sum, r) => {
        const relationshipData = {
          links: {
            self: `${selfLink}/relationships/${r.name}`,
            related: `${selfLink}/${r.name}`,
          },
          ...(typeof r.data !== "number"
            ? r.data
              ? { data: r.data || null }
              : undefined
            : { meta: { total: r.data } }),
        }

        sum[r.name] = relationshipData

        return sum
      }, {} as any)

      resource = {
        ...resource,
        // relationships: fields && fields[this.name] ? pick(rels, fields[this.name]) : rels,
        relationships: rels,
        // TODO(ldixon): fix broken typing. It things relationships does not exist.
      } as any
    }

    return resource
  }
}
