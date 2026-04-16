import { MetaobjectDefinitionInputType } from './core';
import {
  bodysuitSizeOptions,
  braSizeOptions,
  bustSizesOptions,
  cheekieSizeOptions,
  loungePantSizeOptions,
  loungeShortSizeOptions,
  loungeTopSizeOptions,
  maxSculptorSizeOptions,
  shapewearSizeOptions,
  thermalPantSizeOptions,
  thermalTopSizeOptions,
  ukSizeBottomsOptions,
} from './field-validation';

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
    type: 'single_line_text_field',
    name: 'Bust Size',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(bustSizesOptions),
      },
    ],
  },
  {
    key: 'waist',
    name: 'Waist',
    type: 'single_line_text_field',
  },
  {
    key: 'height',
    name: 'Height',
    type: 'single_line_text_field',
  },
  {
    name: 'UK Size (Bottoms)',
    key: 'uk_size_bottoms',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(ukSizeBottomsOptions),
      },
    ],
  },
  {
    name: "I'M IN Bra Size",
    key: 'im_in_bra_size',
    type: 'list.single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(braSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Bodysuit Size",
    key: 'i_m_in_bodysuit_size',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(bodysuitSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Lounge Top Size",
    key: 'i_m_in_lounge_top_size',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(loungeTopSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Thermal Top Size",
    key: 'i_m_in_thermal_top_size',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(thermalTopSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Thermal Pants Size",
    key: 'i_m_in_thermal_pants_size',
    type: 'single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(thermalPantSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Cheekie Size",
    key: 'i_m_in_cheekie_size',
    type: 'list.single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(cheekieSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Shapewear Size",
    key: 'im_in_shapewear_size',
    type: 'list.single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(shapewearSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Max Sculptor Size",
    key: 'im_in_max_sculptor_size',
    type: 'list.single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(maxSculptorSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Lounge Short Size",
    key: 'im_in_lounge_short_size',
    type: 'list.single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(loungeShortSizeOptions),
      },
    ],
  },
  {
    name: "I'M IN Lounge Pants Size",
    key: 'i_m_in_lounge_pants_size',
    type: 'list.single_line_text_field',
    validations: [
      {
        name: 'choices',
        value: JSON.stringify(loungePantSizeOptions),
      },
    ],
  },
];

export const customDiscountDetailsDefinition = [
  {
    name: 'Discount Title',
    key: 'discount_title',
    type: 'single_line_text_field',
  },
  {
    key: 'details',
    name: 'Details',
    type: 'rich_text_field',
  },
];
