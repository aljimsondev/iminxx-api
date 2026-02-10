import { bustSizesOptions } from './field-validation';
import { MetaobjectDefinitionInputType } from './setup-metaobject';

export const modelDefinitions: MetaobjectDefinitionInputType[] = [
  { key: 'label', name: 'Name', type: 'single_line_text_field' },
  {
    key: 'thumbnail',
    name: 'Photo',
    type: 'file_reference',
    validations: [{ name: 'file_type_options', value: '["Image"]' }],
  },
  {
    key: 'underbust',
    name: 'Underbust',
    type: 'single_line_text_field',
  },
  {
    key: 'overbust',
    type: 'single_line_text_field',
    name: 'Overbust',
  },
  {
    key: 'hip',
    type: 'single_line_text_field',
    name: 'Hip',
  },
  {
    key: 'bust_size',
    type: 'list.single_line_text_field',
    name: 'Bust Size',
    validations: [
      {
        name: 'options',
        value: JSON.stringify(
          bustSizesOptions.map((option) => ({
            name: option.replace(/[^a-zA-Z0-9]/g, ''),
            value: option,
          })),
        ),
      },
    ],
  },
];
