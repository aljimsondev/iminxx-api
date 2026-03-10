export const CREATE_METAFIELD_DEFINITION_QUERY = `mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      name
    }
    userErrors {
      field
      message
      code
    }
  }
}`;

export const CREATE_METAOBJECT_DEFINITION_QUERY = `mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition {
      id
      name
      type
      fieldDefinitions {
        name
        key
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}`;

export const FIND_METAOBJECT_DEFINITION_BY_TYPE = `query FindMetaobjectByType($type: String! ) {
  metaobjectDefinitionByType(type:$type) {
    id
    name
    type
    fieldDefinitions {
      name
      key
    }
  }
}`;

export const CREATE_METAOBJECT_QUERY = `mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject {
      handle
      id
    }
    userErrors {
      field
      message
      code
    }
  }
}`;

export const GET_METAOBJECT_ENTRY_BY_QUERY = `query GetMetaobjectsByQuery($type: String!, $query: String!) {
    metaobjects(type: $type, first: 1, query: $query) {
      nodes {
        handle
        id
        type
      }
    }
}`;

export const SET_METAFIELD_QUERY = `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}`;

export const UPDATE_METAOBJECT_QUERY = `mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
  metaobjectUpdate(id: $id, metaobject: $metaobject) {
    metaobject {
      handle
      updatedAt
      fields {
        value
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}`;
