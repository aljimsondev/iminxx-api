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
