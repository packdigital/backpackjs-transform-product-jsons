const fs = require('fs-extra');
const { resolve } = require('path');

const uniq = (...values) => [...new Set(values.flat())];

const writeProductsUniq = (products, context) => {
  const path = resolve(context.target, 'public/json/products-uniq.json');
  const data = JSON.stringify({
    types: uniq(products.map((product) => product.productType)),
    vendors: uniq(products.map((product) => product.vendor)),
    options: uniq(
      products.flatMap((product) => Object.keys(product.optionsMap || {}))
    ),
  });

  return fs.outputFile(path, data);
};

const mapItemData = (product) => {
  const { variants } = product;
  const { Color: colors } = product.optionsMap;
  const findColor = (color) =>
    variants.find((variant) => variant.selectedOptionsMap.Color === color);

  return {
    id: product.id,
    handle: product.handle,
    isGrouped: product.isGrouped,
    legacyResourceId: product.legacyResourceId,
    optionsMap: product.optionsMap,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    priceRange: product.priceRange,
    productType: product.productType,
    publishedAt: product.publishedAt,
    tags: product.tags || [],
    title: product.title,
    totalInventory: product.totalInventory,
    updatedAt: product.updatedAt,
    images: product.images.slice(0, 2),
    variants: !colors ? variants.slice(0, 1) : colors.map(findColor),
  };
};

const writeProductItemToDisk = function writeProductItemToDisk(product) {
  const root = this.target;
  const pathname = 'public/json/products/item';
  const filename = `${product.handle}.json`;
  const path = resolve(root, pathname, filename);
  const data = JSON.stringify(product);
  return fs.outputFile(path, data);
};

module.exports = async (input) => {
  const productItems = input.products
    .map(mapItemData)
    .map(writeProductItemToDisk, input.context);

  const uniqProducts = writeProductsUniq(input.products, input.context);

  await Promise.all([uniqProducts, ...productItems]);

  return input;
};
