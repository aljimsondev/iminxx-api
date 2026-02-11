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
