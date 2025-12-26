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
    }));

    return {
      ...rest,
      category: category.name,
      bundles,
    };
  }
}
