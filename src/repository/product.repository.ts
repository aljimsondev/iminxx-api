import axios from 'axios';
import 'dotenv/config';
import { SHOPIFY_GRAPHQL } from '../constants/constant';
import { GET_PRODUCTS_BY_SKU_QUERY } from '../query/product.query';

export default class ProductRepository {
  constructProductBundleDetails(data: {
    productByIdentifier: {
      [key: string]: any;
    };
  }) {
    const { bundleComponents, id, category, ...rest } =
      data.productByIdentifier;
    const bundlesRaw: any[] = bundleComponents?.nodes || [];

    const bundles = bundlesRaw.map((_bundle) => ({
      category: _bundle.componentProduct.category.name,
      type: _bundle.componentProduct.productType,
      title: _bundle.componentProduct.title,
      options: extractoptions(_bundle.optionSelections),
    }));

    return {
      ...rest,
      category: category.name,
      bundles,
    };
  }

  async getProductBySKU(sku: string) {
    if (!sku) throw new Error('Product SKU is required!');

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: GET_PRODUCTS_BY_SKU_QUERY,
        variables: {
          query: `sku:${sku}`,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    if (response?.data?.errors?.length > 0) {
      return {
        success: false,
        error: response.data.errors,
      };
    }

    const results = response?.data?.data?.products?.nodes;

    return {
      success: true,
      data: results,
    };
  }
}

function extractoptions(options: any) {
  if (Array.isArray(options)) {
    const productOptions = options.map((option: any) => {
      const variantOptions = option?.values || [];
      const allOptions = variantOptions.map(
        (opt: { value: string }) => opt.value,
      );

      return allOptions;
    });

    return productOptions;
  }

  return [];
}
