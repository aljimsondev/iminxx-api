import axios from 'axios';
import 'dotenv/config';
import { SHOPIFY_GRAPHQL } from '../constants/constant';
import {
  GET_METAFIELD_QUERY,
  GET_PRODUCT_BY_ID_QUERY,
  GET_PRODUCTS_BY_QUERY,
  GET_PRODUCTS_BY_SKU_QUERY,
} from '../query/product.query';

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

  async getProductsByQuery(query: string, afterCursor?: string) {
    if (!query) throw new Error('Query is required!');

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: GET_PRODUCTS_BY_QUERY,
        variables: {
          query: query,
          afterCursor: afterCursor,
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
    const pagination = response?.data?.data?.products?.pageInfo;

    return {
      success: true,
      data: results,
      pagination: pagination,
    };
  }

  async getAllProducts(
    query: string,
  ): Promise<{ success: boolean; error?: any; data?: any }> {
    let products = [];
    let afterCursor: string | undefined = undefined;
    let error = null;

    while (true) {
      const res = await this.getProductsByQuery(query, afterCursor);

      if (!res.success) {
        error = res.error;

        break;
      }

      products.push(...res.data);

      if (!res.pagination?.hasNextPage) break;

      if (res.pagination?.endCursor) afterCursor = res.pagination.endCursor;
    }

    if (error) {
      return {
        success: false,
        error: error,
      };
    }

    return {
      success: true,
      data: products,
    };
  }

  async hasAssignedModel(productId: string) {
    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: GET_METAFIELD_QUERY,
        variables: {
          ownerId: productId,
          namespace: 'custom',
          key: 'product_models',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    const data = response?.data?.data;

    const metafield = data?.product?.metafield;

    if (!metafield) return false;

    const parsedValue = JSON.parse(metafield?.value);

    if (parsedValue.length > 0) return true;

    return false;
  }

  constructID(id: number | string) {
    return `gid://shopify/Product/${id}`;
  }

  async getProductById(id: string) {
    if (!id) throw new Error('Product ID is required!');

    const response = await axios.post(
      SHOPIFY_GRAPHQL,
      {
        query: GET_PRODUCT_BY_ID_QUERY,
        variables: {
          ownerId: this.constructID(id),
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.ADMIN_ACCESS_TOKEN,
        },
      },
    );

    const data = response.data.data?.product;

    return data;
  }

  async filterActiveProductIds(productIds: string[]) {
    const results = await Promise.all(
      productIds.map(async (id) => {
        const product = await this.getProductById(id);
        if (!product) return null;

        return id;
      }),
    );

    return results.filter(Boolean);
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
